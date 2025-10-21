import { useEffect } from 'react';
import { refreshToken } from '../services/authService';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { logout, setUserRedux } from '../store/slices/userSlice';
import { isTokenExpired } from '../utils/tokenUtils';

export function useAuthCheck() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const CHECK_INTERVAL_MS = 60 * 1000;

  useEffect(() => {
    if (!user?.accessToken || !user?.refreshToken || !user?.userId) {
      return undefined;
    }

    const handleRefreshToken = async () => {
      if (!isTokenExpired(user.accessToken)) {
        return;
      }

      try {
        const response = await refreshToken(user.userId, user.refreshToken);
        if (response?.isSuccess) {
          const updatedUser = {
            ...user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
          dispatch(setUserRedux(updatedUser));
          Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        dispatch(logout());
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    };

    handleRefreshToken();
    const interval = setInterval(handleRefreshToken, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, dispatch]);
}

import { useEffect, useState } from 'react';
import { refreshToken } from '../services/authService';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { logout, setUserRedux } from '../store/slices/userSlice';

export function useAuthCheck() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [tokenStartTime, setTokenStartTime] = useState(0);

  const TOKEN_LIFETIME_MS = 180 * 60 * 1000;

  useEffect(() => {
    if (!user.accessToken && Cookies.get('user')) {
      setTokenStartTime(null);
      return;
    }
    if (!tokenStartTime) {
      const now = Date.now();
      setTokenStartTime(now);
    }

    const handleRefreshToken = async () => {
      try {
        const response = await refreshToken(user.refreshToken, user.userId);
        if (response.isSuccess === true) {
          const updatedUser = {
            ...user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
          dispatch(setUserRedux(updatedUser));
          Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
          setTokenStartTime(Date.now());
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        dispatch(logout());
        Cookies.remove('user');
        window.location.href('/login');
        setTokenStartTime(0);
      }
    };
    // Kiểm tra mỗi phút xem token có hết hạn chưa
    const interval = setInterval(() => {
      if (tokenStartTime && Date.now() - tokenStartTime >= TOKEN_LIFETIME_MS) {
        handleRefreshToken();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [user.accessToken, tokenStartTime, user, dispatch, TOKEN_LIFETIME_MS]);
}

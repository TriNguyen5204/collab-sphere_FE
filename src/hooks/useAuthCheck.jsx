import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { refreshToken } from "../services/authService";
import { logout, setUserRedux } from "../store/slices/userSlice";

export function useAuthCheck() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const REFRESH_INTERVAL_MS = 30 * 60 * 1000; 
  const intervalRef = useRef(null); // ngăn tạo interval trùng

  useEffect(() => {
    if (!user?.accessToken || !user?.refreshToken || !user?.userId) return;

    const runRefresh = async () => {
      const now = Date.now();
      const expiry = new Date(user.refreshTokenExpiryTime).getTime();

      // ⛔ Refresh token hết hạn → logout
      if (now >= expiry) {
        dispatch(logout());
        Cookies.remove("user");
        window.location.href = "/login";
        console.log("⛔ Refresh token expired. Logging out.");
        return;
      }

      // 🔄 Gọi refresh token
      try {
        const res = await refreshToken(user.userId, user.refreshToken);

        if (res?.isSuccess) {
          const updated = {
            ...user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };

          dispatch(setUserRedux(updated));
          Cookies.set("user", JSON.stringify(updated), { expires: 7 });

          console.log("🔄 Token refreshed");
        }else{
          dispatch(logout());
          Cookies.remove("user");
          window.location.href = "/login";
          console.log("⛔ Refresh token invalid. Logging out.");
        }
      } catch (err) {
        console.error(err);
        dispatch(logout());
        Cookies.remove("user");
        window.location.href = "/login";
      }
    };

    // 🛑 Nếu interval đã tồn tại → không tạo lại nữa
    if (!intervalRef.current) {
      intervalRef.current = setInterval(runRefresh, REFRESH_INTERVAL_MS);
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [user]);
}

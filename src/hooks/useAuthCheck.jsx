import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { refreshToken } from "../services/authService";
import { logout, setUserRedux } from "../store/slices/userSlice";
import { isTokenExpired } from "../utils/tokenUtils";

export function useAuthCheck() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const REFRESH_BUFFER_MS = 2 * 60 * 1000; // refresh 2 minutes before expiry
  const MIN_REFRESH_INTERVAL_MS = 60 * 1000; // do not spam backend; min 1 minute
  const DEFAULT_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // fallback if expiry unknown
  const timeoutRef = useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleRefresh = () => {
    clearTimer();

    if (!user?.refreshTokenExpiryTime) {
      timeoutRef.current = setTimeout(runRefresh, DEFAULT_REFRESH_INTERVAL_MS);
      return;
    }

    const expiryTime = new Date(user.refreshTokenExpiryTime).getTime();
    if (Number.isNaN(expiryTime)) {
      timeoutRef.current = setTimeout(runRefresh, DEFAULT_REFRESH_INTERVAL_MS);
      return;
    }

    let delay = expiryTime - Date.now() - REFRESH_BUFFER_MS;
    if (delay <= 0) {
      runRefresh();
      return;
    }

    delay = Math.max(delay, MIN_REFRESH_INTERVAL_MS);
    timeoutRef.current = setTimeout(runRefresh, delay);
  };

  const handleLogout = (reason) => {
    console.warn("[Auth] Ending session:", reason);
    dispatch(logout());
    Cookies.remove("user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const runRefresh = async () => {
    if (!user?.refreshToken || !user?.userId) {
      handleLogout("Missing refresh token or user id");
      return;
    }

    const expiry = user.refreshTokenExpiryTime ? new Date(user.refreshTokenExpiryTime).getTime() : null;
    if (expiry && Date.now() >= expiry) {
      handleLogout("Refresh token expired");
      return;
    }

    try {
      const res = await refreshToken(Number(user.userId), user.refreshToken);

      if (res?.isSuccess) {
        const updated = {
          ...user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          refreshTokenExpiryTime: res.refreshTokenExpiryTime ?? user.refreshTokenExpiryTime,
        };

        dispatch(setUserRedux(updated));
        Cookies.set("user", JSON.stringify(updated), { expires: 7 });
        // Effect will re-run with updated user and schedule the next refresh.
        return;
      }

      handleLogout("Refresh endpoint returned failure");
    } catch (error) {
      console.error("[Auth] Refresh call threw", error);
      handleLogout("Refresh call error");
    }
  };

  useEffect(() => {
    if (!user?.accessToken || !user?.refreshToken || !user?.userId) {
      clearTimer();
      return;
    }

    if (isTokenExpired(user.accessToken)) {
      runRefresh();
    } else {
      scheduleRefresh();
    }

    return () => {
      clearTimer();
    };
  }, [user]);
}

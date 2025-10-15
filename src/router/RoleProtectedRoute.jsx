import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleLandingRoute } from '../constants/roleRoutes';

const normalizeRole = (role) => {
  if (!role) return '';
  return role.toString().toUpperCase().replace(/[\s_-]+/g, '');
};

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const { accessToken, roleName } = user || {};

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowedRoleSet = new Set((allowedRoles || []).map(normalizeRole));
  const normalizedUserRole = normalizeRole(roleName);

  if (!allowedRoleSet.has(normalizedUserRole)) {
    console.warn('Unauthorized route access blocked', {
      attemptedPath: location.pathname,
      userRole: roleName,
      allowedRoles,
    });
    const fallbackRoute = getRoleLandingRoute(roleName);
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname, fallbackRoute }} />;
  }

  return children;
};

export default RoleProtectedRoute;

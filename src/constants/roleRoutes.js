const ROLE_ROUTE_MAP = {
  student: '/student',
  lecturer: '/lecturer/classes',
  headdepartment: '/head-department',
  staff: '/staff/lecturers',
  admin: '/admin',
};

export const getRoleLandingRoute = (roleName) => {
  if (!roleName) return '/';
  const normalizedRole = roleName
    .toString()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

  return ROLE_ROUTE_MAP[normalizedRole] || '/';
};

export default ROLE_ROUTE_MAP;

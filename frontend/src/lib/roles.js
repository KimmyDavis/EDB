export const USER_ROLE = "user";
export const MEDIA_ROLE = "media";
export const LITURGY_ROLE = "liturgy";
export const ADMIN_ROLE = "admin";

export const normalizeUserRole = (roleValue) => {
  if (Array.isArray(roleValue)) return roleValue[0] || USER_ROLE;
  if (typeof roleValue === "string")
    return roleValue.split(",")[0] || USER_ROLE;
  return USER_ROLE;
};

export const canAccessRole = (userRoleValue, requiredRole = USER_ROLE) => {
  const userRole = normalizeUserRole(userRoleValue);

  if (requiredRole === USER_ROLE) return true;
  if (userRole === ADMIN_ROLE) return true;
  if (requiredRole === ADMIN_ROLE) return userRole === ADMIN_ROLE;

  return userRole === requiredRole;
};

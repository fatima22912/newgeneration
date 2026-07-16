export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
};

export function hasRole(user, ...allowedRoles) {
  return Boolean(user) && allowedRoles.includes(user.role);
}

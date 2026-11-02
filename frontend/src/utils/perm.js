// frontend/src/utils/perm.js

// Get permissions array (for normal roles)
export function getPerms() {
  try {
    return JSON.parse(localStorage.getItem("perms") || "[]");
  } catch {
    return [];
  }
}

// Helper: get logged-in user
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function isSuperAdmin(passedUser, passedPerms) {
  const user = passedUser || getUser();
  const perms = (passedPerms || getPerms() || []).map(p => String(p).toLowerCase());

  const roleTitle = String(user?.role_title || user?.role || user?.role?.title || "").toLowerCase().trim();
  const normalizedRole = roleTitle.replace(/[\s_-]+/g, "");

  return Boolean(
    user?.role_id === 6 ||
    user?.role_id === "6" ||
    normalizedRole === "superadmin" ||
    user?.is_super_admin === true ||
    user?.isSuper === true ||
    perms.includes("access") ||
    perms.includes("super_admin") ||
    perms.includes("superadmin")
  );
}

export function can(required, passedUser, passedPerms) {
  if (!required) return true;

  const user = passedUser || getUser();
  const perms = (passedPerms || getPerms() || []).map(p => String(p).toLowerCase());

  // 🔥 SUPER ADMIN BYPASS
  if (isSuperAdmin(user, perms)) return true;

  const req = String(required).toLowerCase();

  // Access Control management (/access, /access/roles, /access/users) is strictly Super Admin only
  if (req === "access") {
    return false;
  }

  // Check if the permission (e.g. "settings", "all_staff", etc.) is assigned to this role in Access Control
  return perms.includes(req);
}

/**
 * Returns the first route the user has permission for.
 * Defaults to '/dashboard' if they have it, or the first available.
 * If no permissions, returns '/login'.
 */
export function getSafePath(passedUser, passedPerms) {
  const user = passedUser || getUser();
  const perms = (passedPerms || getPerms() || []).map(p => String(p).toLowerCase());

  // 🔥 SUPER ADMIN BYPASS
  if (isSuperAdmin(user, perms)) {
    return "/dashboard";
  }

  const map = [
    { perm: "dashboard", path: "/dashboard" },
    { perm: "staff_management", path: "/staff" },
    { perm: "all_staff", path: "/allstaff" },
    { perm: "notifications", path: "/notifications" },
    { perm: "auto_logouts", path: "/autologouts" },
    { perm: "restaurant", path: "/restuarent" },
    { perm: "settings", path: "/settings" },
  ];

  for (const item of map) {
    if (perms.includes(item.perm)) {
      return item.path;
    }
  }

  return "/login"; // fallback if no perms at all
}

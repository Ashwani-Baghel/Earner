import { useAuth } from "@/context/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    // Super admins have all permissions implicitly
    if (user.role === "SUPER_ADMIN" || user.permissions?.includes("*")) return true;
    
    return user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(hasPermission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    permissions: user?.permissions || []
  };
}

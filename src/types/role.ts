export interface RolePermission {
  id: string;
  name: string;
  slug: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  hierarchy?: number;
  isSystem?: boolean;
  permissions?: RolePermission[];
}

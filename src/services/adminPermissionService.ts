import { apiClient } from './api';

// 타입 정의
export interface AdminRole {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissions: AdminPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  id: number;
  permissionCode: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  actions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  userType: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: AdminRole[];
  createdAt: string;
  lastLogin?: string;
}

export interface UserPermissionInfo {
  user: {
    id: number;
    name: string;
    email: string;
    userType: string;
  };
  roles: AdminRole[];
  permissions: AdminPermission[];
  hasRoleSystem: boolean;
}

export interface AuditLog {
  id: number;
  adminId: number;
  targetUserId?: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
  targetUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateRoleDto {
  roleCode: string;
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface AssignRoleDto {
  roleId: number;
  expiresAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminPermissionService {
  private baseURL = '/admin/permissions';

  // 역할 관리
  async getRoles(): Promise<AdminRole[]> {
    return apiClient.get<AdminRole[]>(`${this.baseURL}/roles`);
  }

  async createRole(roleData: CreateRoleDto): Promise<AdminRole> {
    return apiClient.post<AdminRole>(`${this.baseURL}/roles`, roleData);
  }

  async updateRole(roleId: number, roleData: UpdateRoleDto): Promise<AdminRole> {
    return apiClient.put<AdminRole>(`${this.baseURL}/roles/${roleId}`, roleData);
  }

  async deleteRole(roleId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`${this.baseURL}/roles/${roleId}`);
  }

  // 권한 관리
  async getPermissions(): Promise<{ [category: string]: AdminPermission[] }> {
    return apiClient.get<{ [category: string]: AdminPermission[] }>(`${this.baseURL}/permissions`);
  }

  async getRolePermissions(roleId: number): Promise<{ role: AdminRole; permissions: AdminPermission[] }> {
    return apiClient.get<{ role: AdminRole; permissions: AdminPermission[] }>(`${this.baseURL}/roles/${roleId}/permissions`);
  }

  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<{ success: boolean; message: string }> {
    return apiClient.put<{ success: boolean; message: string }>(
      `${this.baseURL}/roles/${roleId}/permissions`,
      { permissionIds }
    );
  }

  // 사용자 관리
  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
  } = {}): Promise<PaginatedResponse<AdminUser>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.roleId) queryParams.append('roleId', params.roleId.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.baseURL}/users?${queryString}` : `${this.baseURL}/users`;

    return apiClient.get<PaginatedResponse<AdminUser>>(endpoint);
  }

  async assignUserRole(userId: number, roleData: AssignRoleDto): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.baseURL}/users/${userId}/roles`,
      roleData
    );
  }

  async revokeUserRole(userId: number, roleId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${this.baseURL}/users/${userId}/roles/${roleId}`
    );
  }

  async getUserPermissions(userId: number): Promise<UserPermissionInfo> {
    return apiClient.get<UserPermissionInfo>(`${this.baseURL}/users/${userId}`);
  }

  async getMyPermissions(): Promise<UserPermissionInfo> {
    return apiClient.get<UserPermissionInfo>(`${this.baseURL}/my-permissions`);
  }

  // 감사 로그
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    adminId?: number;
    targetUserId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.baseURL}/audit-logs?${queryString}` : `${this.baseURL}/audit-logs`;

    return apiClient.get<PaginatedResponse<AuditLog>>(endpoint);
  }

  // 유틸리티 메서드
  getRoleColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'bg-error': 'bg-red-500',
      'bg-primary': 'bg-blue-500',
      'bg-accent': 'bg-green-500',
      'bg-secondary': 'bg-purple-500',
      'bg-background-400': 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  }

  getActionLabel(action: string): string {
    const actionLabels: { [key: string]: string } = {
      'create_role': '역할 생성',
      'update_role': '역할 수정',
      'delete_role': '역할 삭제',
      'update_role_permissions': '역할 권한 변경',
      'assign_user_role': '사용자 역할 할당',
      'revoke_user_role': '사용자 역할 해제'
    };
    return actionLabels[action] || action;
  }

  getCategoryColor(category: string): string {
    const categoryColors: { [key: string]: string } = {
      '사용자 관리': 'bg-blue-100 text-blue-800',
      '전문가 관리': 'bg-green-100 text-green-800',
      '결제 관리': 'bg-yellow-100 text-yellow-800',
      '컨텐츠 관리': 'bg-purple-100 text-purple-800',
      '통계 관리': 'bg-indigo-100 text-indigo-800',
      '시스템 관리': 'bg-red-100 text-red-800',
      '관리자 관리': 'bg-pink-100 text-pink-800'
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  }

  // 사용자의 최고 권한 레벨을 반환
  getUserHighestRole(user: AdminUser): { name: string; color: string; level: number } {
    if (!user.roles || user.roles.length === 0) {
      return this.getUserTypeInfo(user.userType);
    }

    // 역할 중에서 가장 높은 권한을 찾음 (숫자가 낮을수록 높은 권한)
    const highestRole = user.roles.reduce((prev, current) => {
      const prevLevel = this.getRoleLevel(prev.roleCode);
      const currentLevel = this.getRoleLevel(current.roleCode);
      return currentLevel < prevLevel ? current : prev;
    });

    return {
      name: highestRole.name,
      color: highestRole.color,
      level: this.getRoleLevel(highestRole.roleCode)
    };
  }

  // 역할 코드별 권한 레벨 (낮을수록 높은 권한)
  private getRoleLevel(roleCode: string): number {
    const levels: { [key: string]: number } = {
      'super_admin': 1,
      'regional_manager': 2,
      'center_manager': 3,
      'admin': 4,
      'cs_admin': 5,
      'content_admin': 6,
      'readonly_admin': 7
    };
    return levels[roleCode] || 10;
  }

  // user_type 정보를 역할 형태로 반환
  private getUserTypeInfo(userType: string): { name: string; color: string; level: number } {
    const typeInfo: { [key: string]: { name: string; color: string; level: number } } = {
      'super_admin': { name: '최고 관리자', color: 'bg-error', level: 1 },
      'regional_manager': { name: '지역 관리자', color: 'bg-primary', level: 2 },
      'center_manager': { name: '센터 관리자', color: 'bg-accent', level: 3 },
      'staff': { name: '일반 직원', color: 'bg-secondary', level: 4 },
      'expert': { name: '전문가', color: 'bg-background-400', level: 5 },
      'general': { name: '일반 사용자', color: 'bg-background-400', level: 6 }
    };
    return typeInfo[userType] || { name: userType, color: 'bg-background-400', level: 99 };
  }
}

export const adminPermissionService = new AdminPermissionService();
export default adminPermissionService;
// 계층적 권한 관리 API 서비스

import { apiClient } from './api';
import { User } from '@/types/user';

export interface HierarchyRelationship {
  relationship: 'superior' | 'subordinate' | 'peer' | 'unrelated';
  canManage: boolean;
  canView: boolean;
  distance: number;
}

export interface PermissionTest {
  currentUser: {
    id: number;
    name: string;
    userType: string;
    centerId: number;
    supervisorId?: number;
  };
  targetUserId: number;
  relationship: string;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    hierarchyDistance: number;
  };
  accessModes: {
    supervisorOnly: boolean;
    peerAllowed: boolean;
    subordinateRead: boolean;
    strict: boolean;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}

export const hierarchyService = {
  // 내가 관리할 수 있는 직원 목록 조회
  async getManageableStaff(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/hierarchy/staff/manageable');
  },

  // 내가 볼 수 있는 직원 목록 조회 (상급자 포함)
  async getViewableStaff(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/hierarchy/staff/viewable');
  },

  // 특정 사용자 정보 조회 (계층적 권한 체크)
  async getUser(userId: number): Promise<User> {
    return apiClient.get<User>(`/admin/hierarchy/user/${userId}`);
  },

  // 사용자 정보 수정 (상급자만 가능)
  async updateUser(userId: number, updateData: UpdateUserData): Promise<User> {
    return apiClient.put<User>(`/admin/hierarchy/user/${userId}`, updateData);
  },

  // 상급자 지정 (계층 구조 관리)
  async assignSupervisor(userId: number, supervisorId: number): Promise<any> {
    return apiClient.put(`/admin/hierarchy/user/${userId}/supervisor`, {
      supervisorId
    });
  },

  // 내 하급자 목록 조회
  async getMySubordinates(includeIndirect: boolean = false): Promise<User[]> {
    const params = includeIndirect ? '?includeIndirect=true' : '';
    return apiClient.get<User[]>(`/admin/hierarchy/my/subordinates${params}`);
  },

  // 내 상급자 정보 조회
  async getMySupervisor(): Promise<User | null> {
    return apiClient.get<User | null>('/admin/hierarchy/my/supervisor');
  },

  // 계층 구조 트리 조회
  async getHierarchyTree(): Promise<any> {
    return apiClient.get('/admin/hierarchy/tree');
  },

  // 특정 사용자와의 계층 관계 분석
  async analyzeRelationship(userId: number): Promise<HierarchyRelationship> {
    return apiClient.get<HierarchyRelationship>(`/admin/hierarchy/relationship/${userId}`);
  },

  // 동급자 목록 조회 (같은 상급자를 가진 사용자들)
  async getPeers(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/hierarchy/peers');
  },

  // 권한 테스트 엔드포인트 (개발/테스트용)
  async testPermissions(userId: number): Promise<PermissionTest> {
    return apiClient.get<PermissionTest>(`/admin/hierarchy/test/permissions/${userId}`);
  }
};
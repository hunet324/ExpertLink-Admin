import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { useStore } from '@/store/useStore';
import adminPermissionService, { 
  AdminRole, 
  AdminPermission, 
  AdminUser,
  CreateRoleDto
} from '@/services/adminPermissionService';

const AdminPermissionsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useStore();
  
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users' | 'audit'>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 데이터 상태
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<{ [category: string]: AdminPermission[] }>({});
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 모달 상태
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // 폼 데이터
  const [roleFormData, setRoleFormData] = useState<CreateRoleDto>({
    roleCode: '',
    name: '',
    description: '',
    color: 'bg-primary'
  });

  // 권한 할당 관련
  const [allPermissions, setAllPermissions] = useState<{ [category: string]: AdminPermission[] }>({});
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // 사용자 역할 할당 관련
  const [userRoleData, setUserRoleData] = useState({
    roleId: 0,
    expiresAt: ''
  });

  // 데이터 로딩 함수들
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const rolesData = await adminPermissionService.getRoles();
      setRoles(rolesData);
    } catch (err: any) {
      setError('역할 목록을 불러오는데 실패했습니다.');
      console.error('역할 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const permissionsData = await adminPermissionService.getPermissions();
      setPermissions(permissionsData);
    } catch (err: any) {
      setError('권한 목록을 불러오는데 실패했습니다.');
      console.error('권한 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminPermissionService.getAdminUsers({
        page,
        limit: 20,
        search: searchQuery || undefined
      });
      setAdminUsers(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError('관리자 목록을 불러오는데 실패했습니다.');
      console.error('관리자 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const loadAuditLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminPermissionService.getAuditLogs({
        page,
        limit: 20
      });
      setAuditLogs(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError('감사 로그를 불러오는데 실패했습니다.');
      console.error('감사 로그 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    if (!user || !user.userType || !['super_admin', 'regional_manager'].includes(user.userType)) {
      return;
    }

    if (activeTab === 'roles') {
      loadRoles();
    } else if (activeTab === 'permissions') {
      loadPermissions();
    } else if (activeTab === 'users') {
      loadAdminUsers();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, user, loadRoles, loadPermissions, loadAdminUsers, loadAuditLogs]);

  // 검색 시 사용자 다시 로딩
  useEffect(() => {
    if (!user || !user.userType || !['super_admin', 'regional_manager'].includes(user.userType)) {
      return;
    }
    
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        loadAdminUsers(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab, user, loadAdminUsers]);

  // 권한 확인
  if (!user) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (!user.userType || !['super_admin', 'regional_manager'].includes(user.userType)) {
    return <div className="p-4">접근 권한이 없습니다.</div>;
  }

  // 역할 관련 핸들러
  const handleCreateRole = async () => {
    try {
      await adminPermissionService.createRole(roleFormData);
      setShowRoleModal(false);
      setRoleFormData({ roleCode: '', name: '', description: '', color: 'bg-primary' });
      await loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || '역할 생성에 실패했습니다.');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      await adminPermissionService.updateRole(selectedRole.id, {
        name: roleFormData.name,
        description: roleFormData.description,
        color: roleFormData.color
      });
      setShowRoleModal(false);
      setSelectedRole(null);
      setRoleFormData({ roleCode: '', name: '', description: '', color: 'bg-primary' });
      await loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || '역할 수정에 실패했습니다.');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('이 역할을 삭제하시겠습니까?')) return;
    
    try {
      await adminPermissionService.deleteRole(roleId);
      await loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || '역할 삭제에 실패했습니다.');
    }
  };

  const handleEditRole = (role: AdminRole) => {
    setSelectedRole(role);
    setRoleFormData({
      roleCode: role.roleCode,
      name: role.name,
      description: role.description || '',
      color: role.color
    });
    setShowRoleModal(true);
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setRoleFormData({ roleCode: '', name: '', description: '', color: 'bg-primary' });
    setShowRoleModal(true);
  };

  // 권한 할당 관련 핸들러
  const handleManagePermissions = async (role: AdminRole) => {
    try {
      setSelectedRole(role);
      setLoading(true);
      
      // 모든 권한 목록과 현재 역할의 권한을 가져옴
      const [allPerms, rolePerms] = await Promise.all([
        adminPermissionService.getPermissions(),
        adminPermissionService.getRolePermissions(role.id)
      ]);
      
      setAllPermissions(allPerms);
      setSelectedPermissions(rolePerms.permissions.map(p => p.id));
      setShowPermissionModal(true);
    } catch (err: any) {
      setError('권한 정보를 불러오는데 실패했습니다.');
      console.error('권한 정보 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      await adminPermissionService.setRolePermissions(selectedRole.id, selectedPermissions);
      setShowPermissionModal(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      await loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || '권한 설정에 실패했습니다.');
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // 사용자 역할 관리 핸들러
  const handleManageUserRole = (adminUser: AdminUser) => {
    setSelectedUser(adminUser);
    setUserRoleData({ roleId: 0, expiresAt: '' });
    setShowUserModal(true);
  };

  const handleAssignUserRole = async () => {
    if (!selectedUser || !userRoleData.roleId) return;
    
    try {
      await adminPermissionService.assignUserRole(selectedUser.id, {
        roleId: userRoleData.roleId,
        expiresAt: userRoleData.expiresAt || undefined
      });
      setShowUserModal(false);
      setSelectedUser(null);
      setUserRoleData({ roleId: 0, expiresAt: '' });
      await loadAdminUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || '역할 할당에 실패했습니다.');
    }
  };

  const handleRevokeUserRole = async (userId: number, roleId: number) => {
    if (!confirm('이 사용자의 역할을 해제하시겠습니까?')) return;
    
    try {
      await adminPermissionService.revokeUserRole(userId, roleId);
      await loadAdminUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || '역할 해제에 실패했습니다.');
    }
  };

  // 권한별 필터링
  const getFilteredData = () => {
    if (activeTab === 'roles') {
      return roles.filter(role => 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeTab === 'permissions') {
      const filtered: { [category: string]: AdminPermission[] } = {};
      Object.entries(permissions).forEach(([category, perms]) => {
        const filteredPerms = perms.filter(permission =>
          permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredPerms.length > 0) {
          filtered[category] = filteredPerms;
        }
      });
      return filtered;
    }
    
    return adminUsers;
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar userType={user.userType} />
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">🔐</span>
                관리자 권한 설정
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                관리자 역할과 권한을 설정하고 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-background-200 px-6">
          <div className="flex space-x-8">
            {[
              { key: 'roles', label: '역할 관리', icon: '👑' },
              { key: 'permissions', label: '권한 목록', icon: '🔑' },
              { key: 'users', label: '관리자 계정', icon: '👥' },
              { key: 'audit', label: '감사 로그', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-background-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 검색바 */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder={`${
                      activeTab === 'roles' ? '역할' : 
                      activeTab === 'permissions' ? '권한' : '관리자'
                    } 검색...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {activeTab === 'roles' && (
                  <button
                    onClick={handleNewRole}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>새 역할 추가</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 로딩 표시 */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          )}

          {/* 역할 관리 탭 */}
          {activeTab === 'roles' && !loading && (
            <div className="space-y-6">
              {(getFilteredData() as AdminRole[]).map((role) => (
                <div key={role.id} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${adminPermissionService.getRoleColor(role.color)}`}></div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{role.name}</span>
                            {role.isSystem && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                시스템
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">사용자 수</div>
                          <div className="text-sm font-medium text-gray-700">{role.userCount}명</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleManagePermissions(role)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            권한 관리
                          </button>
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            수정
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              disabled={role.userCount > 0}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      부여된 권한 ({role.permissions.length}개)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {role.permissions.map((permission) => (
                        <div key={permission.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{permission.description}</div>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${adminPermissionService.getCategoryColor(permission.category)}`}>
                            {permission.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 권한 목록 탭 */}
          {activeTab === 'permissions' && !loading && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(getFilteredData() as { [category: string]: AdminPermission[] }).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        {category}
                      </h3>
                      <div className="grid gap-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  {permission.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                  {permission.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <span>코드: {permission.permissionCode}</span>
                                  <span>리소스: {permission.resource}</span>
                                  <span>액션: {permission.actions.join(', ')}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">사용 중인 역할</div>
                                <div className="text-sm font-medium text-gray-700">
                                  {roles.filter(role => role.permissions.some(p => p.id === permission.id)).length}개
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 관리자 계정 탭 */}
          {activeTab === 'users' && !loading && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">관리자 정보</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                        역할/권한
                        <div className="text-xs text-gray-400 font-normal mt-1">낮은 권한부터 ⬇️</div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">상태</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">생성일</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(getFilteredData() as AdminUser[]).map((adminUser, index) => (
                      <tr key={adminUser.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {adminUser.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{adminUser.name}</div>
                              <div className="text-xs text-gray-500">{adminUser.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {adminUser.roles.length > 0 ? (
                            <div className="space-y-1">
                              {adminUser.roles.map(role => (
                                <div key={role.id} className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${adminPermissionService.getRoleColor(role.color)}`}></div>
                                  <span className="text-xs text-gray-700">{role.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${adminPermissionService.getRoleColor(adminPermissionService.getUserHighestRole(adminUser).color)}`}></div>
                              <span className="text-xs text-gray-700">{adminPermissionService.getUserHighestRole(adminUser).name}</span>
                              <span className="text-xs text-gray-400">(기본)</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            adminUser.status === 'active' ? 'bg-green-100 text-green-800' :
                            adminUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {adminUser.status === 'active' ? '활성' : 
                             adminUser.status === 'inactive' ? '비활성' : '정지'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-700">{adminPermissionService.formatDate(adminUser.createdAt)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleManageUserRole(adminUser)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              역할 관리
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      페이지 {currentPage} / {totalPages}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => loadAdminUsers(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => loadAdminUsers(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 감사 로그 탭 */}
          {activeTab === 'audit' && !loading && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">시간</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">작업자</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">액션</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">대상</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">변경 내용</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">IP 주소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => (
                      <tr key={log.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-700">{adminPermissionService.formatDate(log.createdAt)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-700">{log.admin?.name || '시스템'}</div>
                          <div className="text-xs text-gray-500">{log.admin?.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {adminPermissionService.getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-700">{log.resourceType}</div>
                          {log.targetUser && (
                            <div className="text-xs text-gray-500">{log.targetUser.name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            {log.newValues && (
                              <div className="text-xs text-gray-600 bg-green-50 p-2 rounded mb-1">
                                <strong>신규:</strong> {JSON.stringify(log.newValues, null, 1).slice(0, 100)}...
                              </div>
                            )}
                            {log.oldValues && (
                              <div className="text-xs text-gray-600 bg-red-50 p-2 rounded">
                                <strong>기존:</strong> {JSON.stringify(log.oldValues, null, 1).slice(0, 100)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-500">{log.ipAddress || '알 수 없음'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      페이지 {currentPage} / {totalPages}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => loadAuditLogs(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => loadAuditLogs(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 역할 생성/수정 모달 */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRole ? '역할 수정' : '새 역할 추가'}
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {!selectedRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">역할 코드</label>
                    <input
                      type="text"
                      value={roleFormData.roleCode}
                      onChange={(e) => setRoleFormData({...roleFormData, roleCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="role_code"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">역할명</label>
                  <input
                    type="text"
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="역할명을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="역할 설명을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                  <select
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({...roleFormData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bg-primary">파란색</option>
                    <option value="bg-error">빨간색</option>
                    <option value="bg-accent">초록색</option>
                    <option value="bg-secondary">보라색</option>
                    <option value="bg-background-400">회색</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={selectedRole ? handleUpdateRole : handleCreateRole}
                  disabled={!roleFormData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {selectedRole ? '수정' : '생성'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 권한 할당 모달 */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRole.name} 권한 설정
                </h3>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {Object.entries(allPermissions).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <label htmlFor={`permission-${permission.id}`} className="block text-sm font-medium text-gray-700 cursor-pointer">
                              {permission.name}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                              <span>코드: {permission.permissionCode}</span>
                              <span>리소스: {permission.resource}</span>
                              <span>액션: {permission.actions.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                선택된 권한: {selectedPermissions.length}개
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveRolePermissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 역할 할당 모달 */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.name} 역할 관리
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              {/* 현재 역할 목록 */}
              {selectedUser.roles && selectedUser.roles.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">현재 할당된 역할</h4>
                  <div className="space-y-2">
                    {selectedUser.roles.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${adminPermissionService.getRoleColor(role.color)}`}></div>
                          <span className="text-sm font-medium text-gray-700">{role.name}</span>
                        </div>
                        <button
                          onClick={() => handleRevokeUserRole(selectedUser.id, role.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          해제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 역할 할당 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">새 역할 할당</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">역할 선택</label>
                  <select
                    value={userRoleData.roleId}
                    onChange={(e) => setUserRoleData({...userRoleData, roleId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>역할을 선택하세요</option>
                    {roles.filter(role => !selectedUser.roles.some(userRole => userRole.id === role.id)).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">만료일 (선택사항)</label>
                  <input
                    type="datetime-local"
                    value={userRoleData.expiresAt}
                    onChange={(e) => setUserRoleData({...userRoleData, expiresAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAssignUserRole}
                  disabled={!userRoleData.roleId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  할당
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsPage;
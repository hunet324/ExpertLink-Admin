import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

const AdminPermissionsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 권한 목록
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'user_view',
      name: '사용자 조회',
      description: '모든 사용자 정보를 조회할 수 있습니다',
      category: '사용자 관리',
      resource: 'users',
      actions: ['read']
    },
    {
      id: 'user_manage',
      name: '사용자 관리',
      description: '사용자 정보를 수정하고 상태를 변경할 수 있습니다',
      category: '사용자 관리',
      resource: 'users',
      actions: ['create', 'update', 'delete']
    },
    {
      id: 'expert_view',
      name: '전문가 조회',
      description: '전문가 정보를 조회할 수 있습니다',
      category: '전문가 관리',
      resource: 'experts',
      actions: ['read']
    },
    {
      id: 'expert_manage',
      name: '전문가 관리',
      description: '전문가 승인, 정보 수정, 상태 변경을 할 수 있습니다',
      category: '전문가 관리',
      resource: 'experts',
      actions: ['create', 'update', 'delete', 'approve']
    },
    {
      id: 'payment_view',
      name: '결제 내역 조회',
      description: '모든 결제 내역을 조회할 수 있습니다',
      category: '결제 관리',
      resource: 'payments',
      actions: ['read']
    },
    {
      id: 'payment_manage',
      name: '결제 관리',
      description: '결제 내역 수정, 환불 처리를 할 수 있습니다',
      category: '결제 관리',
      resource: 'payments',
      actions: ['update', 'refund']
    },
    {
      id: 'content_view',
      name: '컨텐츠 조회',
      description: 'CMS 컨텐츠를 조회할 수 있습니다',
      category: '컨텐츠 관리',
      resource: 'content',
      actions: ['read']
    },
    {
      id: 'content_manage',
      name: '컨텐츠 관리',
      description: 'CMS 컨텐츠를 생성, 수정, 삭제할 수 있습니다',
      category: '컨텐츠 관리',
      resource: 'content',
      actions: ['create', 'update', 'delete', 'publish']
    },
    {
      id: 'stats_view',
      name: '통계 조회',
      description: '플랫폼 통계와 분석 데이터를 조회할 수 있습니다',
      category: '통계 관리',
      resource: 'statistics',
      actions: ['read']
    },
    {
      id: 'system_view',
      name: '시스템 조회',
      description: '시스템 로그와 설정을 조회할 수 있습니다',
      category: '시스템 관리',
      resource: 'system',
      actions: ['read']
    },
    {
      id: 'system_manage',
      name: '시스템 관리',
      description: '시스템 설정을 변경하고 관리할 수 있습니다',
      category: '시스템 관리',
      resource: 'system',
      actions: ['update', 'configure']
    },
    {
      id: 'admin_manage',
      name: '관리자 관리',
      description: '관리자 계정과 권한을 관리할 수 있습니다',
      category: '관리자 관리',
      resource: 'admins',
      actions: ['create', 'update', 'delete', 'assign_role']
    }
  ]);

  // 역할 목록
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'super_admin',
      name: '최고 관리자',
      description: '모든 권한을 가진 최고 관리자입니다',
      color: 'bg-error',
      permissions: permissions.map(p => p.id),
      isSystem: true,
      userCount: 1
    },
    {
      id: 'admin',
      name: '일반 관리자',
      description: '대부분의 관리 기능을 사용할 수 있는 관리자입니다',
      color: 'bg-primary',
      permissions: ['user_view', 'user_manage', 'expert_view', 'expert_manage', 'payment_view', 'payment_manage', 'content_view', 'content_manage', 'stats_view', 'system_view'],
      isSystem: false,
      userCount: 3
    },
    {
      id: 'cs_admin',
      name: '고객서비스 관리자',
      description: '고객 지원과 관련된 업무를 담당하는 관리자입니다',
      color: 'bg-accent',
      permissions: ['user_view', 'user_manage', 'expert_view', 'payment_view', 'content_view'],
      isSystem: false,
      userCount: 5
    },
    {
      id: 'content_admin',
      name: '컨텐츠 관리자',
      description: 'CMS와 컨텐츠 관리를 담당하는 관리자입니다',
      color: 'bg-secondary',
      permissions: ['content_view', 'content_manage', 'expert_view', 'stats_view'],
      isSystem: false,
      userCount: 2
    },
    {
      id: 'readonly_admin',
      name: '읽기 전용 관리자',
      description: '조회 권한만 가진 관리자입니다',
      color: 'bg-background-400',
      permissions: ['user_view', 'expert_view', 'payment_view', 'content_view', 'stats_view', 'system_view'],
      isSystem: false,
      userCount: 4
    }
  ]);

  // 관리자 사용자 목록
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: 'admin_001',
      name: '김최고관리자',
      email: 'superadmin@expertlink.com',
      roleId: 'super_admin',
      status: 'active',
      lastLogin: '2024-08-12T15:30:00',
      createdAt: '2023-11-01T09:00:00'
    },
    {
      id: 'admin_002',
      name: '이일반관리자',
      email: 'admin1@expertlink.com',
      roleId: 'admin',
      status: 'active',
      lastLogin: '2024-08-12T14:20:00',
      createdAt: '2024-01-15T10:30:00'
    },
    {
      id: 'admin_003',
      name: '박CS관리자',
      email: 'cs1@expertlink.com',
      roleId: 'cs_admin',
      status: 'active',
      lastLogin: '2024-08-12T16:45:00',
      createdAt: '2024-02-20T14:15:00'
    },
    {
      id: 'admin_004',
      name: '정컨텐츠관리자',
      email: 'content1@expertlink.com',
      roleId: 'content_admin',
      status: 'active',
      lastLogin: '2024-08-11T18:30:00',
      createdAt: '2024-03-10T11:20:00'
    },
    {
      id: 'admin_005',
      name: '최읽기전용',
      email: 'readonly1@expertlink.com',
      roleId: 'readonly_admin',
      status: 'inactive',
      lastLogin: '2024-08-05T10:15:00',
      createdAt: '2024-04-05T16:00:00'
    }
  ]);

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getRoleByName = (roleId: string) => {
    return roles.find(role => role.id === roleId);
  };

  const getStatusColor = (status: AdminUser['status']) => {
    const statusColors = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'suspended': 'bg-error text-white'
    };
    return statusColors[status];
  };

  const getStatusText = (status: AdminUser['status']) => {
    const statusTexts = {
      'active': '활성',
      'inactive': '비활성',
      'suspended': '정지'
    };
    return statusTexts[status];
  };

  const handleRolePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const newPermissions = checked
          ? [...role.permissions, permissionId]
          : role.permissions.filter(id => id !== permissionId);
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.isSystem) {
      alert('시스템 기본 역할은 삭제할 수 없습니다.');
      return;
    }
    
    if (role.userCount > 0) {
      alert('해당 역할을 사용하는 관리자가 있어 삭제할 수 없습니다.');
      return;
    }
    
    if (confirm(`"${role.name}" 역할을 삭제하시겠습니까?`)) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
    }
  };

  const handleUserStatusChange = (userId: string, newStatus: AdminUser['status']) => {
    setAdminUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="admin" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

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
            <div className="flex items-center space-x-4">
              {/* 프로필 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">관</span>
                </div>
                <span className="text-body text-secondary-600">관리자</span>
              </div>
            </div>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-background-200 px-6">
          <div className="flex space-x-8">
            {[
              { key: 'roles', label: '역할 관리', icon: '👑' },
              { key: 'permissions', label: '권한 목록', icon: '🔑' },
              { key: 'users', label: '관리자 계정', icon: '👥' }
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
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder={`${activeTab === 'roles' ? '역할' : activeTab === 'permissions' ? '권한' : '관리자'} 검색...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                {activeTab === 'roles' && (
                  <button
                    onClick={handleCreateRole}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>새 역할 추가</span>
                  </button>
                )}
                {activeTab === 'users' && (
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                  >
                    <span>👤</span>
                    <span>관리자 추가</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 역할 관리 탭 */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {filteredRoles.map((role) => (
                <div key={role.id} className="bg-white rounded-custom shadow-soft">
                  <div className="p-6 border-b border-background-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                        <div>
                          <h3 className="text-h4 font-semibold text-secondary flex items-center space-x-2">
                            <span>{role.name}</span>
                            {role.isSystem && (
                              <span className="bg-secondary-100 text-secondary-600 px-2 py-1 rounded text-xs">
                                시스템
                              </span>
                            )}
                          </h3>
                          <p className="text-caption text-secondary-500">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-caption text-secondary-400">사용자 수</div>
                          <div className="text-body font-medium text-secondary-700">{role.userCount}명</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-primary hover:text-primary-600 text-caption"
                          >
                            수정
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-error hover:text-error-600 text-caption"
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
                    <h4 className="text-body font-medium text-secondary mb-4">부여된 권한 ({role.permissions.length}개)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => {
                        const rolePermissions = categoryPermissions.filter(p => role.permissions.includes(p.id));
                        if (rolePermissions.length === 0) return null;
                        
                        return (
                          <div key={category} className="bg-background-50 p-4 rounded-lg">
                            <h5 className="text-caption font-medium text-secondary-600 mb-2">{category}</h5>
                            <div className="space-y-2">
                              {rolePermissions.map((permission) => (
                                <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={role.permissions.includes(permission.id)}
                                    onChange={(e) => handleRolePermissionChange(role.id, permission.id, e.target.checked)}
                                    className="w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-400 focus:ring-2"
                                    disabled={role.isSystem}
                                  />
                                  <span className="text-caption text-secondary-700">{permission.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 권한 목록 탭 */}
          {activeTab === 'permissions' && (
            <div className="bg-white rounded-custom shadow-soft">
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => {
                    const filteredCategoryPermissions = categoryPermissions.filter(p => 
                      filteredPermissions.includes(p)
                    );
                    
                    if (filteredCategoryPermissions.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h3 className="text-h4 font-semibold text-secondary mb-4 pb-2 border-b border-background-200">
                          {category}
                        </h3>
                        <div className="grid gap-4">
                          {filteredCategoryPermissions.map((permission) => (
                            <div key={permission.id} className="bg-background-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-body font-medium text-secondary-700 mb-1">
                                    {permission.name}
                                  </h4>
                                  <p className="text-caption text-secondary-500 mb-2">
                                    {permission.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-caption text-secondary-400">
                                    <span>리소스: {permission.resource}</span>
                                    <span>액션: {permission.actions.join(', ')}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-caption text-secondary-400">사용 중인 역할</div>
                                  <div className="text-body font-medium text-secondary-700">
                                    {roles.filter(role => role.permissions.includes(permission.id)).length}개
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 관리자 계정 탭 */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-custom shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-50 border-b border-background-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">관리자 정보</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">역할</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">상태</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">최종 로그인</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">생성일</th>
                      <th className="text-center py-3 px-4 font-medium text-secondary-600 text-caption">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const role = getRoleByName(user.roleId);
                      return (
                        <tr key={user.id} className={`border-b border-background-100 hover:bg-background-50 ${index % 2 === 0 ? 'bg-white' : 'bg-background-25'}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${role?.color || 'bg-secondary'}`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-body font-medium text-secondary-700">{user.name}</div>
                                <div className="text-caption text-secondary-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${role?.color || 'bg-secondary'}`}></div>
                              <span className="text-caption text-secondary-700">{role?.name || '알 수 없음'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(user.status)}`}>
                              {getStatusText(user.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-caption text-secondary-700">{formatDate(user.lastLogin)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-caption text-secondary-700">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button className="text-primary hover:text-primary-600 text-caption">
                                수정
                              </button>
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                  className="text-error hover:text-error-600 text-caption"
                                >
                                  정지
                                </button>
                              )}
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => handleUserStatusChange(user.id, 'active')}
                                  className="text-accent hover:text-accent-600 text-caption"
                                >
                                  해제
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <span className="text-6xl mb-4 block">👥</span>
                  <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                    검색 조건에 맞는 관리자가 없습니다
                  </h3>
                  <p className="text-caption text-secondary-400">
                    검색어를 변경하거나 새 관리자를 추가해보세요
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 역할 생성/수정 모달 (간단한 placeholder) */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {selectedRole ? '역할 수정' : '새 역할 추가'}
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🚧</span>
                <p className="text-body text-secondary-600">
                  역할 관리 기능은 개발 중입니다.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 추가 모달 (간단한 placeholder) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">관리자 추가</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🚧</span>
                <p className="text-body text-secondary-600">
                  관리자 추가 기능은 개발 중입니다.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg"
                >
                  닫기
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
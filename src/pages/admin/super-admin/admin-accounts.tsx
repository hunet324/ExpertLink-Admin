// 수퍼관리자 전용 관리자 계정 관리 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { User, UserType } from '@/types/user';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getAdminLevelText, getPermissionLevelColor, hasMinPermissionLevel, getUserType } from '@/utils/permissions';

interface AdminAccount extends User {
  lastLogin?: string;
  loginCount: number;
  accountStatus: 'active' | 'inactive' | 'locked' | 'pending';
  createdBy?: number;
  createdByName?: string;
}

interface CreateAdminForm {
  name: string;
  email: string;
  userType: UserType;
  centerId?: number;
  supervisorId?: number;
  password: string;
  confirmPassword: string;
}

const AdminAccountsPage: React.FC = () => {
  const { user } = useStore();
  
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [createForm, setCreateForm] = useState<CreateAdminForm>({
    name: '',
    email: '',
    userType: 'staff',
    password: '',
    confirmPassword: ''
  });

  const userType = getUserType(user);

  // 관리자 계정 목록 조회
  useEffect(() => {
    const fetchAdminAccounts = async () => {
      try {
        setLoading(true);
        
        // Mock 데이터 (실제로는 API 호출)
        const mockAdminAccounts: AdminAccount[] = [
          {
            id: 1,
            name: '김관리',
            email: 'admin1@expertlink.com',
            user_type: 'regional_manager',
            center_id: 1,
            center_name: '강남센터',
            lastLogin: '2024-08-19T09:30:00Z',
            loginCount: 245,
            status: 'active',
            accountStatus: 'active',
            createdBy: 0,
            createdByName: 'System',
            created_at: '2024-01-15T00:00:00Z'
          },
          {
            id: 2,
            name: '박센터',
            email: 'center1@expertlink.com',
            user_type: 'center_manager',
            center_id: 2,
            center_name: '부산센터',
            lastLogin: '2024-08-18T16:45:00Z',
            loginCount: 156,
            status: 'active',
            accountStatus: 'active',
            createdBy: 1,
            createdByName: '김관리',
            created_at: '2024-02-01T00:00:00Z'
          },
          {
            id: 3,
            name: '이직원',
            email: 'staff1@expertlink.com',
            user_type: 'staff',
            center_id: 1,
            center_name: '강남센터',
            lastLogin: '2024-08-19T08:15:00Z',
            loginCount: 89,
            status: 'active',
            accountStatus: 'active',
            createdBy: 2,
            createdByName: '박센터',
            created_at: '2024-03-10T00:00:00Z'
          },
          {
            id: 4,
            name: '최신규',
            email: 'new@expertlink.com',
            user_type: 'staff',
            center_id: 3,
            center_name: '대구센터',
            lastLogin: undefined,
            loginCount: 0,
            status: 'pending',
            accountStatus: 'pending',
            createdBy: 1,
            createdByName: '김관리',
            created_at: '2024-08-18T00:00:00Z'
          }
        ];

        setAdminAccounts(mockAdminAccounts);
        setError('');
      } catch (err: any) {
        console.error('관리자 계정 조회 실패:', err);
        setError(err.message || '관리자 계정 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminAccounts();
  }, []);

  // 관리자 계정 생성
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (createForm.password !== createForm.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 실제로는 API 호출
      console.log('새 관리자 계정 생성:', createForm);
      
      alert('관리자 계정이 성공적으로 생성되었습니다.');
      setShowCreateForm(false);
      setCreateForm({
        name: '',
        email: '',
        userType: 'staff',
        password: '',
        confirmPassword: ''
      });
      
      // 목록 새로고침 (실제로는 API 재호출)
    } catch (err: any) {
      console.error('관리자 계정 생성 실패:', err);
      alert(err.message || '관리자 계정 생성에 실패했습니다.');
    }
  };

  // 계정 상태 변경
  const handleStatusChange = async (accountId: number, newStatus: string) => {
    try {
      // 실제로는 API 호출
      console.log('계정 상태 변경:', { accountId, newStatus });
      
      setAdminAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, accountStatus: newStatus as any }
            : account
        )
      );
      
      alert('계정 상태가 변경되었습니다.');
    } catch (err: any) {
      console.error('계정 상태 변경 실패:', err);
      alert(err.message || '계정 상태 변경에 실패했습니다.');
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'locked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'locked': return '잠김';
      case 'pending': return '승인대기';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 계정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin/super-admin/global-dashboard"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 전체 시스템 현황
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">👤 관리자 계정 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">시스템 관리자 계정 생성 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + 계정 생성
              </button>
              <Link
                href="/admin/super-admin/security-policy"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                보안 정책
              </Link>
            </div>
          </div>
        </div>

        {/* 계정 생성 폼 */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">새 관리자 계정 생성</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    권한 등급 *
                  </label>
                  <select
                    value={createForm.userType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, userType: e.target.value as UserType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="staff">직원 (Staff)</option>
                    <option value="center_manager">센터 관리자 (Center Manager)</option>
                    <option value="regional_manager">지역 관리자 (Regional Manager)</option>
                    <option value="super_admin">수퍼 관리자 (Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    센터 ID (선택)
                  </label>
                  <input
                    type="number"
                    value={createForm.centerId || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, centerId: parseInt(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 *
                  </label>
                  <input
                    type="password"
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  계정 생성
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({
                      name: '',
                      email: '',
                      userType: 'staff',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 관리자 계정 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              관리자 계정 목록 ({adminAccounts.length}개)
            </h2>
          </div>

          {adminAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 관리자가 없습니다</h3>
              <p className="text-gray-600">새 관리자 계정을 생성해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리자 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권한 등급
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소속 센터
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      계정 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최근 로그인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {account.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {account.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              로그인 {account.loginCount}회
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getPermissionLevelColor(account.user_type as any)
                        }`}>
                          {getAdminLevelText(account.user_type as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.center_name || `센터 ${account.center_id || '?'}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getAccountStatusColor(account.accountStatus)
                        }`}>
                          {getAccountStatusText(account.accountStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.lastLogin ? (
                          <div>
                            <div>{new Date(account.lastLogin).toLocaleDateString()}</div>
                            <div className="text-xs">
                              {new Date(account.lastLogin).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">로그인 이력 없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAccount(account)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            상세
                          </button>
                          {account.accountStatus === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(account.id, 'inactive')}
                              className="text-red-600 hover:text-red-900"
                            >
                              비활성화
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(account.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              활성화
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(account.id, 'locked')}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            잠금
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 관리자</p>
                <p className="text-2xl font-semibold text-gray-900">{adminAccounts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">활성 계정</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminAccounts.filter(a => a.accountStatus === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">승인대기</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminAccounts.filter(a => a.accountStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">👑</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">수퍼관리자</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminAccounts.filter(a => a.user_type === 'super_admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(AdminAccountsPage);
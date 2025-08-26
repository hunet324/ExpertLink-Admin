// 센터별 직원 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService, CenterStaffResponse } from '@/services/center';
import { userService, UserResponse } from '@/services/user';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getAdminLevelText, getPermissionLevelColor, getUserType, hasMinPermissionLevel } from '@/utils/permissions';

const CenterStaffPage: React.FC = () => {
  const router = useRouter();
  const { centerId } = router.query;
  const { user } = useStore();
  
  const [staff, setStaff] = useState<CenterStaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [centerName, setCenterName] = useState<string>('');
  
  // 직원 추가 모달 관련
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [addingStaff, setAddingStaff] = useState(false);

  const userType = getUserType(user);
  const currentCenterId = user?.centerId || user?.centerId;

  // 센터별 직원 목록 조회
  useEffect(() => {
    const loadInitialData = async () => {
      if (!centerId || Array.isArray(centerId)) return;

      try {
        // 센터 정보 조회하여 실제 이름 설정
        const centerInfo = await centerService.getCenterById(parseInt(centerId));
        setCenterName(centerInfo.name || `센터 ${centerId}`);
      } catch (error) {
        console.error('센터 정보 조회 실패:', error);
        setCenterName(`센터 ${centerId}`); // 실패 시 fallback
      }
      
      // 직원 목록 조회
      await fetchStaff();
    };

    loadInitialData();
  }, [centerId]);

  // 직원 추가 가능한 사용자 목록 로드
  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      // general 타입이면서 centerId가 없는 사용자들 조회
      const response = await userService.getAllUsers({
        userType: 'general',
        limit: 100
      });
      
      // centerId가 없는 사용자만 필터링
      const availableUsersList = response.users.filter(user => !user.centerId);
      setAvailableUsers(availableUsersList);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      alert('사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 직원 목록 새로고침
  const fetchStaff = async () => {
    if (!centerId || Array.isArray(centerId)) return;

    try {
      setLoading(true);
      const staffList = await centerService.getCenterStaff(parseInt(centerId));
      setStaff(staffList);
      setError('');
    } catch (err: any) {
      console.error('직원 목록 조회 실패:', err);
      setError(err.message || '직원 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 직원 추가 처리
  const handleAddStaff = async () => {
    if (!selectedUserId) {
      alert('추가할 사용자를 선택해주세요.');
      return;
    }

    if (!centerId || Array.isArray(centerId)) {
      alert('센터 정보가 올바르지 않습니다.');
      return;
    }

    try {
      setAddingStaff(true);
      
      // 센터에 직원 배정 API 호출
      const result = await centerService.assignStaffToCenter(
        parseInt(centerId), 
        parseInt(selectedUserId)
      );
      
      alert(result.message || '직원이 성공적으로 추가되었습니다.');
      
      // 직원 목록 새로고침
      await fetchStaff();
      
      setShowAddModal(false);
      setSelectedUserId('');
    } catch (error: any) {
      console.error('직원 추가 실패:', error);
      alert(error.message || '직원 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingStaff(false);
    }
  };

  // 모달 열기 시 사용자 목록 로드
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    loadAvailableUsers();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">직원 목록을 불러오는 중...</p>
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
                  href="/admin/centers/list"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 센터 목록
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {centerName} 직원 관리
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">센터 직원 목록 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                직원 추가
              </button>
              <Link
                href={`/admin/centers/${centerId}/experts`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                전문가 관리
              </Link>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 직원 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              직원 목록 ({staff.length}명)
            </h2>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 직원이 없습니다</h3>
              <p className="text-gray-600">이 센터에는 아직 등록된 직원이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      직원 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      직급
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상급자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getPermissionLevelColor(member.userType as any)
                        }`}>
                          {getAdminLevelText(member.userType as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.supervisorId ? (
                          <span>ID: {member.supervisorId}</span>
                        ) : (
                          <span className="text-gray-400">없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">상세</span>
                          {(userType === 'super_admin' || 
                            (userType === 'center_manager' && member.userType === 'staff')) && (
                            <span className="text-gray-400">수정</span>
                          )}
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
                <p className="text-sm font-medium text-gray-500">총 직원</p>
                <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">👑</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">센터장</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {staff.filter(s => s.userType === 'center_manager').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">👤</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">직원</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {staff.filter(s => s.userType === 'staff').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🏢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">센터 ID</p>
                <p className="text-2xl font-semibold text-gray-900">{centerId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 직원 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">직원 추가</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUserId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가할 사용자 선택
                </label>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-gray-600">사용자 목록 로딩 중...</span>
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">추가 가능한 사용자가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      일반 사용자 중 아직 센터에 배정되지 않은 사용자만 표시됩니다.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">사용자를 선택하세요</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚠️</span>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">알림</p>
                    <p className="text-sm text-yellow-700">
                      선택한 사용자가 이 센터의 직원으로 배정되며, 사용자 타입이 &apos;staff&apos;로 변경됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUserId('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddStaff}
                disabled={!selectedUserId || addingStaff}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {addingStaff && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                {addingStaff ? '추가 중...' : '직원 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withCenterManagerOnly(CenterStaffPage);
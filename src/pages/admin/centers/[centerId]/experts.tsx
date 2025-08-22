// 센터별 전문가 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService, CenterExpertResponse } from '@/services/center';
import { userService } from '@/services/user';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

const CenterExpertsPage: React.FC = () => {
  const router = useRouter();
  const { centerId } = router.query;
  const { user } = useStore();
  
  const [experts, setExperts] = useState<CenterExpertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [centerName, setCenterName] = useState<string>('');
  
  // 전문가 추가 모달 관련
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableExperts, setAvailableExperts] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [addingExpert, setAddingExpert] = useState(false);

  const userType = getUserType(user);

  // 센터별 전문가 목록 조회
  useEffect(() => {
    const fetchExperts = async () => {
      if (!centerId || Array.isArray(centerId)) return;

      try {
        setLoading(true);
        
        // 센터 정보와 전문가 목록 병렬로 조회
        const [centerInfo, expertList] = await Promise.all([
          centerService.getCenterById(parseInt(centerId)).catch(() => null),
          centerService.getCenterExperts(parseInt(centerId))
        ]);
        
        setExperts(expertList);
        setCenterName(centerInfo?.name || `센터 ${centerId}`);
        setError('');
      } catch (err: any) {
        console.error('전문가 목록 조회 실패:', err);
        setError(err.message || '전문가 목록을 불러올 수 없습니다.');
        setCenterName(`센터 ${centerId}`); // 에러 시 fallback
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [centerId]);

  // 전문가 추가 가능한 사용자 목록 로드
  const loadAvailableExperts = async () => {
    try {
      setLoadingExperts(true);
      // expert 타입이면서 center_id가 없거나 현재 센터가 아닌 사용자들 조회
      const response = await userService.getAllUsers({
        user_type: 'expert',
        limit: 100
      });
      
      // center_id가 없는 전문가만 필터링 (아직 센터에 배정되지 않은 전문가)
      const availableExpertsList = response.users.filter(user => !user.center_id);
      setAvailableExperts(availableExpertsList);
    } catch (error) {
      console.error('전문가 목록 로드 실패:', error);
      alert('전문가 목록을 불러올 수 없습니다.');
    } finally {
      setLoadingExperts(false);
    }
  };

  // 전문가 추가 처리
  const handleAddExpert = async () => {
    if (!selectedExpertId) {
      alert('추가할 전문가를 선택해주세요.');
      return;
    }

    if (!centerId || Array.isArray(centerId)) {
      alert('센터 정보가 올바르지 않습니다.');
      return;
    }

    try {
      setAddingExpert(true);
      
      // 센터에 전문가 배정 API 호출
      const result = await centerService.assignExpertToCenter(
        parseInt(centerId), 
        parseInt(selectedExpertId)
      );
      
      alert('전문가가 성공적으로 추가되었습니다.');
      
      // 전문가 목록 새로고침
      await fetchExperts();
      
      setShowAddModal(false);
      setSelectedExpertId('');
    } catch (error: any) {
      console.error('전문가 추가 실패:', error);
      alert(error.message || '전문가 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingExpert(false);
    }
  };

  // 모달 열기 시 전문가 목록 로드
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    loadAvailableExperts();
  };

  // 전문가 목록 새로고침 함수
  const fetchExperts = async () => {
    if (!centerId || Array.isArray(centerId)) return;

    try {
      setLoading(true);
      
      // 센터 정보와 전문가 목록 병렬로 조회
      const [centerInfo, expertList] = await Promise.all([
        centerService.getCenterById(parseInt(centerId)).catch(() => null),
        centerService.getCenterExperts(parseInt(centerId))
      ]);
      
      setExperts(expertList);
      setCenterName(centerInfo?.name || `센터 ${centerId}`);
      setError('');
    } catch (err: any) {
      console.error('전문가 목록 조회 실패:', err);
      setError(err.message || '전문가 목록을 불러올 수 없습니다.');
      setCenterName(`센터 ${centerId}`); // 에러 시 fallback
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '승인대기';
      case 'vacation': return '휴가중';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">전문가 목록을 불러오는 중...</p>
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
                <Link
                  href={`/admin/centers/${centerId}/staff`}
                  className="text-gray-500 hover:text-gray-600 text-sm flex items-center gap-1"
                >
                  직원 관리
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {centerName} 전문가 관리
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">센터 전문가 목록 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                전문가 추가
              </button>
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

        {/* 전문가 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              전문가 목록 ({experts.length}명)
            </h2>
          </div>

          {experts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 전문가가 없습니다</h3>
              <p className="text-gray-600">이 센터에는 아직 등록된 전문가가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전문가 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전문 분야
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
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
                  {experts.map((expert) => (
                    <tr key={expert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {expert.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {expert.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {expert.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {expert.specialties && expert.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {expert.specialties.map((specialty, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">미설정</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusColor(expert.status)
                        }`}>
                          {getStatusText(expert.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/experts/${expert.id}/profile`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            프로필
                          </Link>
                          <Link
                            href={`/admin/experts/${expert.id}/vacation`}
                            className="text-green-600 hover:text-green-900"
                          >
                            휴가
                          </Link>
                          <Link
                            href={`/admin/experts/${expert.id}/working-hours`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            근무시간
                          </Link>
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
                  <span className="text-blue-600 text-sm">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 전문가</p>
                <p className="text-2xl font-semibold text-gray-900">{experts.length}</p>
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
                <p className="text-sm font-medium text-gray-500">활성</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {experts.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏖️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">휴가중</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {experts.filter(e => e.status === 'vacation').length}
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
                  {experts.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전문가 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">전문가 추가</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedExpertId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가할 전문가 선택
                </label>
                {loadingExperts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-gray-600">전문가 목록 로딩 중...</span>
                  </div>
                ) : availableExperts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">추가 가능한 전문가가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      전문가 사용자 중 아직 센터에 배정되지 않은 사용자만 표시됩니다.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedExpertId}
                    onChange={(e) => setSelectedExpertId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">전문가를 선택하세요</option>
                    {availableExperts.map((expert) => (
                      <option key={expert.id} value={expert.id}>
                        {expert.name} ({expert.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">ℹ️</span>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">알림</p>
                    <p className="text-sm text-blue-700">
                      선택한 전문가가 이 센터에 배정됩니다. 전문가는 해당 센터에서 상담 서비스를 제공할 수 있게 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedExpertId('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddExpert}
                disabled={!selectedExpertId || addingExpert}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {addingExpert && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                {addingExpert ? '추가 중...' : '전문가 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withCenterManagerOnly(CenterExpertsPage);
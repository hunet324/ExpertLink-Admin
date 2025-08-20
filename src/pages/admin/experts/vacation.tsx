// 전문가 휴가 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService, CenterExpertResponse, VacationRequest } from '@/services/center';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import CenterSelector from '@/components/CenterSelector';

interface VacationRecord {
  id: number;
  expertId: number;
  expertName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedBy?: number;
  approvedAt?: string;
}

const ExpertVacationPage: React.FC = () => {
  const router = useRouter();
  const { centerId: queryCenterId } = router.query;
  const { user } = useStore();
  
  const [experts, setExperts] = useState<CenterExpertResponse[]>([]);
  const [vacationRecords, setVacationRecords] = useState<VacationRecord[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(
    queryCenterId ? parseInt(queryCenterId as string) : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [vacationForm, setVacationForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const userType = user?.user_type || user?.userType;

  // 전문가 목록 조회
  useEffect(() => {
    const fetchExperts = async () => {
      if (!selectedCenterId) return;

      try {
        setLoading(true);
        const expertList = await centerService.getCenterExperts(selectedCenterId);
        setExperts(expertList);
        
        // 휴가 기록도 함께 조회 (실제로는 별도 API 필요)
        const mockVacations: VacationRecord[] = expertList.map((expert, index) => ({
          id: index + 1,
          expertId: expert.id,
          expertName: expert.name,
          startDate: '2024-03-01',
          endDate: '2024-03-05',
          reason: '개인 사정',
          status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
          requestedAt: '2024-02-20T09:00:00Z',
          approvedBy: 1,
          approvedAt: '2024-02-21T10:00:00Z'
        }));
        setVacationRecords(mockVacations);
        
        setError('');
      } catch (err: any) {
        console.error('전문가 목록 조회 실패:', err);
        setError(err.message || '전문가 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [selectedCenterId]);

  // 휴가 신청
  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;

    try {
      const vacationData: VacationRequest = {
        expertId: selectedExpert,
        startDate: vacationForm.startDate,
        endDate: vacationForm.endDate,
        reason: vacationForm.reason
      };

      await centerService.setExpertVacation(vacationData);
      
      // 성공 후 폼 리셋 및 목록 새로고침
      setVacationForm({ startDate: '', endDate: '', reason: '' });
      setSelectedExpert(null);
      setShowVacationForm(false);
      
      // 실제로는 휴가 목록 새로고침 API 호출
      alert('휴가가 성공적으로 설정되었습니다.');
    } catch (err: any) {
      console.error('휴가 설정 실패:', err);
      alert(err.message || '휴가 설정에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'pending': return '승인대기';
      case 'rejected': return '거부됨';
      default: return '알 수 없음';
    }
  };

  if (!userType) {
    return <div>권한 정보를 불러오는 중...</div>;
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">전문가 휴가 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">전문가 휴가 신청 및 승인 관리</p>
                <AdminLevelBadge userType={userType} size="sm" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/admin/experts/schedule"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                스케줄 관리
              </Link>
              <Link
                href="/admin/experts/working-hours"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                근무시간 관리
              </Link>
            </div>
          </div>
        </div>

        {/* 센터 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">센터 선택</h2>
          <div className="max-w-md">
            <CenterSelector
              userType={userType}
              currentCenterId={selectedCenterId}
              onCenterChange={setSelectedCenterId}
              placeholder="센터를 선택하세요"
            />
          </div>
        </div>

        {selectedCenterId && (
          <>
            {/* 휴가 신청 버튼 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">휴가 관리</h2>
                <button
                  onClick={() => setShowVacationForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + 휴가 설정
                </button>
              </div>

              {/* 휴가 신청 폼 */}
              {showVacationForm && (
                <div className="mt-6 border-t pt-6">
                  <form onSubmit={handleVacationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          전문가 선택
                        </label>
                        <select
                          value={selectedExpert || ''}
                          onChange={(e) => setSelectedExpert(parseInt(e.target.value) || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">전문가를 선택하세요</option>
                          {experts.map(expert => (
                            <option key={expert.id} value={expert.id}>
                              {expert.name} ({expert.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          휴가 사유
                        </label>
                        <input
                          type="text"
                          value={vacationForm.reason}
                          onChange={(e) => setVacationForm(prev => ({ ...prev, reason: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="휴가 사유를 입력하세요"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          시작일
                        </label>
                        <input
                          type="date"
                          value={vacationForm.startDate}
                          onChange={(e) => setVacationForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          종료일
                        </label>
                        <input
                          type="date"
                          value={vacationForm.endDate}
                          onChange={(e) => setVacationForm(prev => ({ ...prev, endDate: e.target.value }))}
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
                        휴가 설정
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowVacationForm(false);
                          setVacationForm({ startDate: '', endDate: '', reason: '' });
                          setSelectedExpert(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
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

            {/* 휴가 기록 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  휴가 기록 ({vacationRecords.length}건)
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">휴가 기록을 불러오는 중...</p>
                </div>
              ) : vacationRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏖️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">휴가 기록이 없습니다</h3>
                  <p className="text-gray-600">아직 등록된 휴가 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          전문가
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          휴가 기간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사유
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          신청일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vacationRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {record.expertName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {record.expertId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(record.startDate).toLocaleDateString()} ~
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(record.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {record.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusColor(record.status)
                            }`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.requestedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {record.status === 'pending' && (
                                <>
                                  <button className="text-green-600 hover:text-green-900">
                                    승인
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    거부
                                  </button>
                                </>
                              )}
                              <button className="text-blue-600 hover:text-blue-900">
                                상세
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
                      <span className="text-blue-600 text-sm">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">총 휴가</p>
                    <p className="text-2xl font-semibold text-gray-900">{vacationRecords.length}</p>
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
                    <p className="text-sm font-medium text-gray-500">승인됨</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {vacationRecords.filter(r => r.status === 'approved').length}
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
                      {vacationRecords.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-sm">❌</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">거부됨</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {vacationRecords.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ExpertVacationPage);
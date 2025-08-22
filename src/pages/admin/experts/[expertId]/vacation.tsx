// 개별 전문가 휴가 관리 페이지

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { withAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { userService } from '@/services/user';
import { centerService } from '@/services/center';
import { vacationService, VacationRecord as APIVacationRecord, CreateVacationRequest } from '@/services/vacation';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import Link from 'next/link';

interface VacationRecord {
  id: number;
  expert_id: number;
  expert_name: string;
  expert_email: string;
  approved_by?: number;
  approver_name?: string;
  start_date: string;
  end_date: string;
  vacation_type: 'annual' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface ExpertInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  center_id?: number;
  centerName?: string;
  user_type: string;
  status: string;
}

const ExpertVacationPage: React.FC = () => {
  const router = useRouter();
  const { expertId } = router.query;
  const { user } = useStore();
  const userType = getUserType(user);

  const [expert, setExpert] = useState<ExpertInfo | null>(null);
  const [vacationRecords, setVacationRecords] = useState<VacationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewVacationForm, setShowNewVacationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 새 휴가 신청 폼
  const [vacationForm, setVacationForm] = useState({
    startDate: '',
    endDate: '',
    vacationType: 'annual' as 'annual' | 'sick' | 'personal' | 'emergency',
    reason: ''
  });

  const fetchExpertData = useCallback(async () => {
    if (!expertId || Array.isArray(expertId)) return;

    try {
      setLoading(true);
      setError('');
      
      // 전문가 정보 조회
      const expertData = await userService.getUserById(parseInt(expertId));
      
      // 센터 정보가 있으면 센터 이름도 조회
      let centerName = '';
      if (expertData.center_id) {
        try {
          const centerInfo = await centerService.getCenterById(expertData.center_id);
          centerName = centerInfo.name;
        } catch (err) {
          console.error('센터 정보 조회 실패:', err);
        }
      }

      setExpert({
        ...expertData,
        centerName
      });

      // 휴가 기록 조회 - 실제 API 호출
      const vacationResponse = await vacationService.getVacationsByExpert(parseInt(expertId));
      setVacationRecords(vacationResponse.vacations);
    } catch (error: any) {
      console.error('전문가 정보 조회 실패:', error);
      setError(error.message || '전문가 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    fetchExpertData();
  }, [fetchExpertData]);

  const handleFormChange = (field: string, value: string) => {
    setVacationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitVacation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expertId || Array.isArray(expertId)) return;

    try {
      setSubmitting(true);
      setError('');

      // 유효성 검사
      if (!vacationForm.startDate || !vacationForm.endDate || !vacationForm.reason.trim()) {
        setError('모든 필드를 입력해주세요.');
        return;
      }

      if (new Date(vacationForm.endDate) < new Date(vacationForm.startDate)) {
        setError('종료일은 시작일보다 늦어야 합니다.');
        return;
      }

      // 실제 API 호출
      const createRequest: CreateVacationRequest = {
        expert_id: parseInt(expertId),
        start_date: vacationForm.startDate,
        end_date: vacationForm.endDate,
        vacation_type: vacationForm.vacationType,
        reason: vacationForm.reason
      };

      const newVacation = await vacationService.createVacation(createRequest);
      setVacationRecords(prev => [newVacation, ...prev]);
      setVacationForm({ startDate: '', endDate: '', vacationType: 'annual', reason: '' });
      setShowNewVacationForm(false);
      
      alert('휴가 신청이 성공적으로 제출되었습니다.');
    } catch (error: any) {
      console.error('휴가 신청 실패:', error);
      setError(error.message || '휴가 신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacationAction = async (vacationId: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      setError('');
      
      // 실제 API 호출
      let updatedVacation: VacationRecord;
      if (action === 'approve') {
        updatedVacation = await vacationService.approveVacation(vacationId);
      } else {
        updatedVacation = await vacationService.rejectVacation(vacationId, reason || '');
      }
      
      // UI 상태 업데이트
      setVacationRecords(prev => prev.map(vacation => 
        vacation.id === vacationId ? updatedVacation : vacation
      ));
      
      alert(`휴가 신청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
    } catch (error: any) {
      console.error('휴가 상태 변경 실패:', error);
      setError(error.message || '휴가 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: VacationRecord['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VacationRecord['status']) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      case 'pending': return '승인대기';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !expert) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/admin" className="hover:text-gray-700">관리자</Link>
                <span>›</span>
                <Link href="/admin/experts" className="hover:text-gray-700">전문가 관리</Link>
                <span>›</span>
                <Link href={`/admin/experts/${expertId}/profile`} className="hover:text-gray-700">{expert?.name}</Link>
                <span>›</span>
                <span className="text-gray-900">휴가 관리</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {expert?.name} 전문가 휴가 관리
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {expert?.centerName || '소속 센터 없음'} • {expert?.email}
                </p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewVacationForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                휴가 신청
              </button>
              <Link
                href={`/admin/experts/${expertId}/profile`}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                프로필로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 휴가 신청 폼 */}
        {showNewVacationForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">새 휴가 신청</h2>
              <button
                onClick={() => setShowNewVacationForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitVacation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
                  <input
                    type="date"
                    value={vacationForm.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일 *</label>
                  <input
                    type="date"
                    value={vacationForm.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">휴가 유형 *</label>
                  <select
                    value={vacationForm.vacationType}
                    onChange={(e) => handleFormChange('vacationType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="annual">연차</option>
                    <option value="sick">병가</option>
                    <option value="personal">개인사유</option>
                    <option value="emergency">긴급</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">휴가 사유 *</label>
                <textarea
                  value={vacationForm.reason}
                  onChange={(e) => handleFormChange('reason', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="휴가 사유를 입력하세요..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewVacationForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {submitting ? '신청 중...' : '휴가 신청'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 휴가 기록 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              휴가 기록 ({vacationRecords.length}건)
            </h2>
          </div>

          {vacationRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏖️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">휴가 기록이 없습니다</h3>
              <p className="text-gray-600">아직 신청된 휴가가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      처리자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vacationRecords.map((vacation) => (
                    <tr key={vacation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(vacation.start_date).toLocaleDateString()} ~ {new Date(vacation.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) / (1000 * 60 * 60 * 24) + 1)}일
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {vacation.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacation.status)}`}>
                          {getStatusText(vacation.status)}
                        </span>
                        {vacation.status === 'rejected' && vacation.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            거부 사유: {vacation.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vacation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vacation.approver_name || '-'}
                        {vacation.approved_at && (
                          <div className="text-xs text-gray-400">
                            {new Date(vacation.approved_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {vacation.status === 'pending' && (userType === 'super_admin' || userType === 'center_manager') && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVacationAction(vacation.id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('거부 사유를 입력하세요:');
                                if (reason) handleVacationAction(vacation.id, 'reject', reason);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              거부
                            </button>
                          </div>
                        )}
                        {vacation.status !== 'pending' && (
                          <span className="text-gray-400">-</span>
                        )}
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
                  {vacationRecords.filter(v => v.status === 'approved').length}
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
                  {vacationRecords.filter(v => v.status === 'pending').length}
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
                  {vacationRecords.filter(v => v.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminOnly(ExpertVacationPage);
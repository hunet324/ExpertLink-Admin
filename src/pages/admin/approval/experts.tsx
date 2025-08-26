import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { adminService, ExpertApplication } from '@/services/admin';
import { ApiError } from '@/types/auth';
import { useStore } from '@/store/useStore';
import { tokenManager } from '@/services/api';
import { authService } from '@/services/auth';
import { withAdminOnly } from '@/components/withPermission';
import { getUserType } from '@/utils/permissions';

type StatusFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';

const ExpertApprovalPage: React.FC = () => {
  const router = useRouter();
  const { setPendingExpertsCount, isAuthenticated, user, getCurrentUser } = useStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [expertApplications, setExpertApplications] = useState<ExpertApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  const userType = getUserType(user);

  // 페이지 초기화 - HOC에서 권한 체크를 하므로 단순화
  useEffect(() => {
    if (initialized) return;
    
    console.log('=== 페이지 초기화 ===');
    
    // 데이터 로드 (권한 체크는 HOC에서 처리)
    loadExpertApplications();
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExpertApplications = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const experts = await adminService.getPendingExperts();
      console.log('API 응답:', experts);
      
      // API에서 배열을 리턴하지 않는 경우 빈 배열로 처리
      if (!Array.isArray(experts)) {
        console.warn('예상하지 못한 API 응답 형식:', experts);
        setExpertApplications([]);
        setPendingExpertsCount(0);
        return;
      }
      
      setExpertApplications(experts);
      
      // 대기 중인 전문가 수 계산
      const pendingCount = experts.filter(e => 
        e.userStatus === 'pending'
      ).length;
      setPendingExpertsCount(pendingCount);
      
    } catch (err: any) {
      console.error('로드 실패:', err);
      setError(`데이터를 불러오는데 실패했습니다: ${err.message || '알 수 없는 오류'}`);
      setExpertApplications([]);
      setPendingExpertsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 나머지 함수들은 기존과 동일...
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending': return 'bg-primary text-white';
      case 'under_review': return 'bg-secondary-400 text-white';
      case 'approved': return 'bg-accent text-white';
      case 'rejected': return 'bg-error text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'under_review': return '검토 중';
      case 'approved': return '승인 완료';
      case 'rejected': return '승인 거절';
      default: return status || '알 수 없음';
    }
  };

  const filteredApplications = expertApplications.filter(app => 
    statusFilter === 'all' || app.userStatus === statusFilter
  );

  const getFilterCount = (status: StatusFilter) => {
    if (status === 'all') return expertApplications.length;
    return expertApplications.filter(app => app.userStatus === status).length;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '미지정';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return '잘못된 날짜';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

  // 전문가 승인 처리
  const handleApproveExpert = async (expert: ExpertApplication) => {
    if (!confirm(`${expert.userName} 전문가를 승인하시겠습니까?`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      await adminService.verifyExpert(expert, {
        isVerified: true,
        verificationNote: '관리자에 의한 승인 처리',
        userId: expert.userId
      });

      alert('전문가 승인이 완료되었습니다.');
      
      // 목록 새로고침
      await loadExpertApplications();
    } catch (error: any) {
      console.error('승인 처리 실패:', error);
      alert(`승인 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 전문가 거절 처리
  const handleRejectExpert = async (expert: ExpertApplication) => {
    const reason = prompt(`${expert.userName} 전문가를 거절하는 이유를 입력해주세요:`);
    if (reason === null) {
      return; // 취소
    }

    if (!reason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      await adminService.verifyExpert(expert, {
        isVerified: false,
        verificationNote: reason.trim(),
        userId: expert.userId
      });

      alert('전문가 거절 처리가 완료되었습니다.');
      
      // 목록 새로고침
      await loadExpertApplications();
    } catch (error: any) {
      console.error('거절 처리 실패:', error);
      alert(`거절 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialized || isLoading) {
    return (
      <div className="flex h-screen bg-background-50 items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-50">
      <Sidebar 
        userType={userType} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">👨‍⚕️</span>
                전문가 승인 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                새로 지원한 전문가들의 자격을 검토하고 승인 여부를 결정할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{getFilterCount('pending')}</div>
                  <div className="text-xs text-secondary-400">대기중</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">관</span>
                </div>
                <span className="text-body text-secondary-600">관리자</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-error mr-2">⚠️</span>
                <span className="text-error text-body">{error}</span>
              </div>
            </div>
          )}

          {/* 상태 필터 탭 */}
          <div className="mb-6 bg-white rounded-custom shadow-soft p-4">
            <div className="flex items-center space-x-4">
              <span className="text-body font-medium text-secondary-600">상태별 필터:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'pending', label: '승인 대기', count: getFilterCount('pending') },
                  { key: 'under_review', label: '검토 중', count: getFilterCount('under_review') },
                  { key: 'approved', label: '승인 완료', count: getFilterCount('approved') },
                  { key: 'rejected', label: '승인 거절', count: getFilterCount('rejected') },
                  { key: 'all', label: '전체', count: getFilterCount('all') },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as StatusFilter)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors ${
                      statusFilter === filter.key
                        ? 'bg-primary text-white'
                        : 'bg-background-100 text-secondary-600 hover:bg-background-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application.userId} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-h4 font-semibold text-secondary">
                        {application.userName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(application.userStatus)}`}>
                        {getStatusText(application.userStatus)}
                      </span>
                    </div>
                    <div className="text-caption text-secondary-400">
                      신청일: {formatDate(application.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">기본 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div>이메일: {application.userEmail}</div>
                        <div>자격증: {application.licenseNumber || '미입력'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    {(application.userStatus === 'pending' || 
                      application.userStatus === 'under_review') ? (
                      <>
                        <button
                          className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors disabled:bg-background-300 disabled:cursor-not-allowed"
                          onClick={() => handleRejectExpert(application)}
                          disabled={isLoading}
                        >
                          거절
                        </button>
                        <button
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors disabled:bg-background-300 disabled:cursor-not-allowed"
                          onClick={() => handleApproveExpert(application)}
                          disabled={isLoading}
                        >
                          승인
                        </button>
                      </>
                    ) : (
                      <div className="text-caption text-secondary-400">
                        처리 완료됨
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">👨‍⚕️</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {statusFilter === 'all' ? '등록된 전문가가 없습니다' : `${getStatusText(statusFilter)} 상태의 전문가가 없습니다`}
                </h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default withAdminOnly(ExpertApprovalPage, false); // 레이아웃 비활성화 - 페이지에서 직접 처리
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { adminService, ExpertApplication } from '@/services/admin';
import { ApiError } from '@/types/auth';
import { useStore } from '@/store/useStore';
import { tokenManager } from '@/services/api';
import { authService } from '@/services/auth';


type StatusFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';

const ExpertApprovalPage: React.FC = () => {
  const router = useRouter();
  const { setPendingExpertsCount, decrementPendingExpertsCount } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ExpertApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expertApplications, setExpertApplications] = useState<ExpertApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');


  // 안전한 카운트 업데이트 함수
  const updatePendingCount = (experts: ExpertApplication[]) => {
    if (!experts || !Array.isArray(experts)) {
      console.warn('experts가 배열이 아닙니다:', experts);
      setPendingExpertsCount(0);
      return;
    }

    let pendingCount = 0;
    for (const expert of experts) {
      if (expert && expert.user_status === 'pending') {
        pendingCount++;
      }
    }
    setPendingExpertsCount(pendingCount);
  };

  // 전문가 목록 로드
  useEffect(() => {
    // API 연결 시도
    loadExpertApplications();
  }, []);

  const loadExpertApplications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await adminService.getPendingExperts();
      console.log('API 응답:', response); // 디버깅용
      
      // API 응답이 배열인지 확인
      const experts: ExpertApplication[] = Array.isArray(response) ? response : [];
      setExpertApplications(experts);
      updatePendingCount(experts);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message as string || '전문가 목록을 불러오는데 실패했습니다.');
      console.error('전문가 목록 로드 실패:', err);
      
      // API 실패 시 빈 배열로 설정
      setExpertApplications([]);
      updatePendingCount([]);
    } finally {
      setIsLoading(false);
    }
  };



  const displayApplications = expertApplications || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-primary text-white';
      case 'under_review': return 'bg-secondary-400 text-white';
      case 'approved': return 'bg-accent text-white';
      case 'rejected': return 'bg-error text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'under_review': return '검토 중';
      case 'approved': return '승인 완료';
      case 'rejected': return '승인 거절';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-50 border-error-200';
      case 'medium': return 'text-primary bg-primary-50 border-primary-200';
      case 'low': return 'text-secondary-400 bg-secondary-50 border-secondary-200';
      default: return 'text-secondary-400 bg-secondary-50 border-secondary-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const filteredApplications = displayApplications.filter(app => 
    statusFilter === 'all' || app.user_status === statusFilter
  );

  const getFilterCount = (status: StatusFilter) => {
    if (status === 'all') return displayApplications.length;
    return displayApplications.filter(app => app.user_status === status).length;
  };

  const handleApprove = async (applicationId: number, adminNotes?: string) => {
    try {
      setIsLoading(true);
      
      // 토큰 체크
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      
      // 토큰 만료 체크
      if (tokenManager.isTokenExpired(accessToken)) {
        console.log('토큰 만료, 갱신 시도');
        try {
          await authService.refreshToken();
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          router.push('/login');
          return;
        }
      }
      
      const verificationData = {
        is_verified: true,
        verification_note: adminNotes || '전문가 승인 완료'
      };
      
      console.log('=== 승인 요청 시작 ===')
      console.log('전문가 ID:', applicationId);
      console.log('요청 데이터:', JSON.stringify(verificationData, null, 2));
      console.log('현재 토큰:', tokenManager.getAccessToken()?.substring(0, 50) + '...');
      
      const response = await adminService.verifyExpert(applicationId, verificationData);
      console.log('승인 응답:', response);
      
      // 로컬 상태 업데이트
      setExpertApplications(prev => {
        const updated = prev.map(app => 
          app.user_id === applicationId 
            ? { ...app, user_status: 'approved' as const }
            : app
        );
        console.log('로컬 상태 업데이트 완료:', updated.filter(app => app.user_id === applicationId));
        return updated;
      });
      
      // 전역 상태의 대기 중인 전문가 수 감소
      decrementPendingExpertsCount();
      
      alert('전문가 승인이 완료되었습니다.');
      console.log('=== 승인 요청 성공 ===')
    } catch (err: any) {
      console.error('=== 승인 요청 실패 ===')
      console.error('전체 에러 객체:', err);
      
      // 401 에러 처리
      if (err.statusCode === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        tokenManager.clearTokens();
        router.push('/login');
        return;
      }
      
      const errorMessage = err.message || err.toString() || '알 수 없는 오류';
      alert(`승인 처리 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (applicationId: number, adminNotes: string) => {
    if (!adminNotes.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const verificationData = {
        is_verified: false,
        verification_note: adminNotes
      };
      
      console.log('거절 요청 데이터:', verificationData);
      console.log('전문가 ID:', applicationId);
      
      await adminService.verifyExpert(applicationId, verificationData);
      
      // 로컬 상태 업데이트
      setExpertApplications(prev => prev.map(app => 
        app.user_id === applicationId 
          ? { ...app, user_status: 'rejected' as const }
          : app
      ));
      
      // 전역 상태의 대기 중인 전문가 수 감소
      decrementPendingExpertsCount();
      
      alert('전문가 거절 처리가 완료되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      console.error('전문가 거절 실패:', err);
      console.error('API 오류 상세:', {
        status: apiError.statusCode,
        message: apiError.message,
        response: err
      });
      alert(`거절 처리 중 오류가 발생했습니다: ${apiError.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (applicationId: number, reviewerNotes?: string) => {
    // 검토 상태는 로컬에서만 처리 (별도 API가 없다면)
    setExpertApplications(prev => prev.map(app => 
      app.user_id === applicationId 
        ? { ...app, user_status: 'under_review' as const }
        : app
    ));
    console.log('전문가 검토 시작:', applicationId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };


  const openDetailModal = (application: ExpertApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
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
                <span className="mr-3 text-2xl">👨‍⚕️</span>
                전문가 승인 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                새로 지원한 전문가들의 자격을 검토하고 승인 여부를 결정할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{getFilterCount('pending')}</div>
                  <div className="text-xs text-secondary-400">대기중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{getFilterCount('under_review')}</div>
                  <div className="text-xs text-secondary-400">검토중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getFilterCount('approved')}</div>
                  <div className="text-xs text-secondary-400">승인됨</div>
                </div>
              </div>

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

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-error mr-2">⚠️</span>
                <span className="text-error text-body">{error}</span>
                <button
                  onClick={loadExpertApplications}
                  className="ml-4 text-error underline hover:no-underline"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
                <span className="text-primary text-body">데이터를 불러오는 중...</span>
              </div>
            </div>
          )}
          {/* 필터 탭 */}
          <div className="mb-6">
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'pending' as StatusFilter, label: '승인 대기', count: getFilterCount('pending') },
                  { key: 'under_review' as StatusFilter, label: '검토 중', count: getFilterCount('under_review') },
                  { key: 'approved' as StatusFilter, label: '승인 완료', count: getFilterCount('approved') },
                  { key: 'rejected' as StatusFilter, label: '승인 거절', count: getFilterCount('rejected') },
                  { key: 'all' as StatusFilter, label: '전체', count: getFilterCount('all') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      statusFilter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        statusFilter === tab.key
                          ? 'bg-white text-primary'
                          : 'bg-background-200 text-secondary-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 신청 목록 */}
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application.user_id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-h4 font-semibold text-secondary">{application.user_name}</h3>
                      <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption">
                        {application.license_type || '미입력'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(application.user_status)}`}>
                        {getStatusText(application.user_status)}
                      </span>
                    </div>
                    <div className="text-caption text-secondary-400">
                      신청일: {formatDate(application.created_at)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* 기본 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">기본 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div>이메일: {application.user_email}</div>
                        <div>전화번호: {application.phone || '미입력'}</div>
                        <div>경력: {application.years_experience ? `${application.years_experience}년` : '미입력'}</div>
                        <div>자격증: {application.license_number || '미입력'}</div>
                      </div>
                    </div>

                    {/* 전문분야 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">전문분야</h4>
                      <div className="flex flex-wrap gap-1">
                        {application.specialization ? (
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                            {application.specialization}
                          </span>
                        ) : (
                          <span className="text-secondary-400 text-xs">미입력</span>
                        )}
                      </div>
                    </div>

                    {/* 서류 현황 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">
                        서류 현황 ({application.verification_documents?.length || 0}/5)
                      </h4>
                      <div className="space-y-1">
                        {[
                          { key: 'license', label: '자격증' },
                          { key: 'degree', label: '학위증명서' },
                          { key: 'cv', label: '이력서' },
                          { key: 'portfolio', label: '포트폴리오' },
                          { key: 'references', label: '추천서' }
                        ].map((doc, index) => (
                          <div key={doc.key} className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              index < (application.verification_documents?.length || 0)
                                ? 'bg-accent' 
                                : 'bg-background-300'
                            }`}></span>
                            <span className="text-xs text-secondary-600">{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 제공 상담 및 요금 */}
                  <div className="bg-background-50 p-4 rounded-lg mb-4">
                    <h4 className="text-caption font-semibold text-secondary-600 mb-2">희망 시간당 요금</h4>
                    <div className="flex space-x-6">
                      {application.hourly_rate ? (
                        <div className="flex items-center space-x-2">
                          <span>💰</span>
                          <span className="text-caption">시간당: {formatCurrency(application.hourly_rate)}</span>
                        </div>
                      ) : (
                        <span className="text-secondary-400 text-caption">요금 정보 미입력</span>
                      )}
                    </div>
                  </div>

                  {/* 관리자/검토자 메모 */}
                  {application.introduction && (
                    <div className="space-y-2 mb-4">
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <label className="text-caption text-secondary-600 block mb-1">자기소개</label>
                        <p className="text-caption text-secondary-700">{application.introduction}</p>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openDetailModal(application)}
                      className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                    >
                      상세보기
                    </button>

                    <div className="flex space-x-2">
                      {application.user_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReview(application.user_id, '서류 검토를 시작합니다.')}
                            className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                          >
                            검토 시작
                          </button>
                          <button
                            onClick={() => handleApprove(application.user_id)}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                          >
                            즉시 승인
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('거절 사유를 입력하세요:');
                              if (reason) handleReject(application.user_id, reason);
                            }}
                            className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                          >
                            거절
                          </button>
                        </>
                      )}

                      {application.user_status === 'under_review' && (
                        <>
                          <button
                            onClick={() => handleApprove(application.user_id, '검토 완료 후 승인')}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('거절 사유를 입력하세요:');
                              if (reason) handleReject(application.user_id, reason);
                            }}
                            className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                          >
                            거절
                          </button>
                        </>
                      )}

                      {application.user_status === 'approved' && (
                        <button
                          onClick={() => router.push(`/admin/system/experts?search=${application.user_email}`)}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                        >
                          전문가 정보
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">👨‍⚕️</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {statusFilter === 'pending' ? '승인 대기 중인 신청이 없습니다' : `${getStatusText(statusFilter)} 신청이 없습니다`}
                </h3>
                <p className="text-caption text-secondary-400">
                  새로운 전문가 신청이 들어오면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">{selectedApplication.user_name} 전문가 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 학력 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">학력</h4>
                  <div className="text-body text-secondary-700">
                    {selectedApplication.education || '미입력'}
                  </div>
                </div>

                {/* 자격증 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">자격증</h4>
                  <div className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                    <span className="text-accent-700 text-body">{selectedApplication.license_type || '미입력'}</span>
                  </div>
                </div>

                {/* 경력 사항 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">경력 사항</h4>
                  <div className="border border-background-200 rounded-lg p-4">
                    <div className="text-body text-secondary-700">{selectedApplication.career_history || '미입력'}</div>
                  </div>
                </div>

                {/* 소개글 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">소개글</h4>
                  <div className="bg-background-50 p-4 rounded-lg">
                    <p className="text-body text-secondary-700 leading-relaxed whitespace-pre-wrap">
                      {selectedApplication.introduction || '미입력'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
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

export default ExpertApprovalPage;
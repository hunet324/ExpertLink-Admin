import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface NewRequest {
  id: string;
  clientName: string;
  clientId: string;
  clientPhone: string;
  clientEmail: string;
  requestType: string;
  counselingType: 'video' | 'chat' | 'voice';
  preferredDate: string;
  preferredTime: string;
  alternativeDate?: string;
  alternativeTime?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  sessionDuration: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';

const NewRequestsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // 신규 요청 샘플 데이터 (확장 버전)
  const newRequests: NewRequest[] = [
    {
      id: '1',
      clientName: '정**',
      clientId: 'client_007',
      clientPhone: '010-1111-2222',
      clientEmail: 'client007@example.com',
      requestType: '화상 상담',
      counselingType: 'video',
      preferredDate: '2024-08-12',
      preferredTime: '15:00',
      alternativeDate: '2024-08-13',
      alternativeTime: '14:00',
      priority: 'high',
      status: 'pending',
      reason: '업무 스트레스로 인한 불안감 상담 요청',
      sessionDuration: 60,
      createdAt: '2024-08-11 10:30:00',
      updatedAt: '2024-08-11 10:30:00',
      notes: '첫 상담입니다. 사전 준비 필요'
    },
    {
      id: '2',
      clientName: '한**',
      clientId: 'client_008',
      clientPhone: '010-3333-4444',
      clientEmail: 'client008@example.com',
      requestType: '채팅 상담',
      counselingType: 'chat',
      preferredDate: '2024-08-13',
      preferredTime: '11:00',
      priority: 'medium',
      status: 'pending',
      reason: '대인관계 문제 상담',
      sessionDuration: 90,
      createdAt: '2024-08-11 09:15:00',
      updatedAt: '2024-08-11 09:15:00'
    },
    {
      id: '3',
      clientName: '윤**',
      clientId: 'client_009',
      clientPhone: '010-5555-6666',
      clientEmail: 'client009@example.com',
      requestType: '음성 상담',
      counselingType: 'voice',
      preferredDate: '2024-08-14',
      preferredTime: '09:30',
      priority: 'low',
      status: 'pending',
      reason: '학업 스트레스 상담',
      sessionDuration: 45,
      createdAt: '2024-08-10 16:20:00',
      updatedAt: '2024-08-10 16:20:00'
    },
    {
      id: '4',
      clientName: '조**',
      clientId: 'client_010',
      clientPhone: '010-7777-8888',
      clientEmail: 'client010@example.com',
      requestType: '화상 상담',
      counselingType: 'video',
      preferredDate: '2024-08-12',
      preferredTime: '10:00',
      priority: 'high',
      status: 'approved',
      reason: '우울감 지속 상담 요청',
      sessionDuration: 60,
      createdAt: '2024-08-10 14:45:00',
      updatedAt: '2024-08-11 08:30:00',
      notes: '이전 상담 이력 있음'
    },
    {
      id: '5',
      clientName: '서**',
      clientId: 'client_011',
      clientPhone: '010-9999-0000',
      clientEmail: 'client011@example.com',
      requestType: '채팅 상담',
      counselingType: 'chat',
      preferredDate: '2024-08-15',
      preferredTime: '16:00',
      priority: 'medium',
      status: 'rejected',
      reason: '가족 갈등 상담',
      sessionDuration: 60,
      createdAt: '2024-08-10 11:30:00',
      updatedAt: '2024-08-11 07:15:00',
      notes: '시간대 불가능으로 거절'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-primary text-white';
      case 'approved': return 'bg-accent text-white';
      case 'rejected': return 'bg-error text-white';
      case 'cancelled': return 'bg-background-400 text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'chat': return '💭';
      case 'voice': return '🎧';
      default: return '💬';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return '화상 상담';
      case 'chat': return '채팅 상담';
      case 'voice': return '음성 상담';
      default: return type;
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

  const filteredRequests = newRequests.filter(request => {
    const priorityMatch = priorityFilter === 'all' || request.priority === priorityFilter;
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    return priorityMatch && statusMatch;
  });

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return newRequests.length;
    return newRequests.filter(r => r.status === status).length;
  };

  const handleApproveRequest = async (requestId: string) => {
    // API 호출 로직
    console.log('승인:', requestId);
    // 실제로는 상태 업데이트 후 리렌더링
  };

  const handleRejectRequest = async (requestId: string, reason?: string) => {
    // API 호출 로직
    console.log('거절:', requestId, reason);
    // 실제로는 상태 업데이트 후 리렌더링
  };

  const handleBatchApprove = async () => {
    if (selectedRequests.length === 0) return;
    
    if (confirm(`선택한 ${selectedRequests.length}개 요청을 모두 승인하시겠습니까?`)) {
      // 배치 승인 로직
      console.log('배치 승인:', selectedRequests);
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    const pendingRequests = filteredRequests.filter(r => r.status === 'pending').map(r => r.id);
    setSelectedRequests(
      selectedRequests.length === pendingRequests.length ? [] : pendingRequests
    );
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return {
      date: date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      }),
      time: date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary">신규 요청</h1>
              <p className="text-caption text-secondary-400 mt-1">
                새로운 상담 요청을 검토하고 승인/거절할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 요청 통계 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{newRequests.length}</div>
                  <div className="text-xs text-secondary-400">총 요청</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-primary">{getStatusCount('pending')}</div>
                  <div className="text-xs text-secondary-400">대기중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getStatusCount('approved')}</div>
                  <div className="text-xs text-secondary-400">승인됨</div>
                </div>
              </div>

              {/* 일괄 처리 버튼 */}
              {selectedRequests.length > 0 && (
                <button
                  onClick={handleBatchApprove}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  선택한 요청 승인 ({selectedRequests.length})
                </button>
              )}

              {/* 알림 및 프로필 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getStatusCount('pending')}
                </span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">김</span>
                </div>
                <span className="text-body text-secondary-600">김상담사님</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 필터 영역 */}
          <div className="mb-6 space-y-4">
            {/* 상태 필터 */}
            <div className="bg-white p-4 rounded-lg shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-body font-semibold text-secondary">상태별 필터</h3>
                {filteredRequests.filter(r => r.status === 'pending').length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-primary hover:text-primary-600 text-caption transition-colors"
                  >
                    {selectedRequests.length === filteredRequests.filter(r => r.status === 'pending').length ? '전체 해제' : '전체 선택'}
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                {[
                  { key: 'all' as StatusFilter, label: '전체', count: getStatusCount('all') },
                  { key: 'pending' as StatusFilter, label: '대기중', count: getStatusCount('pending') },
                  { key: 'approved' as StatusFilter, label: '승인됨', count: getStatusCount('approved') },
                  { key: 'rejected' as StatusFilter, label: '거절됨', count: getStatusCount('rejected') }
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

          {/* 요청 목록 */}
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                const { date: preferredDate, time: preferredTime } = formatDateTime(request.preferredDate, request.preferredTime);
                const alternativeDateTime = request.alternativeDate && request.alternativeTime 
                  ? formatDateTime(request.alternativeDate, request.alternativeTime)
                  : null;

                return (
                  <div key={request.id} className="bg-white rounded-custom shadow-soft p-6">
                    <div className="flex items-start space-x-4">
                      {/* 체크박스 (대기중 요청만) */}
                      {request.status === 'pending' && (
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => handleSelectRequest(request.id)}
                            className="w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                        </div>
                      )}

                      {/* 메인 콘텐츠 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getTypeIcon(request.counselingType)}</span>
                              <div>
                                <h3 className="text-body font-semibold text-secondary-700">
                                  {request.clientName}
                                </h3>
                                <p className="text-caption text-secondary-400">
                                  {getTypeText(request.counselingType)} • {request.sessionDuration}분
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                                {getPriorityText(request.priority)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-caption text-secondary-400">
                              요청일: {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        {/* 연락처 정보 */}
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="text-caption text-secondary-400 block mb-1">연락처</label>
                            <div className="text-body text-secondary-700 space-y-1">
                              <div>{request.clientPhone}</div>
                              <div className="text-caption">{request.clientEmail}</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-caption text-secondary-400 block mb-1">희망 일시</label>
                            <div className="text-body text-secondary-700">
                              <div className="font-medium">1순위: {preferredDate} {preferredTime}</div>
                              {alternativeDateTime && (
                                <div className="text-caption text-secondary-500">
                                  2순위: {alternativeDateTime.date} {alternativeDateTime.time}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 상담 사유 */}
                        <div className="bg-background-50 p-4 rounded-lg mb-4">
                          <label className="text-caption text-secondary-400 block mb-2">상담 사유</label>
                          <p className="text-body text-secondary-700">{request.reason}</p>
                        </div>

                        {/* 메모 */}
                        {request.notes && (
                          <div className="bg-primary-50 p-3 rounded-lg mb-4">
                            <label className="text-caption text-primary-600 block mb-1">메모</label>
                            <p className="text-caption text-primary-700">{request.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex flex-col space-y-2 ml-4 min-w-[120px]">
                        <button
                          onClick={() => router.push(`/expert/clients/profile?id=${request.clientId}`)}
                          className="bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                        >
                          내담자 정보
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-primary text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('거절 사유를 입력하세요:');
                                if (reason) handleRejectRequest(request.id, reason);
                              }}
                              className="bg-error-50 text-error px-3 py-2 rounded-lg text-caption font-medium hover:bg-error-100 transition-colors"
                            >
                              거절
                            </button>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <button
                            onClick={() => router.push(`/expert/schedule/new?clientId=${request.clientId}&requestId=${request.id}`)}
                            className="bg-accent text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                          >
                            일정 등록
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {statusFilter === 'all' ? '요청이 없습니다' : `${getStatusText(statusFilter)} 요청이 없습니다`}
                </h3>
                <p className="text-caption text-secondary-400">
                  {statusFilter === 'pending' 
                    ? '새로운 상담 요청이 들어오면 여기에 표시됩니다.' 
                    : '다른 상태의 요청을 확인해보세요.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewRequestsPage;
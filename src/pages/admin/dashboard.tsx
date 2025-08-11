import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface SystemStats {
  totalUsers: number;
  totalExperts: number;
  totalSessions: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'expert_application' | 'session_completed' | 'payment' | 'system_alert';
  description: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

interface PendingApproval {
  id: string;
  type: 'user' | 'expert';
  name: string;
  email: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 시스템 통계 샘플 데이터
  const systemStats: SystemStats = {
    totalUsers: 1247,
    totalExperts: 89,
    totalSessions: 3429,
    totalRevenue: 45680000,
    pendingApprovals: 15,
    activeUsers: 342
  };

  // 최근 활동 샘플 데이터
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'expert_application',
      description: '김상담사님이 전문가 등록을 신청했습니다.',
      timestamp: '2024-08-11T10:30:00',
      status: 'info'
    },
    {
      id: '2',
      type: 'session_completed',
      description: '오늘 총 45건의 상담이 완료되었습니다.',
      timestamp: '2024-08-11T09:15:00',
      status: 'success'
    },
    {
      id: '3',
      type: 'system_alert',
      description: '서버 CPU 사용률이 85%를 초과했습니다.',
      timestamp: '2024-08-11T08:45:00',
      status: 'warning'
    },
    {
      id: '4',
      type: 'payment',
      description: '7월 전문가 정산이 완료되었습니다.',
      timestamp: '2024-08-11T08:00:00',
      status: 'success'
    },
    {
      id: '5',
      type: 'user_registration',
      description: '이번 주 신규 사용자 등록 50% 증가',
      timestamp: '2024-08-10T18:30:00',
      status: 'info'
    }
  ];

  // 승인 대기 목록 샘플 데이터
  const pendingApprovals: PendingApproval[] = [
    {
      id: '1',
      type: 'expert',
      name: '박심리사',
      email: 'park.counselor@example.com',
      submittedAt: '2024-08-10T14:20:00',
      priority: 'high'
    },
    {
      id: '2',
      type: 'expert',
      name: '이상담사',
      email: 'lee.therapist@example.com',
      submittedAt: '2024-08-10T11:45:00',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'user',
      name: '최내담자',
      email: 'client.choi@example.com',
      submittedAt: '2024-08-10T09:30:00',
      priority: 'low'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'expert_application': return '👨‍⚕️';
      case 'session_completed': return '✅';
      case 'payment': return '💰';
      case 'system_alert': return '⚠️';
      default: return '📋';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'info': return 'border-l-primary bg-primary-25';
      case 'success': return 'border-l-accent bg-accent-25';
      case 'warning': return 'border-l-error bg-error-25';
      case 'error': return 'border-l-error bg-error-50';
      default: return 'border-l-secondary-300 bg-background-25';
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

  const formatCurrency = (amount: number) => {
    return `${(amount / 10000).toFixed(0)}만원`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
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
              <h1 className="text-h2 font-bold text-secondary">관리자 대시보드</h1>
              <p className="text-caption text-secondary-400 mt-1">
                ExpertLink 플랫폼의 전체 현황을 모니터링하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 시스템 상태 */}
              <div className="flex items-center space-x-2 bg-accent-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-caption text-accent-700">시스템 정상</span>
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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 주요 지표 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 사용자</p>
                  <p className="text-h3 font-bold text-secondary mt-1">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">전문가</p>
                  <p className="text-h3 font-bold text-secondary mt-1">{systemStats.totalExperts}</p>
                </div>
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 상담</p>
                  <p className="text-h3 font-bold text-secondary mt-1">{systemStats.totalSessions.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-logo-point/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 매출</p>
                  <p className="text-h3 font-bold text-secondary mt-1">{formatCurrency(systemStats.totalRevenue)}</p>
                </div>
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">승인 대기</p>
                  <p className="text-h3 font-bold text-error mt-1">{systemStats.pendingApprovals}</p>
                </div>
                <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">활성 사용자</p>
                  <p className="text-h3 font-bold text-accent mt-1">{systemStats.activeUsers}</p>
                </div>
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🟢</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 활동 */}
            <div className="bg-white rounded-custom shadow-soft">
              <div className="p-6 border-b border-background-200">
                <h2 className="text-h3 font-semibold text-secondary flex items-center">
                  <span className="mr-2">📊</span>
                  최근 시스템 활동
                </h2>
              </div>
              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`p-3 border-l-4 rounded ${getActivityColor(activity.status)}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-body text-secondary-700">{activity.description}</p>
                            <p className="text-caption text-secondary-400 mt-1">{formatTime(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📈</span>
                    <p className="text-secondary-400">최근 활동이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-background-200">
                  <button 
                    onClick={() => router.push('/admin/system/logs')}
                    className="w-full text-primary hover:text-primary-600 text-center text-caption font-medium transition-colors"
                  >
                    전체 로그 보기 →
                  </button>
                </div>
              </div>
            </div>

            {/* 승인 대기 목록 */}
            <div className="bg-white rounded-custom shadow-soft">
              <div className="p-6 border-b border-background-200">
                <h2 className="text-h3 font-semibold text-secondary flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    승인 대기 목록
                  </div>
                  {pendingApprovals.length > 0 && (
                    <span className="bg-error text-white text-xs px-2 py-1 rounded-full">
                      {pendingApprovals.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="p-3 border border-background-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {approval.type === 'expert' ? '👨‍⚕️' : '👤'}
                            </span>
                            <div>
                              <h4 className="text-body font-medium text-secondary-700">{approval.name}</h4>
                              <p className="text-caption text-secondary-400">{approval.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(approval.priority)}`}>
                            {approval.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-caption text-secondary-400">
                            {formatTime(approval.submittedAt)}
                          </span>
                          <div className="flex space-x-2">
                            <button className="bg-primary text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 transition-colors">
                              승인
                            </button>
                            <button className="bg-error text-white px-3 py-1 rounded text-xs font-medium hover:bg-error-600 transition-colors">
                              거절
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">✅</span>
                    <p className="text-secondary-400">승인 대기 중인 항목이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-background-200">
                  <button 
                    onClick={() => router.push('/admin/approval')}
                    className="w-full text-primary hover:text-primary-600 text-center text-caption font-medium transition-colors"
                  >
                    전체 승인 관리 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 작업 버튼들 */}
          <div className="bg-white rounded-custom shadow-soft p-6">
            <h2 className="text-h3 font-semibold text-secondary mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              빠른 작업
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/admin/approval/experts')}
                className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">👨‍⚕️</span>
                <span className="text-caption font-medium text-primary group-hover:text-primary-600">전문가 승인</span>
              </button>
              
              <button 
                onClick={() => router.push('/admin/system/users')}
                className="flex flex-col items-center p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">👥</span>
                <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">사용자 관리</span>
              </button>
              
              <button 
                onClick={() => router.push('/admin/statistics/revenue')}
                className="flex flex-col items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">💰</span>
                <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">매출 통계</span>
              </button>
              
              <button 
                onClick={() => router.push('/admin/system/settings')}
                className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">⚙️</span>
                <span className="text-caption font-medium text-secondary-500 group-hover:text-secondary-600">시스템 설정</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { UserType } from '@/types/user';
import { withAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import PermissionGuard from '@/components/PermissionGuard';
import Sidebar from '@/components/Layout/Sidebar';
import { hasMinPermissionLevel, getUserType } from '@/utils/permissions';

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
  const { user, isLoading } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const userType = getUserType(user);

  // 권한별 시스템 통계 데이터 생성
  const getSystemStats = (): SystemStats => {
    // 수퍼관리자는 전체 데이터
    if (userType === 'super_admin') {
      return {
        totalUsers: 2847,
        totalExperts: 156,
        totalSessions: 8429,
        totalRevenue: 125680000,
        pendingApprovals: 23,
        activeUsers: 892
      };
    }
    // 지역관리자는 지역 데이터
    if (userType === 'regional_manager') {
      return {
        totalUsers: 1247,
        totalExperts: 89,
        totalSessions: 3429,
        totalRevenue: 45680000,
        pendingApprovals: 15,
        activeUsers: 342
      };
    }
    // 센터관리자는 센터 데이터
    if (userType === 'center_manager') {
      return {
        totalUsers: 456,
        totalExperts: 18,
        totalSessions: 1245,
        totalRevenue: 15680000,
        pendingApprovals: 8,
        activeUsers: 123
      };
    }
    // 일반 직원은 제한된 데이터
    return {
      totalUsers: 0,
      totalExperts: 18,
      totalSessions: 1245,
      totalRevenue: 0,
      pendingApprovals: 8,
      activeUsers: 0
    };
  };

  const systemStats = getSystemStats();

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

  // 데이터 로딩
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // 실제로는 API 호출하여 사용자별 권한에 맞는 데이터 로드
        await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
        setError('');
      } catch (err: any) {
        console.error('대시보드 데이터 로딩 실패:', err);
        setError(err.message || '데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userType) {
      loadDashboardData();
    }
  }, [userType]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">권한 정보를 확인할 수 없습니다</h1>
          <p className="text-gray-600">다시 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        userType={userType} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">
                  {userType === 'super_admin' ? '전체 시스템 통합 관리 및 모니터링' :
                   userType === 'regional_manager' ? '지역별 센터 및 성과 관리' :
                   userType === 'center_manager' ? '센터 운영 및 전문가 관리' :
                   '일일 업무 및 승인 관리'}
                </p>
                <AdminLevelBadge userType={userType} size="sm" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 수퍼관리자 전용 빠른 접근 */}
              <PermissionGuard minLevel="super_admin">
                <Link
                  href="/admin/super-admin/global-dashboard"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  👑 전체 시스템 현황
                </Link>
              </PermissionGuard>
              
              {/* 시스템 상태 */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">시스템 정상</span>
              </div>

              {/* 사용자 정보 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0) || '관'}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name || '관리자'}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
              </div>
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

        {/* 메인 콘텐츠 영역 */}
        <div className="space-y-6">
          {/* 권한별 주요 지표 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* 총 사용자 - 센터관리자 이상만 표시 */}
            <PermissionGuard minLevel="center_manager">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {userType === 'super_admin' ? '전체 사용자' :
                       userType === 'regional_manager' ? '지역 사용자' :
                       '센터 사용자'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                </div>
              </div>
            </PermissionGuard>

            {/* 전문가 수 - 모든 관리자가 볼 수 있음 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {userType === 'super_admin' ? '전체 전문가' :
                     userType === 'regional_manager' ? '지역 전문가' :
                     '센터 전문가'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalExperts}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
              </div>
            </div>

            {/* 총 상담 - 모든 관리자가 볼 수 있음 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 상담</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalSessions.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
              </div>
            </div>

            {/* 총 매출 - 센터관리자 이상만 표시 */}
            <PermissionGuard minLevel="center_manager">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">총 매출</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {systemStats.totalRevenue > 0 ? formatCurrency(systemStats.totalRevenue) : '-'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
              </div>
            </PermissionGuard>

            {/* 승인 대기 - 모든 관리자가 볼 수 있음 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">승인 대기</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{systemStats.pendingApprovals}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
              </div>
            </div>

            {/* 활성 사용자 - 센터관리자 이상만 표시 */}
            <PermissionGuard minLevel="center_manager">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">활성 사용자</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {systemStats.activeUsers > 0 ? systemStats.activeUsers : '-'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🟢</span>
                  </div>
                </div>
              </div>
            </PermissionGuard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📊</span>
                  최근 시스템 활동
                </h2>
              </div>
              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`p-3 border-l-4 rounded-lg ${getActivityColor(activity.status)}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📈</span>
                    <p className="text-gray-500">최근 활동이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/admin/system/logs"
                    className="w-full text-blue-600 hover:text-blue-800 text-center text-sm font-medium transition-colors block"
                  >
                    전체 로그 보기 →
                  </Link>
                </div>
              </div>
            </div>

            {/* 승인 대기 목록 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    승인 대기 목록
                  </div>
                  {pendingApprovals.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingApprovals.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {approval.type === 'expert' ? '👨‍⚕️' : '👤'}
                            </span>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">{approval.name}</h4>
                              <p className="text-xs text-gray-500">{approval.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(approval.priority)}`}>
                            {approval.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(approval.submittedAt)}
                          </span>
                          <div className="flex space-x-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                              승인
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors">
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
                    <p className="text-gray-500">승인 대기 중인 항목이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/admin/approval"
                    className="w-full text-blue-600 hover:text-blue-800 text-center text-sm font-medium transition-colors block"
                  >
                    전체 승인 관리 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 권한별 빠른 작업 버튼들 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              빠른 작업
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 전문가 승인 - 모든 관리자 */}
              <Link
                href="/admin/approval/experts"
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">👨‍⚕️</span>
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">전문가 승인</span>
              </Link>
              
              {/* 사용자 관리 - 센터관리자 이상 */}
              <PermissionGuard minLevel="center_manager">
                <Link
                  href="/admin/system/users"
                  className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">👥</span>
                  <span className="text-sm font-medium text-green-600 group-hover:text-green-700">사용자 관리</span>
                </Link>
              </PermissionGuard>
              
              {/* 센터 관리 - 센터관리자 이상 */}
              <PermissionGuard minLevel="center_manager">
                <Link
                  href="/admin/centers/list"
                  className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">🏢</span>
                  <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">센터 관리</span>
                </Link>
              </PermissionGuard>
              
              {/* 매출 통계 - 센터관리자 이상 */}
              <PermissionGuard minLevel="center_manager">
                <Link
                  href="/admin/statistics/revenue"
                  className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">💰</span>
                  <span className="text-sm font-medium text-yellow-600 group-hover:text-yellow-700">매출 통계</span>
                </Link>
              </PermissionGuard>
              
              {/* 시스템 설정 - 수퍼관리자 전용 */}
              <PermissionGuard minLevel="super_admin">
                <Link
                  href="/admin/super-admin/global-settings"
                  className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">⚙️</span>
                  <span className="text-sm font-medium text-red-600 group-hover:text-red-700">글로벌 설정</span>
                </Link>
              </PermissionGuard>
              
              {/* 관리자 계정 - 수퍼관리자 전용 */}
              <PermissionGuard minLevel="super_admin">
                <Link
                  href="/admin/super-admin/admin-accounts"
                  className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">👤</span>
                  <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">관리자 계정</span>
                </Link>
              </PermissionGuard>
              
              {/* 전문가 관리 - 센터관리자 이상 */}
              <PermissionGuard minLevel="center_manager">
                <Link
                  href="/admin/experts/list"
                  className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">👨‍⚕️</span>
                  <span className="text-sm font-medium text-pink-600 group-hover:text-pink-700">전문가 관리</span>
                </Link>
              </PermissionGuard>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default withAdminOnly(AdminDashboard, false); // 레이아웃 비활성화 - 페이지에서 직접 처리

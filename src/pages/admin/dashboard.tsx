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
import { AdminApiService } from '@/services/adminApi';
import { AdminDashboardStats, RecentActivity, PendingApproval } from '@/types/admin';

// 기존 인터페이스들을 types/admin.ts에서 import하므로 삭제

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // API 데이터 상태
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  const userType = getUserType(user);

  // 실제 API 데이터 로딩 함수
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 대시보드 데이터 로딩 시작...');
      
      try {
        // 병렬로 모든 데이터 요청
        console.log('🔄 API 호출 시작...');
        const [statsData, activitiesData, approvalsData] = await Promise.all([
          AdminApiService.getDashboardStats(),
          AdminApiService.getRecentActivities(5),
          AdminApiService.getPendingApprovals()
        ]);
        console.log('✅ 모든 API 호출 완료:', { statsData, activitiesData, approvalsData });
        
        setDashboardStats(statsData);
        setRecentActivities(activitiesData);
        setPendingApprovals(approvalsData);
        console.log('✅ 대시보드 데이터 로딩 성공');
        
      } catch (apiError: any) {
        console.warn('⚠️ API 호출 실패, 임시 데이터 사용:', apiError.message);
        
        // API 실패 시 임시 샘플 데이터 사용 (개발 중)
        const sampleStats = {
          users: { totalUsers: 2847, activeUsers: 892, pendingUsers: 23, inactiveUsers: 156, newUsersToday: 12, newUsersThisWeek: 87, newUsersThisMonth: 245 },
          experts: { totalExperts: 156, verifiedExperts: 89, pendingVerification: 15, activeExperts: 78, averageRating: 4.5 },
          counselings: { totalCounselings: 8429, completedCounselings: 3429, pendingCounselings: 234, cancelledCounselings: 89, counselingsToday: 45, counselingsThisWeek: 287, counselingsThisMonth: 1245, averageSessionDuration: 60 },
          contents: { totalContents: 125, publishedContents: 89, draftContents: 36, totalViews: 15420, totalLikes: 2340, mostViewedContent: null },
          psychTests: { totalTests: 25, activeTests: 18, totalResponses: 1245, responsesToday: 45, responsesThisWeek: 287, responsesThisMonth: 892, mostPopularTest: null },
          system: { totalNotifications: 156, unreadNotifications: 23, chatMessagesToday: 234, loginSessionsToday: 89, serverUptime: '72 hours', databaseSize: '2.4 GB' },
          generatedAt: new Date().toISOString()
        };
        
        const sampleActivities = [
          { id: '1', type: 'expert_application' as const, description: '김상담사님이 전문가 등록을 신청했습니다.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'info' as const },
          { id: '2', type: 'session_completed' as const, description: '오늘 총 45건의 상담이 완료되었습니다.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), status: 'success' as const },
          { id: '3', type: 'system_alert' as const, description: '서버 CPU 사용률이 85%를 초과했습니다.', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), status: 'warning' as const }
        ];
        
        const sampleApprovals = [
          { id: '1', type: 'expert' as const, name: '박심리사', email: 'park.counselor@example.com', submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), priority: 'high' as const, status: 'pending' as const },
          { id: '2', type: 'expert' as const, name: '이상담사', email: 'lee.therapist@example.com', submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), priority: 'medium' as const, status: 'pending' as const }
        ];
        
        setDashboardStats(sampleStats);
        setRecentActivities(sampleActivities);
        setPendingApprovals(sampleApprovals);
        
        setError(`API 연결 실패: ${apiError.message} (임시 데이터 표시 중)`);
      }
      
    } catch (err: any) {
      console.error('❌ 대시보드 데이터 로딩 실패:', err);
      setError(err.message || '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

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
    if (userType) {
      loadDashboardData();
    }
  }, [userType]);
  
  // 5분마다 자동 새로고침
  useEffect(() => {
    if (!userType) return;
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000); // 5분
    
    return () => clearInterval(interval);
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
                관리자 대시보드
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
              
              {/* 시스템 상태 및 새로고침 */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700">시스템 정상</span>
                </div>
                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <span className={loading ? 'animate-spin' : ''}>{loading ? '🔄' : '🔄'}</span>
                  {loading ? '로딩 중...' : '새로고침'}
                </button>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError('');
                  loadDashboardData();
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <div className="space-y-6">
          {/* 권한별 주요 지표 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {dashboardStats && (
              <>
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
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.users.totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">활성: {dashboardStats.users.activeUsers.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.experts.totalExperts.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">인증: {dashboardStats.experts.verifiedExperts}</p>
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
                      <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.counselings.totalCounselings.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">완료: {dashboardStats.counselings.completedCounselings}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                  </div>
                </div>

                {/* 심리 검사 - 센터관리자 이상만 표시 */}
                <PermissionGuard minLevel="center_manager">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">심리 검사</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.psychTests.totalResponses.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">오늘: {dashboardStats.psychTests.responsesToday}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📊</span>
                      </div>
                    </div>
                  </div>
                </PermissionGuard>

                {/* 승인 대기 - 모든 관리자가 볼 수 있음 */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">승인 대기</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{dashboardStats.experts.pendingVerification}</p>
                      <p className="text-xs text-gray-400 mt-1">전문가 대기</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⏳</span>
                    </div>
                  </div>
                </div>

                {/* 시스템 알림 - 센터관리자 이상만 표시 */}
                <PermissionGuard minLevel="center_manager">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">시스템 알림</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{dashboardStats.system.unreadNotifications}</p>
                        <p className="text-xs text-gray-400 mt-1">읽지 않음</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔔</span>
                      </div>
                    </div>
                  </div>
                </PermissionGuard>
              </>
            )}
            
            {/* 로딩 상태 */}
            {!dashboardStats && loading && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-gray-600">통계 로딩 중...</span>
              </div>
            )}
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">최근 활동 로딩 중...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`p-3 border-l-4 rounded-lg ${getActivityColor(activity.status)}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                              {activity.userName && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                  {activity.userName}
                                </span>
                              )}
                            </div>
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
                  {!loading && pendingApprovals.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingApprovals.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">승인 대기 목록 로딩 중...</p>
                  </div>
                ) : pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
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
                            {approval.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(approval.submittedAt)}
                          </span>
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/approval/experts?id=${approval.id}`}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                            >
                              검토
                            </Link>
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
                    href="/admin/approval/experts"
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">⚡</span>
                빠른 작업
              </h2>
              {dashboardStats && (
                <div className="text-sm text-gray-500">
                  마지막 업데이트: {new Date(dashboardStats.generatedAt).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
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

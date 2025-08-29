import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { useStore } from '@/store/useStore';
import userActivityLogService, { 
  UserActivityLog, 
  UserActivityLogQuery, 
  UserActivityLogStats 
} from '@/services/userActivityLogService';

const UserActivityLogsPage = () => {
  const router = useRouter();
  const { user } = useStore();

  // 상태
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [stats, setStats] = useState<UserActivityLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 필터링 및 페이지네이션 상태
  const [filters, setFilters] = useState<UserActivityLogQuery>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 데이터 로딩 함수
  const loadLogs = async (newFilters?: UserActivityLogQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const response = await userActivityLogService.getUserActivityLogs(filtersToUse);
      
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('사용자 활동 로그 조회 실패:', err);
      setError(err.response?.data?.message || '사용자 활동 로그를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await userActivityLogService.getUserActivityLogStats({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setStats(statsData);
    } catch (err: any) {
      console.error('통계 조회 실패:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    if (user) {
      loadLogs();
      loadStats();
    }
  }, [user]);

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof UserActivityLogQuery, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }; // 필터 변경 시 첫 페이지로
    setFilters(newFilters);
  };

  // 검색 실행
  const handleSearch = () => {
    loadLogs();
    loadStats();
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadLogs(newFilters);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    const resetFilters = { page: 1, limit: 20 };
    setFilters(resetFilters);
    loadLogs(resetFilters);
    loadStats();
  };

  // 권한 확인
  if (!user) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (user.userType !== 'super_admin' && user.userType !== 'regional_manager') {
    router.push('/admin/dashboard');
    return null;
  }

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar userType={user.userType} />
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">📊</span>
                사용자 활동 로그
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                사용자들의 활동 기록을 조회하고 분석할 수 있습니다.
              </p>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-50 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">전체 활동</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-50 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">오늘 활동</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-50 mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">오늘 활성 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsersToday.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-50 mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">평균 활동 (최근 7일)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.recentActivity.length > 0 
                      ? Math.round(stats.recentActivity.reduce((sum, item) => sum + item.count, 0) / stats.recentActivity.length).toLocaleString()
                      : '0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 필터 섹션 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색어</label>
              <input
                type="text"
                placeholder="사용자명, 액션, 상세내용..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사용자 타입</label>
              <select
                value={filters.userType || ''}
                onChange={(e) => handleFilterChange('userType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="general">일반 사용자</option>
                <option value="expert">전문가</option>
                <option value="staff">직원</option>
                <option value="center_manager">센터 관리자</option>
                <option value="regional_manager">지역 관리자</option>
                <option value="super_admin">최고 관리자</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">액션 카테고리</label>
              <select
                value={filters.actionCategory || ''}
                onChange={(e) => handleFilterChange('actionCategory', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="auth">인증</option>
                <option value="user">사용자</option>
                <option value="expert">전문가</option>
                <option value="payment">결제</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                검색
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 로그 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              활동 로그 ({pagination.total.toLocaleString()}개)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">레벨</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP 주소</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        로딩 중...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      조회된 활동 로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {new Date(log.timestamp).toLocaleString('ko-KR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(log.timestamp).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{log.userName}</div>
                          <div className="text-gray-500">
                            {userActivityLogService.getUserTypeLabel(log.userType)} (ID: {log.userId})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {userActivityLogService.getCategoryLabel(log.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userActivityLogService.getLevelBadgeColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={log.details}>
                          {log.details}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {((pagination.page - 1) * pagination.limit + 1).toLocaleString()} - {Math.min(pagination.page * pagination.limit, pagination.total).toLocaleString()} / {pagination.total.toLocaleString()}개
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default UserActivityLogsPage;
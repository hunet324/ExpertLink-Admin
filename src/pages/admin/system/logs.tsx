import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { systemLogService, SystemLogRecord, SystemLogStats, SystemLogFilters, LogLevel, LogCategory } from '@/services/system-logs';

// SystemLogRecord interface는 이제 서비스에서 import됨

const SystemLogsPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | LogCategory>('all');
  const [dateRange, setDateRange] = useState({
    start: '2024-08-25',
    end: '2024-08-25'
  });
  const [selectedLog, setSelectedLog] = useState<SystemLogRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [systemLogs, setSystemLogs] = useState<SystemLogRecord[]>([]);
  const [systemLogStats, setSystemLogStats] = useState<SystemLogStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 시스템 로그 및 통계 로딩
  useEffect(() => {
    loadSystemLogs();
    loadStats();
  }, [levelFilter, categoryFilter, dateRange, pagination.page]);

  const loadSystemLogs = async () => {
    setLoading(true);
    try {
      const filters: SystemLogFilters = {
        search: searchQuery,
        level: levelFilter === 'all' ? undefined : levelFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        start_date: dateRange.start,
        end_date: dateRange.end,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await systemLogService.getSystemLogs(filters);
      console.log('시스템 로그 API 응답:', response);
      
      setSystemLogs(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err: any) {
      console.error('시스템 로그 조회 실패:', err);
      setError(err.message || '시스템 로그를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('시스템 로그 통계 API 호출:', { dateRange });
      const stats = await systemLogService.getSystemLogStats(dateRange.start, dateRange.end);
      console.log('시스템 로그 통계 API 응답:', stats);
      setSystemLogStats(stats);
    } catch (err: any) {
      console.error('시스템 로그 통계 조회 실패:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSystemLogs();
  };

  const getLevelColor = systemLogService.getLevelColor;

  const getLevelIcon = systemLogService.getLevelIcon;

  const getCategoryColor = systemLogService.getCategoryColor;

  const getCategoryLabel = systemLogService.getCategoryLabel;

  // API에서 이미 필터링되어 오므로 그대로 사용
  const filteredLogs = systemLogs;

  const getFilterCount = (level: 'all' | LogLevel) => {
    if (!systemLogStats) return 0;
    if (level === 'all') return systemLogStats.total;
    return systemLogStats.levelStats[level] || 0;
  };

  const stats = systemLogStats || {
    total: 0,
    today: 0,
    errors: 0,
    warnings: 0
  };

  const openDetailModal = (log: SystemLogRecord) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = async () => {
    try {
      setLoading(true);
      const filters: SystemLogFilters = {
        search: searchQuery,
        level: levelFilter === 'all' ? undefined : levelFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        start_date: dateRange.start,
        end_date: dateRange.end
      };
      
      const result = await systemLogService.exportSystemLogs(filters);
      
      if (result.success) {
        alert(`로그 내보내기 성공: ${result.fileName}`);
        // 실제 구현에서는 다운로드 링크 제공
        // window.open(result.downloadUrl, '_blank');
      } else {
        alert('로그 내보내기에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('로그 내보내기 실패:', err);
      alert(err.message || '로그 내보내기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const clearOldLogs = async () => {
    const days = 30;
    if (confirm(`${days}일 이전 로그를 삭제하시겠습니까?`)) {
      try {
        setLoading(true);
        const result = await systemLogService.cleanupOldLogs(days);
        
        if (result.success) {
          alert(result.message);
          // 로그 목록 및 통계 새로고침
          loadSystemLogs();
          loadStats();
        }
      } catch (err: any) {
        console.error('로그 정리 실패:', err);
        alert(err.message || '로그 정리에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTimestamp = systemLogService.formatTimestamp;

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar userType="super_admin" />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                운영 로그
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                시스템 운영 로그를 실시간으로 모니터링하고 분석할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{stats.today}</div>
                  <div className="text-xs text-secondary-400">오늘</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-error">{stats.errors}</div>
                  <div className="text-xs text-secondary-400">에러</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{stats.warnings}</div>
                  <div className="text-xs text-secondary-400">경고</div>
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

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색바 및 액션 버튼 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="액션, 상세내용, 사용자명, IP 주소로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                    <span className="text-secondary-400">~</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                      검색
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={exportLogs}
                    className="bg-secondary-400 text-white px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2"
                  >
                    <span>📥</span>
                    <span>내보내기</span>
                  </button>
                  <button
                    onClick={clearOldLogs}
                    className="bg-error text-white px-4 py-2 rounded-lg hover:bg-error-600 transition-colors flex items-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>정리</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 필터 옵션 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center space-x-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                  className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="auth">인증</option>
                  <option value="payment">결제</option>
                  <option value="system">시스템</option>
                  <option value="user">사용자</option>
                  <option value="expert">전문가</option>
                  <option value="admin">관리자</option>
                  <option value="api">API</option>
                  <option value="database">데이터베이스</option>
                </select>

                <div className="flex space-x-2">
                  {[
                    { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                    { key: 'error' as const, label: '에러', count: getFilterCount('error') },
                    { key: 'warn' as const, label: '경고', count: getFilterCount('warn') },
                    { key: 'info' as const, label: '정보', count: getFilterCount('info') },
                    { key: 'debug' as const, label: '디버그', count: getFilterCount('debug') }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setLevelFilter(tab.key)}
                      className={`px-3 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-1 ${
                        levelFilter === tab.key
                          ? 'bg-primary text-white'
                          : 'text-secondary-600 hover:bg-background-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        levelFilter === tab.key
                          ? 'bg-white text-primary'
                          : 'bg-background-200 text-secondary-500'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 로그 목록 */}
          <div className="bg-white rounded-custom shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-50 border-b border-background-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">시간</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">레벨</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">카테고리</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">액션</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">IP 주소</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">상세내용</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600 text-caption">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.id} className={`border-b border-background-100 hover:bg-background-50 ${index % 2 === 0 ? 'bg-white' : 'bg-background-25'}`}>
                      <td className="py-3 px-4">
                        <div className="text-caption font-mono text-secondary-700 whitespace-pre-line">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getLevelIcon(log.level)}</span>
                          <span className={`px-2 py-1 rounded-full text-caption font-medium ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getCategoryColor(log.category)}`}>
                          {getCategoryLabel(log.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption font-medium text-secondary-700">{log.action}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          {log.userName ? (
                            <>
                              <div className="font-medium text-secondary-700">{log.userName}</div>
                              <div className="text-secondary-400">{log.userType}</div>
                            </>
                          ) : (
                            <div className="text-secondary-400">시스템</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption font-mono text-secondary-600">{log.ipAddress}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700 max-w-xs truncate">{log.details}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openDetailModal(log)}
                          className="text-primary hover:text-primary-600 text-caption font-medium"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-secondary-600">시스템 로그를 불러오는 중...</p>
              </div>
            )}

            {!loading && filteredLogs.length === 0 && (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 조건에 맞는 로그가 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  검색 조건이나 날짜 범위를 변경해보세요
                </p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {!loading && pagination.totalPages > 1 && (
            <div className="bg-white rounded-custom shadow-soft p-4 mt-6 flex items-center justify-between">
              <div className="text-caption text-secondary-600">
                전체 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page <= 1 || loading}
                  className="px-3 py-2 border border-background-300 rounded-lg text-caption disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50"
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
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-caption ${
                        pagination.page === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-background-300 hover:bg-background-50 disabled:opacity-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="px-3 py-2 border border-background-300 rounded-lg text-caption disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 로그 상세 모달 */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">로그 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">시간</div>
                      <div className="text-body font-mono text-secondary-700 whitespace-pre-line">{formatTimestamp(selectedLog.timestamp)}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">로그 ID</div>
                      <div className="text-body font-mono text-secondary-700">{selectedLog.id}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">레벨</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLevelIcon(selectedLog.level)}</span>
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getLevelColor(selectedLog.level)}`}>
                          {selectedLog.level.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">카테고리</div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getCategoryColor(selectedLog.category)}`}>
                          {getCategoryLabel(selectedLog.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 및 상세내용 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">액션 및 상세내용</h4>
                  <div className="space-y-3">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <div className="text-caption text-primary-600">액션</div>
                      <div className="text-body font-medium text-primary-700">{selectedLog.action}</div>
                    </div>
                    <div className="bg-background-50 p-4 rounded-lg">
                      <div className="text-caption text-secondary-500">상세내용</div>
                      <div className="text-body text-secondary-700">{selectedLog.details}</div>
                    </div>
                  </div>
                </div>

                {/* 사용자 정보 */}
                {selectedLog.userName && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">사용자 정보</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-accent-50 p-3 rounded-lg">
                        <div className="text-caption text-accent-600">사용자명</div>
                        <div className="text-body text-accent-700">{selectedLog.userName}</div>
                      </div>
                      <div className="bg-accent-50 p-3 rounded-lg">
                        <div className="text-caption text-accent-600">사용자 ID</div>
                        <div className="text-body font-mono text-accent-700">{selectedLog.userId}</div>
                      </div>
                      <div className="bg-accent-50 p-3 rounded-lg">
                        <div className="text-caption text-accent-600">사용자 타입</div>
                        <div className="text-body text-accent-700">{selectedLog.userType}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 네트워크 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">네트워크 정보</h4>
                  <div className="space-y-3">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">IP 주소</div>
                      <div className="text-body font-mono text-secondary-700">{selectedLog.ipAddress}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">User Agent</div>
                      <div className="text-body font-mono text-secondary-700 break-all">{selectedLog.userAgent}</div>
                    </div>
                  </div>
                </div>

                {/* 요청 정보 */}
                {selectedLog.requestId && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">요청 정보</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <div className="text-caption text-secondary-600">요청 ID</div>
                        <div className="text-body font-mono text-secondary-700">{selectedLog.requestId}</div>
                      </div>
                      {selectedLog.responseTime && (
                        <div className="bg-secondary-50 p-3 rounded-lg">
                          <div className="text-caption text-secondary-600">응답 시간</div>
                          <div className="text-body text-secondary-700">{selectedLog.responseTime}ms</div>
                        </div>
                      )}
                      {selectedLog.statusCode && (
                        <div className="bg-secondary-50 p-3 rounded-lg">
                          <div className="text-caption text-secondary-600">상태 코드</div>
                          <div className={`text-body font-medium ${selectedLog.statusCode >= 400 ? 'text-error' : 'text-accent'}`}>
                            {selectedLog.statusCode}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 에러 정보 */}
                {selectedLog.errorMessage && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">에러 정보</h4>
                    <div className="space-y-3">
                      <div className="bg-error-50 p-4 rounded-lg">
                        <div className="text-caption text-error-600">에러 메시지</div>
                        <div className="text-body text-error-700">{selectedLog.errorMessage}</div>
                      </div>
                      {selectedLog.stackTrace && (
                        <div className="bg-error-50 p-4 rounded-lg">
                          <div className="text-caption text-error-600">스택 트레이스</div>
                          <pre className="text-caption font-mono text-error-700 mt-2 whitespace-pre-wrap break-all">
                            {selectedLog.stackTrace}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

export default SystemLogsPage;
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'auth' | 'payment' | 'system' | 'user' | 'expert' | 'admin' | 'api' | 'database';
  action: string;
  userId?: string;
  userType?: 'client' | 'expert' | 'admin' | 'super_admin';
  userName?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  requestId?: string;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
  stackTrace?: string;
}

const SystemLogsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | SystemLog['level']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SystemLog['category']>('all');
  const [dateRange, setDateRange] = useState({
    start: '2024-08-12',
    end: '2024-08-12'
  });
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 시스템 로그 샘플 데이터
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: 'log_001',
      timestamp: '2024-08-12T15:30:45.123Z',
      level: 'info',
      category: 'auth',
      action: 'USER_LOGIN',
      userId: 'user_001',
      userType: 'client',
      userName: '김내담자',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: '사용자 로그인 성공',
      requestId: 'req_20240812_001',
      responseTime: 150,
      statusCode: 200
    },
    {
      id: 'log_002',
      timestamp: '2024-08-12T15:25:32.456Z',
      level: 'error',
      category: 'payment',
      action: 'PAYMENT_FAILED',
      userId: 'user_002',
      userType: 'client',
      userName: '박환자',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      details: '결제 처리 중 오류 발생 - 카드 한도 초과',
      requestId: 'req_20240812_002',
      responseTime: 3000,
      statusCode: 400,
      errorMessage: 'Payment declined: Insufficient funds',
      stackTrace: 'at PaymentService.processPayment (payment.service.js:45)\n  at PaymentController.createPayment (payment.controller.js:23)'
    },
    {
      id: 'log_003',
      timestamp: '2024-08-12T15:20:18.789Z',
      level: 'warn',
      category: 'system',
      action: 'HIGH_CPU_USAGE',
      ipAddress: '10.0.1.50',
      userAgent: 'System Monitor',
      details: 'CPU 사용률이 85%를 초과했습니다',
      responseTime: 0
    },
    {
      id: 'log_004',
      timestamp: '2024-08-12T15:15:22.345Z',
      level: 'info',
      category: 'expert',
      action: 'EXPERT_STATUS_CHANGE',
      userId: 'expert_001',
      userType: 'expert',
      userName: '이상담사',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: '전문가 상태를 "상담 가능"으로 변경',
      requestId: 'req_20240812_003',
      responseTime: 200,
      statusCode: 200
    },
    {
      id: 'log_005',
      timestamp: '2024-08-12T15:10:15.567Z',
      level: 'debug',
      category: 'api',
      action: 'API_REQUEST',
      userId: 'user_003',
      userType: 'client',
      userName: '정고객',
      ipAddress: '192.168.1.103',
      userAgent: 'ExpertLink Mobile App v1.2.0',
      details: 'GET /api/experts?category=psychology&available=true',
      requestId: 'req_20240812_004',
      responseTime: 120,
      statusCode: 200
    },
    {
      id: 'log_006',
      timestamp: '2024-08-12T15:05:33.890Z',
      level: 'error',
      category: 'database',
      action: 'DATABASE_CONNECTION_ERROR',
      ipAddress: '10.0.1.10',
      userAgent: 'Database Service',
      details: '데이터베이스 연결 실패 - 연결 풀 고갈',
      errorMessage: 'Connection pool exhausted. Unable to establish connection to database',
      stackTrace: 'at DatabasePool.getConnection (db.pool.js:78)\n  at UserRepository.findById (user.repository.js:12)'
    },
    {
      id: 'log_007',
      timestamp: '2024-08-12T15:00:45.123Z',
      level: 'info',
      category: 'admin',
      action: 'ADMIN_LOGIN',
      userId: 'admin_001',
      userType: 'super_admin',
      userName: '김관리자',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: '관리자 로그인 성공',
      requestId: 'req_20240812_005',
      responseTime: 180,
      statusCode: 200
    },
    {
      id: 'log_008',
      timestamp: '2024-08-12T14:55:12.456Z',
      level: 'warn',
      category: 'user',
      action: 'MULTIPLE_LOGIN_ATTEMPTS',
      userId: 'user_004',
      userType: 'client',
      userName: '홍길동',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      details: '5분 내 로그인 시도 5회 - 계정 일시 잠금',
      requestId: 'req_20240812_006',
      responseTime: 100,
      statusCode: 429
    }
  ]);

  const getLevelColor = (level: SystemLog['level']) => {
    const levelColors = {
      'info': 'bg-primary text-white',
      'warn': 'bg-secondary-400 text-white',
      'error': 'bg-error text-white',
      'debug': 'bg-background-400 text-white'
    };
    return levelColors[level];
  };

  const getLevelIcon = (level: SystemLog['level']) => {
    const levelIcons = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🐛'
    };
    return levelIcons[level];
  };

  const getCategoryColor = (category: SystemLog['category']) => {
    const categoryColors = {
      'auth': 'bg-accent-100 text-accent-700',
      'payment': 'bg-primary-100 text-primary-700',
      'system': 'bg-error-100 text-error-700',
      'user': 'bg-secondary-100 text-secondary-700',
      'expert': 'bg-logo-point/20 text-logo-main',
      'admin': 'bg-purple-100 text-purple-700',
      'api': 'bg-green-100 text-green-700',
      'database': 'bg-orange-100 text-orange-700'
    };
    return categoryColors[category];
  };

  const getCategoryLabel = (category: SystemLog['category']) => {
    const categoryLabels = {
      'auth': '인증',
      'payment': '결제',
      'system': '시스템',
      'user': '사용자',
      'expert': '전문가',
      'admin': '관리자',
      'api': 'API',
      'database': '데이터베이스'
    };
    return categoryLabels[category];
  };

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         log.ipAddress.includes(searchQuery);
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    const matchesDateRange = logDate >= dateRange.start && logDate <= dateRange.end;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesDateRange;
  });

  const getFilterCount = (level: 'all' | SystemLog['level']) => {
    if (level === 'all') return systemLogs.length;
    return systemLogs.filter(log => log.level === level).length;
  };

  const getLogStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = systemLogs.filter(log => log.timestamp.startsWith(today));
    
    return {
      total: systemLogs.length,
      today: todayLogs.length,
      errors: systemLogs.filter(log => log.level === 'error').length,
      warnings: systemLogs.filter(log => log.level === 'warn').length
    };
  };

  const stats = getLogStats();

  const openDetailModal = (log: SystemLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = () => {
    // 로그 내보내기 기능 (실제 구현에서는 CSV/JSON 다운로드)
    alert('로그 내보내기 기능이 실행됩니다.');
  };

  const clearOldLogs = () => {
    if (confirm('30일 이전 로그를 삭제하시겠습니까?')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      setSystemLogs(prev => prev.filter(log => new Date(log.timestamp) > thirtyDaysAgo));
      alert('오래된 로그가 삭제되었습니다.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="super_admin" 
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
                        <div className="text-caption font-mono text-secondary-700">
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

            {filteredLogs.length === 0 && (
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
                      <div className="text-body font-mono text-secondary-700">{formatTimestamp(selectedLog.timestamp)}</div>
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
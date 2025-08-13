import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userType: 'client' | 'expert' | 'admin';
  userEmail: string;
  activity: string;
  activityType: 'login' | 'logout' | 'view' | 'create' | 'update' | 'delete' | 'payment' | 'booking' | 'message';
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  relatedResourceId?: string;
  relatedResourceType?: 'user' | 'expert' | 'session' | 'payment' | 'message';
  beforeData?: any;
  afterData?: any;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  deviceInfo?: {
    device: string;
    os: string;
    browser: string;
  };
}

const UserActivityLogsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | UserActivityLog['userType']>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | UserActivityLog['activityType']>('all');
  const [dateRange, setDateRange] = useState({
    start: '2024-08-12',
    end: '2024-08-12'
  });
  const [selectedLog, setSelectedLog] = useState<UserActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 사용자 활동 로그 샘플 데이터
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([
    {
      id: 'activity_001',
      userId: 'user_001',
      userName: '김내담자',
      userType: 'client',
      userEmail: 'kim.client@example.com',
      activity: 'USER_LOGIN',
      activityType: 'login',
      description: '사용자가 로그인했습니다',
      timestamp: '2024-08-12T15:30:00.123Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_20240812_001',
      location: {
        country: '대한민국',
        city: '서울',
        region: '서울특별시'
      },
      deviceInfo: {
        device: 'Desktop',
        os: 'Windows 10',
        browser: 'Chrome 127'
      }
    },
    {
      id: 'activity_002',
      userId: 'user_002',
      userName: '박환자',
      userType: 'client',
      userEmail: 'park.patient@example.com',
      activity: 'BOOKING_CREATE',
      activityType: 'create',
      description: '화상상담 예약을 생성했습니다',
      timestamp: '2024-08-12T14:45:00.456Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      sessionId: 'sess_20240812_002',
      relatedResourceId: 'booking_001',
      relatedResourceType: 'session',
      afterData: {
        expertId: 'expert_001',
        serviceType: 'video',
        scheduledAt: '2024-08-15T10:00:00Z'
      },
      location: {
        country: '대한민국',
        city: '부산',
        region: '부산광역시'
      },
      deviceInfo: {
        device: 'Mobile',
        os: 'iOS 17',
        browser: 'Safari'
      }
    },
    {
      id: 'activity_003',
      userId: 'expert_001',
      userName: '이상담사',
      userType: 'expert',
      userEmail: 'lee.counselor@example.com',
      activity: 'PROFILE_UPDATE',
      activityType: 'update',
      description: '전문가 프로필을 수정했습니다',
      timestamp: '2024-08-12T13:20:00.789Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      sessionId: 'sess_20240812_003',
      relatedResourceId: 'expert_001',
      relatedResourceType: 'expert',
      beforeData: {
        specializations: ['우울/불안', '대인관계'],
        hourlyRate: 70000
      },
      afterData: {
        specializations: ['우울/불안', '대인관계', '학습상담'],
        hourlyRate: 80000
      },
      location: {
        country: '대한민국',
        city: '대구',
        region: '대구광역시'
      },
      deviceInfo: {
        device: 'Desktop',
        os: 'macOS Sonoma',
        browser: 'Safari 16'
      }
    },
    {
      id: 'activity_004',
      userId: 'user_003',
      userName: '정고객',
      userType: 'client',
      userEmail: 'jung.customer@example.com',
      activity: 'PAYMENT_COMPLETED',
      activityType: 'payment',
      description: '결제를 완료했습니다',
      timestamp: '2024-08-12T12:15:00.321Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G998B)',
      sessionId: 'sess_20240812_004',
      relatedResourceId: 'payment_001',
      relatedResourceType: 'payment',
      afterData: {
        amount: 80000,
        paymentMethod: 'card',
        serviceType: 'video'
      },
      location: {
        country: '대한민국',
        city: '인천',
        region: '인천광역시'
      },
      deviceInfo: {
        device: 'Mobile',
        os: 'Android 13',
        browser: 'Chrome Mobile'
      }
    },
    {
      id: 'activity_005',
      userId: 'admin_001',
      userName: '김관리자',
      userType: 'admin',
      userEmail: 'admin@expertlink.com',
      activity: 'USER_STATUS_CHANGE',
      activityType: 'update',
      description: '사용자 계정 상태를 변경했습니다',
      timestamp: '2024-08-12T11:30:00.654Z',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      sessionId: 'sess_20240812_005',
      relatedResourceId: 'user_004',
      relatedResourceType: 'user',
      beforeData: {
        status: 'active'
      },
      afterData: {
        status: 'suspended',
        reason: '부적절한 행동으로 인한 정지'
      },
      location: {
        country: '대한민국',
        city: '서울',
        region: '서울특별시'
      },
      deviceInfo: {
        device: 'Desktop',
        os: 'Windows 10',
        browser: 'Chrome 127'
      }
    },
    {
      id: 'activity_006',
      userId: 'expert_002',
      userName: '최심리사',
      userType: 'expert',
      userEmail: 'choi.therapist@example.com',
      activity: 'MESSAGE_SENT',
      activityType: 'message',
      description: '내담자에게 메시지를 전송했습니다',
      timestamp: '2024-08-12T10:45:00.987Z',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      sessionId: 'sess_20240812_006',
      relatedResourceId: 'message_001',
      relatedResourceType: 'message',
      afterData: {
        recipientId: 'user_002',
        messageType: 'consultation_reminder',
        content: '내일 상담 준비사항을 안내드립니다.'
      },
      location: {
        country: '대한민국',
        city: '광주',
        region: '광주광역시'
      },
      deviceInfo: {
        device: 'Desktop',
        os: 'Windows 10',
        browser: 'Chrome 127'
      }
    },
    {
      id: 'activity_007',
      userId: 'user_005',
      userName: '이서비스',
      userType: 'client',
      userEmail: 'lee.service@example.com',
      activity: 'PROFILE_VIEW',
      activityType: 'view',
      description: '전문가 프로필을 조회했습니다',
      timestamp: '2024-08-12T09:20:00.135Z',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      sessionId: 'sess_20240812_007',
      relatedResourceId: 'expert_003',
      relatedResourceType: 'expert',
      location: {
        country: '대한민국',
        city: '대전',
        region: '대전광역시'
      },
      deviceInfo: {
        device: 'Tablet',
        os: 'iPadOS 16',
        browser: 'Safari'
      }
    },
    {
      id: 'activity_008',
      userId: 'user_001',
      userName: '김내담자',
      userType: 'client',
      userEmail: 'kim.client@example.com',
      activity: 'USER_LOGOUT',
      activityType: 'logout',
      description: '사용자가 로그아웃했습니다',
      timestamp: '2024-08-12T08:15:00.468Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_20240812_008',
      location: {
        country: '대한민국',
        city: '서울',
        region: '서울특별시'
      },
      deviceInfo: {
        device: 'Desktop',
        os: 'Windows 10',
        browser: 'Chrome 127'
      }
    }
  ]);

  const getActivityTypeColor = (type: UserActivityLog['activityType']) => {
    const typeColors = {
      'login': 'bg-accent-100 text-accent-700',
      'logout': 'bg-background-300 text-secondary-600',
      'view': 'bg-primary-100 text-primary-700',
      'create': 'bg-logo-point/20 text-logo-main',
      'update': 'bg-secondary-100 text-secondary-700',
      'delete': 'bg-error-100 text-error-700',
      'payment': 'bg-purple-100 text-purple-700',
      'booking': 'bg-green-100 text-green-700',
      'message': 'bg-orange-100 text-orange-700'
    };
    return typeColors[type];
  };

  const getActivityTypeIcon = (type: UserActivityLog['activityType']) => {
    const typeIcons = {
      'login': '🔐',
      'logout': '🚪',
      'view': '👁️',
      'create': '➕',
      'update': '✏️',
      'delete': '🗑️',
      'payment': '💳',
      'booking': '📅',
      'message': '💬'
    };
    return typeIcons[type];
  };

  const getActivityTypeLabel = (type: UserActivityLog['activityType']) => {
    const typeLabels = {
      'login': '로그인',
      'logout': '로그아웃',
      'view': '조회',
      'create': '생성',
      'update': '수정',
      'delete': '삭제',
      'payment': '결제',
      'booking': '예약',
      'message': '메시지'
    };
    return typeLabels[type];
  };

  const getUserTypeColor = (type: UserActivityLog['userType']) => {
    const typeColors = {
      'client': 'bg-primary-100 text-primary-700',
      'expert': 'bg-accent-100 text-accent-700',
      'admin': 'bg-secondary-100 text-secondary-700'
    };
    return typeColors[type];
  };

  const getUserTypeLabel = (type: UserActivityLog['userType']) => {
    const typeLabels = {
      'client': '내담자',
      'expert': '전문가',
      'admin': '관리자'
    };
    return typeLabels[type];
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.ipAddress.includes(searchQuery);
    
    const matchesUserType = userTypeFilter === 'all' || log.userType === userTypeFilter;
    const matchesActivityType = activityTypeFilter === 'all' || log.activityType === activityTypeFilter;
    
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    const matchesDateRange = logDate >= dateRange.start && logDate <= dateRange.end;
    
    return matchesSearch && matchesUserType && matchesActivityType && matchesDateRange;
  });

  const getFilterCount = (activityType: 'all' | UserActivityLog['activityType']) => {
    if (activityType === 'all') return activityLogs.length;
    return activityLogs.filter(log => log.activityType === activityType).length;
  };

  const getUserTypeCount = (userType: 'all' | UserActivityLog['userType']) => {
    if (userType === 'all') return activityLogs.length;
    return activityLogs.filter(log => log.userType === userType).length;
  };

  const getActivityStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = activityLogs.filter(log => log.timestamp.startsWith(today));
    
    return {
      total: activityLogs.length,
      today: todayLogs.length,
      users: new Set(activityLogs.map(log => log.userId)).size,
      logins: activityLogs.filter(log => log.activityType === 'login').length
    };
  };

  const stats = getActivityStats();

  const openDetailModal = (log: UserActivityLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = () => {
    alert('활동 로그 내보내기 기능이 실행됩니다.');
  };

  const clearOldLogs = () => {
    if (confirm('90일 이전 활동 로그를 삭제하시겠습니까?')) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      setActivityLogs(prev => prev.filter(log => new Date(log.timestamp) > ninetyDaysAgo));
      alert('오래된 활동 로그가 삭제되었습니다.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
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
                <span className="mr-3 text-2xl">👤</span>
                사용자 활동 로그
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                모든 사용자의 활동을 실시간으로 추적하고 분석할 수 있습니다.
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
                  <div className="text-h4 font-bold text-primary">{stats.users}</div>
                  <div className="text-xs text-secondary-400">활성 사용자</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{stats.logins}</div>
                  <div className="text-xs text-secondary-400">로그인</div>
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
                      placeholder="사용자명, 활동명, 설명, 이메일, IP 주소로 검색..."
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

            {/* 사용자 타입 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getUserTypeCount('all') },
                  { key: 'client' as const, label: '내담자', count: getUserTypeCount('client') },
                  { key: 'expert' as const, label: '전문가', count: getUserTypeCount('expert') },
                  { key: 'admin' as const, label: '관리자', count: getUserTypeCount('admin') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setUserTypeFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      userTypeFilter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      userTypeFilter === tab.key
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 활동 타입 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2 overflow-x-auto">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'login' as const, label: '로그인', count: getFilterCount('login') },
                  { key: 'logout' as const, label: '로그아웃', count: getFilterCount('logout') },
                  { key: 'view' as const, label: '조회', count: getFilterCount('view') },
                  { key: 'create' as const, label: '생성', count: getFilterCount('create') },
                  { key: 'update' as const, label: '수정', count: getFilterCount('update') },
                  { key: 'payment' as const, label: '결제', count: getFilterCount('payment') },
                  { key: 'booking' as const, label: '예약', count: getFilterCount('booking') },
                  { key: 'message' as const, label: '메시지', count: getFilterCount('message') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivityTypeFilter(tab.key)}
                    className={`px-3 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
                      activityTypeFilter === tab.key
                        ? 'bg-secondary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activityTypeFilter === tab.key
                        ? 'bg-white text-secondary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 활동 로그 테이블 */}
          <div className="bg-white rounded-custom shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-50 border-b border-background-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">시간</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">활동 타입</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">활동</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">설명</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">IP 주소</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">위치</th>
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
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-caption font-bold ${
                            log.userType === 'client' ? 'bg-primary' : 
                            log.userType === 'expert' ? 'bg-accent' : 'bg-secondary'
                          }`}>
                            {log.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-caption font-medium text-secondary-700">{log.userName}</div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(log.userType)}`}>
                                {getUserTypeLabel(log.userType)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getActivityTypeIcon(log.activityType)}</span>
                          <span className={`px-2 py-1 rounded-full text-caption font-medium ${getActivityTypeColor(log.activityType)}`}>
                            {getActivityTypeLabel(log.activityType)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption font-medium text-secondary-700">{log.activity}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700 max-w-xs truncate">{log.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption font-mono text-secondary-600">{log.ipAddress}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-600">
                          {log.location && (
                            <div>
                              <div>{log.location.city}</div>
                              <div className="text-secondary-400">{log.location.country}</div>
                            </div>
                          )}
                        </div>
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
                <span className="text-6xl mb-4 block">👤</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 조건에 맞는 활동 로그가 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  검색 조건이나 날짜 범위를 변경해보세요
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 활동 로그 상세 모달 */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">활동 로그 상세 정보</h3>
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
                      <div className="text-caption text-secondary-500">세션 ID</div>
                      <div className="text-body font-mono text-secondary-700">{selectedLog.sessionId}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">활동 타입</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg">{getActivityTypeIcon(selectedLog.activityType)}</span>
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getActivityTypeColor(selectedLog.activityType)}`}>
                          {getActivityTypeLabel(selectedLog.activityType)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사용자 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">사용자 정보</h4>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-caption text-primary-600">사용자명</div>
                        <div className="text-body text-primary-700">{selectedLog.userName}</div>
                      </div>
                      <div>
                        <div className="text-caption text-primary-600">이메일</div>
                        <div className="text-body text-primary-700">{selectedLog.userEmail}</div>
                      </div>
                      <div>
                        <div className="text-caption text-primary-600">사용자 타입</div>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getUserTypeColor(selectedLog.userType)}`}>
                          {getUserTypeLabel(selectedLog.userType)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 활동 상세 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">활동 상세</h4>
                  <div className="space-y-3">
                    <div className="bg-accent-50 p-4 rounded-lg">
                      <div className="text-caption text-accent-600">활동</div>
                      <div className="text-body font-medium text-accent-700">{selectedLog.activity}</div>
                    </div>
                    <div className="bg-background-50 p-4 rounded-lg">
                      <div className="text-caption text-secondary-500">설명</div>
                      <div className="text-body text-secondary-700">{selectedLog.description}</div>
                    </div>
                  </div>
                </div>

                {/* 네트워크 및 디바이스 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">네트워크 및 디바이스 정보</h4>
                  <div className="space-y-3">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">IP 주소</div>
                      <div className="text-body font-mono text-secondary-700">{selectedLog.ipAddress}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">User Agent</div>
                      <div className="text-caption font-mono text-secondary-700 break-all">{selectedLog.userAgent}</div>
                    </div>
                    {selectedLog.deviceInfo && (
                      <div className="bg-background-50 p-3 rounded-lg">
                        <div className="text-caption text-secondary-500">디바이스 정보</div>
                        <div className="text-body text-secondary-700">
                          {selectedLog.deviceInfo.device} - {selectedLog.deviceInfo.os} - {selectedLog.deviceInfo.browser}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 위치 정보 */}
                {selectedLog.location && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">위치 정보</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-caption text-secondary-600">국가</div>
                          <div className="text-body text-secondary-700">{selectedLog.location.country}</div>
                        </div>
                        <div>
                          <div className="text-caption text-secondary-600">지역</div>
                          <div className="text-body text-secondary-700">{selectedLog.location.region}</div>
                        </div>
                        <div>
                          <div className="text-caption text-secondary-600">도시</div>
                          <div className="text-body text-secondary-700">{selectedLog.location.city}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 데이터 변경사항 */}
                {(selectedLog.beforeData || selectedLog.afterData) && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">데이터 변경사항</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLog.beforeData && (
                        <div className="bg-error-50 p-4 rounded-lg">
                          <div className="text-caption text-error-600 mb-2">변경 전</div>
                          <pre className="text-caption font-mono text-error-700 whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.beforeData, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.afterData && (
                        <div className="bg-accent-50 p-4 rounded-lg">
                          <div className="text-caption text-accent-600 mb-2">변경 후</div>
                          <pre className="text-caption font-mono text-accent-700 whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.afterData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 관련 리소스 */}
                {selectedLog.relatedResourceId && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">관련 리소스</h4>
                    <div className="bg-logo-point/10 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-caption text-logo-main">리소스 ID</div>
                          <div className="text-body font-mono text-logo-dark">{selectedLog.relatedResourceId}</div>
                        </div>
                        <div>
                          <div className="text-caption text-logo-main">리소스 타입</div>
                          <div className="text-body text-logo-dark">{selectedLog.relatedResourceType}</div>
                        </div>
                      </div>
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

export default UserActivityLogsPage;
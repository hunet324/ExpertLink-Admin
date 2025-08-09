// 심리상담 플랫폼 네비게이션 타입 정의
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path: string;
  badge?: number | string;
  children?: MenuItem[];
}

export interface UserRole {
  id: 'expert' | 'admin';
  name: string;
  navigation: MenuItem[];
}

// 전문가용 네비게이션 구조
export const expertNavigation: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: 'home',
    path: '/expert/dashboard',
    children: [
      { id: 'today-schedule', label: '오늘 일정', path: '/expert/dashboard/schedule' },
      { id: 'new-requests', label: '신규 요청', path: '/expert/dashboard/requests', badge: 'NEW' }
    ]
  },
  {
    id: 'clients',
    label: '내담자 관리',
    icon: 'users',
    path: '/expert/clients',
    children: [
      { id: 'client-list', label: '내담자 리스트', path: '/expert/clients/list' },
      { id: 'client-profile', label: '프로필 관리', path: '/expert/clients/profile' },
      { id: 'calendar', label: '일정 캘린더', path: '/expert/clients/calendar' }
    ]
  },
  {
    id: 'counseling',
    label: '상담실',
    icon: 'video',
    path: '/expert/counseling',
    children: [
      { id: 'video-call', label: '화상 상담', path: '/expert/counseling/video' },
      { id: 'chat', label: '채팅 상담', path: '/expert/counseling/chat' },
      { id: 'voice-call', label: '음성 상담', path: '/expert/counseling/voice' }
    ]
  },
  {
    id: 'records',
    label: '상담 기록',
    icon: 'file-text',
    path: '/expert/records',
    children: [
      { id: 'write-record', label: '기록 작성', path: '/expert/records/write' },
      { id: 'record-history', label: '상담 이력', path: '/expert/records/history' }
    ]
  },
  {
    id: 'assessment',
    label: '검사 피드백',
    icon: 'clipboard',
    path: '/expert/assessment',
    children: [
      { id: 'test-results', label: '검사 결과', path: '/expert/assessment/results' },
      { id: 'feedback', label: '피드백 작성', path: '/expert/assessment/feedback' }
    ]
  }
];

// 관리자용 네비게이션 구조
export const adminNavigation: MenuItem[] = [
  {
    id: 'approval',
    label: '승인 관리',
    icon: 'check-circle',
    path: '/admin/approval',
    children: [
      { id: 'user-approval', label: '사용자 승인', path: '/admin/approval/users', badge: 3 },
      { id: 'expert-approval', label: '전문가 승인', path: '/admin/approval/experts', badge: 1 }
    ]
  },
  {
    id: 'cms',
    label: 'CMS 관리',
    icon: 'settings',
    path: '/admin/cms',
    children: [
      { id: 'survey-editor', label: '설문 문항 편집', path: '/admin/cms/survey' },
      { id: 'logic-editor', label: '분기 로직 편집', path: '/admin/cms/logic' }
    ]
  },
  {
    id: 'partnership',
    label: '제휴 관리',
    icon: 'handshake',
    path: '/admin/partnership',
    children: [
      { id: 'hospital-manage', label: '병원 관리', path: '/admin/partnership/hospitals' },
      { id: 'test-items', label: '검사 항목', path: '/admin/partnership/tests' }
    ]
  },
  {
    id: 'statistics',
    label: '통계 관리',
    icon: 'bar-chart',
    path: '/admin/statistics',
    children: [
      { id: 'payment-history', label: '결제 내역', path: '/admin/statistics/payments' },
      { id: 'revenue-stats', label: '매출 통계', path: '/admin/statistics/revenue' }
    ]
  },
  {
    id: 'system',
    label: '시스템',
    icon: 'server',
    path: '/admin/system',
    children: [
      { id: 'operation-log', label: '운영 로그', path: '/admin/system/logs' },
      { id: 'settings', label: '기본 설정', path: '/admin/system/settings' }
    ]
  }
];
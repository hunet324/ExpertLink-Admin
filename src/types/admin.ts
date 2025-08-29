// 관리자 대시보드 API 응답 타입 정의

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  inactiveUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface ExpertStats {
  totalExperts: number;
  verifiedExperts: number;
  pendingVerification: number;
  activeExperts: number;
  averageRating: number;
}

export interface CounselingStats {
  totalCounselings: number;
  completedCounselings: number;
  pendingCounselings: number;
  cancelledCounselings: number;
  counselingsToday: number;
  counselingsThisWeek: number;
  counselingsThisMonth: number;
  averageSessionDuration: number;
}

export interface ContentStats {
  totalContents: number;
  publishedContents: number;
  draftContents: number;
  totalViews: number;
  totalLikes: number;
  mostViewedContent: {
    id: number;
    title: string;
    views: number;
  } | null;
}

export interface PsychTestStats {
  totalTests: number;
  activeTests: number;
  totalResponses: number;
  responsesToday: number;
  responsesThisWeek: number;
  responsesThisMonth: number;
  mostPopularTest: {
    id: number;
    title: string;
    responseCount: number;
  } | null;
}

export interface SystemStats {
  totalNotifications: number;
  unreadNotifications: number;
  chatMessagesToday: number;
  loginSessionsToday: number;
  serverUptime: string;
  databaseSize: string;
}

export interface AdminDashboardStats {
  users: UserStats;
  experts: ExpertStats;
  counselings: CounselingStats;
  contents: ContentStats;
  psychTests: PsychTestStats;
  system: SystemStats;
  generatedAt: string;
}

// 최근 활동 타입
export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'expert_application' | 'session_completed' | 'payment' | 'system_alert';
  description: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
  userId?: number;
  userType?: string;
  userName?: string;
  details?: string;
}

// 승인 대기 목록 타입
export interface PendingApproval {
  id: string;
  type: 'user' | 'expert';
  name: string;
  email: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
}

// API 응답 타입
export interface DashboardApiResponse {
  stats: AdminDashboardStats;
  recentActivities?: RecentActivity[];
  pendingApprovals?: PendingApproval[];
}
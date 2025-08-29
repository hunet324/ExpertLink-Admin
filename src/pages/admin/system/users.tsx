import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { userService, UserResponse, UserListResponse } from '@/services/user';
import { centerService, Center } from '@/services/center';
import { UserType } from '@/types/user';

interface User extends UserResponse {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profileImage?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  joinedAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
  totalSessions?: number;
  totalPayments?: number;
  notes?: string;
  expertProfile?: {
    licenseType: string;
    specializations: string[];
    experience: number;
    rating: number;
    completedSessions: number;
  };
}

const AllUsersPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | User['userType'] | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // 사용자 목록 로딩
  useEffect(() => {
    loadUsers();
  }, [userTypeFilter, statusFilter, pagination.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        userType: userTypeFilter === 'all' || userTypeFilter === 'admin' ? undefined : userTypeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined
      };

      const response = await userService.getAllUsers(params);
      console.log('사용자 목록 API 응답:', response);
      
      // API 응답을 User 인터페이스로 변환 (서버에서 이미 camelCase로 변환되어 온다)
      console.log('🔍 API 응답 사용자 데이터 샘플:', response.users[0]);
      const transformedUsers: User[] = response.users.map(user => ({
        ...user,
        joinedAt: user.createdAt,
        // 실제 API 데이터 사용
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        loginCount: user.loginCount || 0,
        totalSessions: user.totalSessions || 0,
        totalPayments: user.totalPayments || 0,
        lastLoginAt: user.lastLoginAt || (user as any).last_login_at || undefined
      }));

      // 'admin' 필터의 경우 클라이언트 측에서 필터링
      let finalUsers = transformedUsers;
      if (userTypeFilter === 'admin') {
        finalUsers = transformedUsers.filter(user => 
          ['staff', 'center_manager', 'regional_manager', 'super_admin'].includes(user.userType)
        );
      }

      setUsers(finalUsers);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: userTypeFilter === 'admin' ? finalUsers.length : response.total,
        totalPages: userTypeFilter === 'admin' ? Math.ceil(finalUsers.length / response.limit) : response.totalPages
      });
      setError('');
    } catch (err: any) {
      console.error('사용자 목록 조회 실패:', err);
      setError(err.message || '사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  // 더미 데이터 (상세 보기용) - 동적 날짜 생성
  const [sampleUsers] = useState<User[]>(() => {
    const now = new Date();
    const getRelativeDate = (monthsAgo: number, daysAgo: number = 0) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString();
    };

    return [
    {
      id: 1,
      name: '김내담자',
      email: 'kim.client@example.com',
      phone: '010-1111-2222',
      userType: 'general',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1992-05-15',
      gender: 'female',
      joinedAt: getRelativeDate(7, 5),
      lastLoginAt: getRelativeDate(0, 3),
      loginCount: 45,
      totalSessions: 8,
      totalPayments: 640000,
      createdAt: getRelativeDate(7, 5),
      updatedAt: getRelativeDate(0, 3)
    },
    {
      id: 2,
      name: '박환자',
      email: 'park.patient@example.com',
      phone: '010-2222-3333',
      userType: 'general',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      birthDate: '1988-11-22',
      gender: 'male',
      joinedAt: getRelativeDate(6, 10),
      lastLoginAt: getRelativeDate(0, 4),
      loginCount: 32,
      totalSessions: 5,
      totalPayments: 425000,
      notes: '결제 관련 문의 이력 있음',
      createdAt: getRelativeDate(6, 10),
      updatedAt: getRelativeDate(0, 4)
    },
    {
      id: 3,
      name: '이상담사',
      email: 'lee.counselor@example.com',
      phone: '010-3333-4444',
      userType: 'expert',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1985-07-08',
      gender: 'female',
      joinedAt: getRelativeDate(8, 15),
      lastLoginAt: getRelativeDate(0, 2),
      loginCount: 120,
      totalSessions: 0,
      totalPayments: 0,
      expertProfile: {
        licenseType: '임상심리사 1급',
        specializations: ['우울/불안', '대인관계', '학습상담'],
        experience: 8,
        rating: 4.8,
        completedSessions: 156
      },
      createdAt: getRelativeDate(8, 15),
      updatedAt: getRelativeDate(0, 2)
    },
    {
      id: 4,
      name: '최심리사',
      email: 'choi.therapist@example.com',
      phone: '010-4444-5555',
      userType: 'expert',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1990-03-12',
      gender: 'male',
      joinedAt: getRelativeDate(7, 20),
      lastLoginAt: getRelativeDate(0, 2),
      loginCount: 89,
      totalSessions: 0,
      totalPayments: 0,
      expertProfile: {
        licenseType: '상담심리사 1급',
        specializations: ['가족상담', '청소년상담'],
        experience: 5,
        rating: 4.6,
        completedSessions: 78
      },
      createdAt: getRelativeDate(7, 20),
      updatedAt: getRelativeDate(0, 2)
    },
    {
      id: 5,
      name: '김관리자',
      email: 'admin@expertlink.com',
      phone: '010-5555-6666',
      userType: 'super_admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      joinedAt: getRelativeDate(9, 5),
      lastLoginAt: getRelativeDate(0, 2),
      loginCount: 200,
      totalSessions: 0,
      totalPayments: 0,
      createdAt: getRelativeDate(9, 5),
      updatedAt: getRelativeDate(0, 2)
    },
    {
      id: 6,
      name: '정고객',
      email: 'jung.customer@example.com',
      phone: '010-6666-7777',
      userType: 'general',
      status: 'inactive',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1995-09-30',
      gender: 'other',
      joinedAt: getRelativeDate(5, 15),
      lastLoginAt: getRelativeDate(1, 10),
      loginCount: 15,
      totalSessions: 2,
      totalPayments: 160000,
      notes: '부적절한 행동으로 인해 일시 정지됨',
      createdAt: getRelativeDate(5, 15),
      updatedAt: getRelativeDate(1, 10)
    },
    {
      id: 7,
      name: '홍길동',
      email: 'hong.gd@example.com',
      userType: 'general',
      status: 'pending',
      emailVerified: false,
      phoneVerified: false,
      joinedAt: getRelativeDate(0, 15),
      loginCount: 1,
      totalSessions: 0,
      totalPayments: 0,
      notes: '이메일 인증 대기중',
      createdAt: getRelativeDate(0, 15),
      updatedAt: getRelativeDate(0, 15)
    },
    {
      id: 8,
      name: '박전문가',
      email: 'park.expert@example.com',
      phone: '010-7777-8888',
      userType: 'expert',
      status: 'inactive',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1982-12-25',
      gender: 'female',
      joinedAt: getRelativeDate(10, 10),
      lastLoginAt: getRelativeDate(2, 5),
      loginCount: 67,
      totalSessions: 0,
      totalPayments: 0,
      expertProfile: {
        licenseType: '임상심리사 2급',
        specializations: ['성격검사', '진로상담'],
        experience: 12,
        rating: 4.9,
        completedSessions: 203
      },
      notes: '개인사정으로 활동 중단',
      createdAt: getRelativeDate(10, 10),
      updatedAt: getRelativeDate(2, 5)
    }
  ];
  });

  const getUserTypeLabel = (type: UserType) => {
    const typeLabels: Record<UserType, string> = {
      'expert': '전문가',
      'staff': '직원',
      'center_manager': '센터장',
      'regional_manager': '지역 관리자',
      'super_admin': '최고 관리자',
      'general': '일반 사용자'
    };
    return typeLabels[type] || type;
  };

  const getUserTypeColor = (type: UserType) => {
    const typeColors: Record<UserType, string> = {
      'expert': 'bg-accent-100 text-accent-700',
      'staff': 'bg-purple-100 text-purple-700',
      'center_manager': 'bg-orange-100 text-orange-700',
      'regional_manager': 'bg-indigo-100 text-indigo-700',
      'super_admin': 'bg-red-100 text-red-700',
      'general': 'bg-gray-100 text-gray-700'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: User['status']) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'withdrawn': 'bg-error text-white',
      'pending': 'bg-secondary-400 text-white'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: User['status']) => {
    const statusTexts: Record<string, string> = {
      'active': '활성',
      'inactive': '비활성',
      'withdrawn': '탈퇴',
      'pending': '대기'
    };
    return statusTexts[status] || '알 수 없음';
  };

  // API에서 이미 필터링되어 오므로 그대로 사용
  const filteredUsers = users;

  const getFilterCount = (type: 'all' | UserType | 'admin') => {
    if (type === 'all') return pagination.total;
    if (type === 'admin') {
      // 관리자 타입들의 총합
      return users.filter(u => ['staff', 'center_manager', 'regional_manager', 'super_admin'].includes(u.userType)).length;
    }
    // API에서 필터링된 결과이므로 현재 타입과 일치하면 전체 개수
    return userTypeFilter === type ? pagination.total : 0;
  };

  const getStatusCount = (status: 'all' | string) => {
    if (status === 'all') return pagination.total;
    // API에서 필터링된 결과이므로 현재 상태와 일치하면 전체 개수
    return statusFilter === status ? pagination.total : 0;
  };

  const getUserStats = () => {
    return {
      total: pagination.total,
      clients: users.filter(u => u.userType === 'general').length,
      experts: users.filter(u => u.userType === 'expert').length,
      admins: users.filter(u => ['staff', 'center_manager', 'regional_manager', 'super_admin'].includes(u.userType)).length,
      active: users.filter(u => u.status === 'active').length,
      withdrawn: users.filter(u => u.status === 'withdrawn').length
    };
  };

  const stats = getUserStats();

  const openDetailModal = (user: User) => {
    // 더미 데이터에서 상세 정보 찾기 (실제로는 API 호출 필요)
    const detailedUser = sampleUsers.find(s => s.email === user.email) || user;
    setSelectedUser({
      ...user,
      ...detailedUser,
      id: user.id // 원본 ID 유지
    });
    setShowDetailModal(true);
  };

  const testCenterAPI = async () => {
    console.log('=== 센터 API 테스트 시작 ===');
    try {
      const centerList = await centerService.getAllCentersSimple();
      console.log('테스트 결과:', centerList);
      alert(`센터 목록 테스트 성공! 센터 개수: ${centerList?.length || 0}`);
    } catch (error) {
      console.error('테스트 실패:', error);
      alert(`센터 목록 테스트 실패: ${(error as any)?.message}`);
    }
  };

  const openEditModal = async (user: User) => {
    setSelectedUser(user);
    
    // 센터 목록 로딩
    setLoadingCenters(true);
    console.log('센터 목록 로딩 시작...');
    try {
      const centerList = await centerService.getAllCentersSimple();
      console.log('센터 목록 API 응답:', centerList);
      console.log('센터 개수:', centerList?.length || 0);
      setCenters(centerList || []);
      console.log('센터 목록 로딩 성공:', centerList);
    } catch (error) {
      console.error('센터 목록 로딩 실패:', error);
      console.error('에러 상세:', {
        message: (error as any)?.message,
        statusCode: (error as any)?.statusCode,
        response: (error as any)?.response
      });
      setCenters([]);
    } finally {
      setLoadingCenters(false);
    }
    
    setShowEditModal(true);
  };

  const handleUpdateUser = async (formData: FormData) => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      const updateData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        userType: formData.get('userType') as any,
        status: formData.get('status') as string,
        centerId: (() => {
          const value = formData.get('centerId') as string;
          if (!value || value === '') return null;
          const parsed = parseInt(value);
          return isNaN(parsed) ? null : parsed;
        })(),
        notes: formData.get('notes') as string || undefined,
      };

      console.log('사용자 정보 수정 요청:', updateData);
      
      const updatedUser = await userService.updateUser(selectedUser.id, updateData);
      console.log('사용자 정보 수정 완료:', updatedUser);
      
      // 목록 새로고침
      await loadUsers();
      
      // 모달 닫기
      setShowEditModal(false);
      setError('');
      
      alert('사용자 정보가 성공적으로 수정되었습니다.');
      
    } catch (error: any) {
      console.error('사용자 정보 수정 실패:', error);
      setError(error.message || '사용자 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    // 실제 구현에서는 API 호출 필요
    alert(`사용자 ${userId}의 상태를 ${newStatus}로 변경합니다.`);
    loadUsers(); // 목록 새로고침
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 실제 구현에서는 API 호출 필요
      alert(`사용자 ${userId}를 삭제합니다.`);
      loadUsers(); // 목록 새로고침
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

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
                <span className="mr-3 text-2xl">👥</span>
                전체 사용자 목록
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                플랫폼의 모든 사용자를 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-primary">{stats.clients}</div>
                  <div className="text-xs text-secondary-400">내담자</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{stats.experts}</div>
                  <div className="text-xs text-secondary-400">전문가</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-error">{stats.withdrawn}</div>
                  <div className="text-xs text-secondary-400">탈퇴</div>
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
            {/* 검색바 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="이름, 이메일, 전화번호로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '검색 중...' : '검색'}
                </button>
                <button 
                  onClick={testCenterAPI}
                  className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  센터 API 테스트
                </button>
              </div>
            </div>

            {/* 사용자 유형 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'general' as const, label: '일반사용자', count: getFilterCount('general') },
                  { key: 'expert' as const, label: '전문가', count: getFilterCount('expert') },
                  { key: 'admin' as const, label: '관리자', count: getFilterCount('admin') }
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

            {/* 상태 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체 상태', count: getStatusCount('all') },
                  { key: 'active' as const, label: '활성', count: getStatusCount('active') },
                  { key: 'inactive' as const, label: '비활성', count: getStatusCount('inactive') },
                  { key: 'withdrawn' as const, label: '탈퇴', count: getStatusCount('withdrawn') },
                  { key: 'pending' as const, label: '대기', count: getStatusCount('pending') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      statusFilter === tab.key
                        ? 'bg-secondary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      statusFilter === tab.key
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

          {/* 사용자 목록 테이블 */}
          <div className="bg-white rounded-custom shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-50 border-b border-background-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">사용자 정보</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">유형</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">소속센터</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">상태</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">인증</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">가입일</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">최종접속</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">활동</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600 text-caption">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className={`border-b border-background-100 hover:bg-background-50 ${index % 2 === 0 ? 'bg-white' : 'bg-background-25'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            user.userType === 'general' ? 'bg-primary' : 
                            user.userType === 'expert' ? 'bg-accent' : 'bg-secondary'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-body font-medium text-secondary-700">{user.name}</div>
                            <div className="text-caption text-secondary-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-caption text-secondary-400">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getUserTypeColor(user.userType)}`}>
                          {getUserTypeLabel(user.userType)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          {(user as any).centerName ? (
                            <>
                              <div className="text-body font-medium text-secondary-700">{(user as any).centerName}</div>
                              <div className="text-caption text-secondary-500">{(user as any).centerCode}</div>
                            </>
                          ) : (
                            <span className="text-secondary-400">미배정</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${user.emailVerified ? '✅' : '❌'}`} title={user.emailVerified ? '이메일 인증됨' : '이메일 미인증'}></span>
                          <span className={`text-lg ${user.phoneVerified ? '📱' : '📵'}`} title={user.phoneVerified ? '전화번호 인증됨' : '전화번호 미인증'}></span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700">{user.joinedAt ? formatDate(user.joinedAt) : '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700">
                          {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '로그인 이력 없음'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          <div>로그인: {user.loginCount || 0}회</div>
                          {user.userType === 'general' && (
                            <>
                              <div>상담: {user.totalSessions || 0}회</div>
                              <div>결제: {formatCurrency(user.totalPayments || 0)}</div>
                            </>
                          )}
                          {user.userType === 'expert' && user.expertProfile && (
                            <>
                              <div>상담: {user.expertProfile.completedSessions}회</div>
                              <div>평점: ⭐ {user.expertProfile.rating}</div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="text-primary hover:text-primary-600 text-caption"
                          >
                            상세
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-secondary hover:text-secondary-600 text-caption"
                          >
                            수정
                          </button>
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'inactive')}
                              className="text-secondary-400 hover:text-secondary-500 text-caption"
                            >
                              비활성화
                            </button>
                          )}
                          {user.status === 'inactive' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-accent hover:text-accent-600 text-caption"
                            >
                              해제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-secondary-600">사용자 목록을 불러오는 중...</p>
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">👥</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 조건에 맞는 사용자가 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  검색 조건이나 필터를 변경해보세요
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

      {/* 사용자 상세 모달 */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">사용자 상세 정보</h3>
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
                      <div className="text-caption text-secondary-500">이름</div>
                      <div className="text-body text-secondary-700">{selectedUser.name}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">이메일</div>
                      <div className="text-body text-secondary-700">{selectedUser.email}</div>
                    </div>
                    {selectedUser.phone && (
                      <div className="bg-background-50 p-3 rounded-lg">
                        <div className="text-caption text-secondary-500">전화번호</div>
                        <div className="text-body text-secondary-700">{selectedUser.phone}</div>
                      </div>
                    )}
                    {selectedUser.birthDate && (
                      <div className="bg-background-50 p-3 rounded-lg">
                        <div className="text-caption text-secondary-500">생년월일</div>
                        <div className="text-body text-secondary-700">{selectedUser.birthDate ? formatDate(selectedUser.birthDate) : '-'}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 계정 상태 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">계정 상태</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">사용자 유형</div>
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getUserTypeColor(selectedUser.userType)}`}>
                        {getUserTypeLabel(selectedUser.userType)}
                      </span>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">계정 상태</div>
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(selectedUser.status)}`}>
                        {getStatusText(selectedUser.status)}
                      </span>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">인증 상태</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm ${selectedUser.emailVerified ? 'text-accent' : 'text-error'}`}>
                          {selectedUser.emailVerified ? '✅' : '❌'} 이메일
                        </span>
                        <span className={`text-sm ${selectedUser.phoneVerified ? 'text-accent' : 'text-error'}`}>
                          {selectedUser.phoneVerified ? '📱' : '📵'} 전화번호
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 활동 통계 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">활동 통계</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">가입일</div>
                      <div className="text-body text-primary-700">{selectedUser.joinedAt ? formatDate(selectedUser.joinedAt) : '-'}</div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">최종접속</div>
                      <div className="text-body text-primary-700">
                        {selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : '없음'}
                      </div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">로그인 횟수</div>
                      <div className="text-body text-primary-700">{selectedUser.loginCount || 0}회</div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">총 결제액</div>
                      <div className="text-body text-primary-700">{formatCurrency(selectedUser.totalPayments || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* 전문가 프로필 (전문가인 경우) */}
                {selectedUser.userType === 'expert' && selectedUser.expertProfile && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">전문가 프로필</h4>
                    <div className="bg-accent-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-caption text-accent-600">자격증</div>
                          <div className="text-body text-accent-700">{selectedUser.expertProfile.licenseType}</div>
                        </div>
                        <div>
                          <div className="text-caption text-accent-600">경력</div>
                          <div className="text-body text-accent-700">{selectedUser.expertProfile.experience}년</div>
                        </div>
                        <div>
                          <div className="text-caption text-accent-600">완료된 상담</div>
                          <div className="text-body text-accent-700">{selectedUser.expertProfile.completedSessions}회</div>
                        </div>
                        <div>
                          <div className="text-caption text-accent-600">평점</div>
                          <div className="text-body text-accent-700">⭐ {selectedUser.expertProfile.rating}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-caption text-accent-600">전문분야</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedUser.expertProfile.specializations.map((spec, index) => (
                            <span key={index} className="bg-accent text-white px-2 py-1 rounded text-xs">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 관리자 노트 */}
                {selectedUser.notes && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">관리자 노트</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="text-body text-secondary-700">{selectedUser.notes}</div>
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
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 편집 모달 */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">사용자 정보 수정</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateUser(formData);
                }}
              >
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">이름</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedUser.name}
                        required
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">이메일</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={selectedUser.email}
                        required
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">전화번호</label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={selectedUser.phone || ''}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">사용자 유형</label>
                      <select
                        name="userType"
                        defaultValue={selectedUser.userType}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="client">내담자</option>
                        <option value="expert">전문가</option>
                        <option value="staff">직원</option>
                        <option value="center_manager">센터장</option>
                        <option value="regional_manager">지역 관리자</option>
                        <option value="super_admin">최고 관리자</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 계정 상태 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">계정 상태</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">계정 상태</label>
                      <select
                        name="status"
                        defaultValue={selectedUser.status}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="withdrawn">탈퇴</option>
                        <option value="pending">대기</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-caption text-secondary-600 mb-1">소속 센터</label>
                      {loadingCenters ? (
                        <div className="w-full px-3 py-2 border border-background-300 rounded-lg bg-background-50 flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                          <span className="text-secondary-500">센터 목록 로딩 중...</span>
                        </div>
                      ) : (
                        <select
                          name="centerId"
                          defaultValue={selectedUser.centerId || ''}
                          className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                        >
                          <option value="">센터 선택 안함</option>
                          {centers.map((center) => (
                            <option key={center.id} value={center.id}>
                              {center.name} ({center.code})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* 관리자 노트 */}
                <div>
                  <label className="block text-caption text-secondary-600 mb-1">관리자 노트</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedUser.notes || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    placeholder="관리자용 메모를 입력하세요..."
                  />
                </div>

                {/* 폼 제출 버튼들 */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-background-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                    className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;
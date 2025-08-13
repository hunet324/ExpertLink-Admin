import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'client' | 'expert' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  joinedAt: string;
  lastLoginAt?: string;
  loginCount: number;
  totalSessions: number;
  totalPayments: number;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | User['userType']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 전체 사용자 샘플 데이터
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user_001',
      name: '김내담자',
      email: 'kim.client@example.com',
      phone: '010-1111-2222',
      userType: 'client',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1992-05-15',
      gender: 'female',
      joinedAt: '2024-01-15T09:30:00',
      lastLoginAt: '2024-08-12T14:20:00',
      loginCount: 45,
      totalSessions: 8,
      totalPayments: 640000
    },
    {
      id: 'user_002',
      name: '박환자',
      email: 'park.patient@example.com',
      phone: '010-2222-3333',
      userType: 'client',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      birthDate: '1988-11-22',
      gender: 'male',
      joinedAt: '2024-02-20T11:15:00',
      lastLoginAt: '2024-08-11T16:45:00',
      loginCount: 32,
      totalSessions: 5,
      totalPayments: 425000,
      notes: '결제 관련 문의 이력 있음'
    },
    {
      id: 'expert_001',
      name: '이상담사',
      email: 'lee.counselor@example.com',
      phone: '010-3333-4444',
      userType: 'expert',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1985-07-08',
      gender: 'female',
      joinedAt: '2023-12-01T10:00:00',
      lastLoginAt: '2024-08-12T15:30:00',
      loginCount: 120,
      totalSessions: 0,
      totalPayments: 0,
      expertProfile: {
        licenseType: '임상심리사 1급',
        specializations: ['우울/불안', '대인관계', '학습상담'],
        experience: 8,
        rating: 4.8,
        completedSessions: 156
      }
    },
    {
      id: 'expert_002',
      name: '최심리사',
      email: 'choi.therapist@example.com',
      phone: '010-4444-5555',
      userType: 'expert',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1990-03-12',
      gender: 'male',
      joinedAt: '2024-01-10T14:30:00',
      lastLoginAt: '2024-08-12T11:20:00',
      loginCount: 89,
      totalSessions: 0,
      totalPayments: 0,
      expertProfile: {
        licenseType: '상담심리사 1급',
        specializations: ['가족상담', '청소년상담'],
        experience: 5,
        rating: 4.6,
        completedSessions: 78
      }
    },
    {
      id: 'admin_001',
      name: '김관리자',
      email: 'admin@expertlink.com',
      phone: '010-5555-6666',
      userType: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      joinedAt: '2023-11-01T09:00:00',
      lastLoginAt: '2024-08-12T15:00:00',
      loginCount: 200,
      totalSessions: 0,
      totalPayments: 0
    },
    {
      id: 'user_003',
      name: '정고객',
      email: 'jung.customer@example.com',
      phone: '010-6666-7777',
      userType: 'client',
      status: 'suspended',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1995-09-30',
      gender: 'other',
      joinedAt: '2024-03-10T13:20:00',
      lastLoginAt: '2024-07-20T10:15:00',
      loginCount: 15,
      totalSessions: 2,
      totalPayments: 160000,
      notes: '부적절한 행동으로 인해 일시 정지됨'
    },
    {
      id: 'user_004',
      name: '홍길동',
      email: 'hong.gd@example.com',
      userType: 'client',
      status: 'pending',
      emailVerified: false,
      phoneVerified: false,
      joinedAt: '2024-08-10T16:30:00',
      loginCount: 1,
      totalSessions: 0,
      totalPayments: 0,
      notes: '이메일 인증 대기중'
    },
    {
      id: 'expert_003',
      name: '박전문가',
      email: 'park.expert@example.com',
      phone: '010-7777-8888',
      userType: 'expert',
      status: 'inactive',
      emailVerified: true,
      phoneVerified: true,
      birthDate: '1982-12-25',
      gender: 'female',
      joinedAt: '2023-10-15T11:00:00',
      lastLoginAt: '2024-06-30T09:45:00',
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
      notes: '개인사정으로 활동 중단'
    }
  ]);

  const getUserTypeLabel = (type: User['userType']) => {
    const typeLabels = {
      'client': '내담자',
      'expert': '전문가',
      'admin': '관리자'
    };
    return typeLabels[type];
  };

  const getUserTypeColor = (type: User['userType']) => {
    const typeColors = {
      'client': 'bg-primary-100 text-primary-700',
      'expert': 'bg-accent-100 text-accent-700',
      'admin': 'bg-secondary-100 text-secondary-700'
    };
    return typeColors[type];
  };

  const getStatusColor = (status: User['status']) => {
    const statusColors = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'suspended': 'bg-error text-white',
      'pending': 'bg-secondary-400 text-white'
    };
    return statusColors[status];
  };

  const getStatusText = (status: User['status']) => {
    const statusTexts = {
      'active': '활성',
      'inactive': '비활성',
      'suspended': '정지',
      'pending': '대기'
    };
    return statusTexts[status];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchQuery));
    
    const matchesUserType = userTypeFilter === 'all' || user.userType === userTypeFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesUserType && matchesStatus;
  });

  const getFilterCount = (type: 'all' | User['userType']) => {
    if (type === 'all') return users.length;
    return users.filter(user => user.userType === type).length;
  };

  const getStatusCount = (status: 'all' | User['status']) => {
    if (status === 'all') return users.length;
    return users.filter(user => user.status === status).length;
  };

  const getUserStats = () => {
    return {
      total: users.length,
      clients: users.filter(u => u.userType === 'client').length,
      experts: users.filter(u => u.userType === 'expert').length,
      admins: users.filter(u => u.userType === 'admin').length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length
    };
  };

  const stats = getUserStats();

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
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
                  <div className="text-h4 font-bold text-error">{stats.suspended}</div>
                  <div className="text-xs text-secondary-400">정지</div>
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
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                  검색
                </button>
              </div>
            </div>

            {/* 사용자 유형 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'client' as const, label: '내담자', count: getFilterCount('client') },
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
                  { key: 'suspended' as const, label: '정지', count: getStatusCount('suspended') },
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
                            user.userType === 'client' ? 'bg-primary' : 
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
                        <div className="text-caption text-secondary-700">{formatDate(user.joinedAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700">
                          {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '로그인 이력 없음'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          <div>로그인: {user.loginCount}회</div>
                          {user.userType === 'client' && (
                            <>
                              <div>상담: {user.totalSessions}회</div>
                              <div>결제: {formatCurrency(user.totalPayments)}</div>
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
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                              className="text-error hover:text-error-600 text-caption"
                            >
                              정지
                            </button>
                          )}
                          {user.status === 'suspended' && (
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

            {filteredUsers.length === 0 && (
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
                        <div className="text-body text-secondary-700">{formatDate(selectedUser.birthDate)}</div>
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
                      <div className="text-body text-primary-700">{formatDate(selectedUser.joinedAt)}</div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">최종접속</div>
                      <div className="text-body text-primary-700">
                        {selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : '없음'}
                      </div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">로그인 횟수</div>
                      <div className="text-body text-primary-700">{selectedUser.loginCount}회</div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">총 결제액</div>
                      <div className="text-body text-primary-700">{formatCurrency(selectedUser.totalPayments)}</div>
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
    </div>
  );
};

export default AllUsersPage;
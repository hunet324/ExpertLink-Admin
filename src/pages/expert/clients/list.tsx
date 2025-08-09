import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';

interface Client {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  registrationDate: string;
  lastSession: string;
  nextSession?: string;
  status: 'active' | 'inactive' | 'completed';
  totalSessions: number;
  phoneNumber: string;
  email: string;
  notes: string;
}

const ClientListPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'registrationDate' | 'lastSession'>('registrationDate');

  // 내담자 샘플 데이터
  const clients: Client[] = [
    {
      id: '1',
      name: '김민수',
      age: 28,
      gender: 'male',
      registrationDate: '2024-06-15',
      lastSession: '2024-08-05',
      nextSession: '2024-08-12',
      status: 'active',
      totalSessions: 8,
      phoneNumber: '010-1234-5678',
      email: 'kim.minsu@email.com',
      notes: '불안 장애 관련 상담 진행 중'
    },
    {
      id: '2',
      name: '이지은',
      age: 32,
      gender: 'female',
      registrationDate: '2024-07-20',
      lastSession: '2024-08-07',
      nextSession: '2024-08-14',
      status: 'active',
      totalSessions: 4,
      phoneNumber: '010-2345-6789',
      email: 'lee.jieun@email.com',
      notes: '우울증 초기 상담'
    },
    {
      id: '3',
      name: '박준형',
      age: 45,
      gender: 'male',
      registrationDate: '2024-05-10',
      lastSession: '2024-07-30',
      nextSession: undefined,
      status: 'inactive',
      totalSessions: 12,
      phoneNumber: '010-3456-7890',
      email: 'park.junhyung@email.com',
      notes: '직장 스트레스 관리'
    },
    {
      id: '4',
      name: '최수영',
      age: 26,
      gender: 'female',
      registrationDate: '2024-03-05',
      lastSession: '2024-07-25',
      nextSession: undefined,
      status: 'completed',
      totalSessions: 16,
      phoneNumber: '010-4567-8901',
      email: 'choi.suyoung@email.com',
      notes: '대인관계 개선 상담 완료'
    },
    {
      id: '5',
      name: '정하린',
      age: 35,
      gender: 'female',
      registrationDate: '2024-07-28',
      lastSession: '2024-08-06',
      nextSession: '2024-08-13',
      status: 'active',
      totalSessions: 2,
      phoneNumber: '010-5678-9012',
      email: 'jung.harin@email.com',
      notes: '육아 스트레스 상담'
    }
  ];

  const filteredClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko');
        case 'registrationDate':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        case 'lastSession':
          return new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime();
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-white';
      case 'inactive': return 'bg-background-400 text-secondary-600';
      case 'completed': return 'bg-primary text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'inactive': return '비활성';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : '👩';
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary">내담자 관리</h1>
              <p className="text-caption text-secondary-400 mt-1">
                전체 {clients.length}명의 내담자 중 {filteredClients.length}명 표시
              </p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors">
              + 새 내담자 등록
            </button>
          </div>
        </header>

        {/* 필터 및 검색 */}
        <div className="bg-white border-b border-background-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 검색 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">🔍</span>
                <input
                  type="text"
                  placeholder="내담자명, 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-background-300 rounded-lg text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* 필터 */}
            <div className="flex items-center space-x-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 상태</option>
                <option value="active">진행중</option>
                <option value="inactive">비활성</option>
                <option value="completed">완료</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="registrationDate">등록일순</option>
                <option value="name">이름순</option>
                <option value="lastSession">최근 상담순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 내담자 목록 */}
        <main className="flex-1 overflow-y-auto p-6">
          {filteredClients.length > 0 ? (
            <div className="bg-white rounded-custom shadow-soft overflow-hidden">
              {/* 테이블 헤더 */}
              <div className="bg-background-50 px-6 py-4 border-b border-background-200">
                <div className="grid grid-cols-12 gap-4 text-caption font-medium text-secondary-600">
                  <div className="col-span-2">내담자</div>
                  <div className="col-span-2">연락처</div>
                  <div className="col-span-2">등록일</div>
                  <div className="col-span-2">최근 상담</div>
                  <div className="col-span-1">총 상담</div>
                  <div className="col-span-1">상태</div>
                  <div className="col-span-2">액션</div>
                </div>
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-background-200">
                {filteredClients.map((client) => (
                  <div key={client.id} className="px-6 py-4 hover:bg-background-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* 내담자 정보 */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {client.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-body font-medium text-secondary-700">{client.name}</span>
                              <span className="text-sm">{getGenderIcon(client.gender)}</span>
                            </div>
                            <span className="text-caption text-secondary-400">{client.age}세</span>
                          </div>
                        </div>
                      </div>

                      {/* 연락처 */}
                      <div className="col-span-2">
                        <div className="text-body text-secondary-600">{client.phoneNumber}</div>
                        <div className="text-caption text-secondary-400 truncate">{client.email}</div>
                      </div>

                      {/* 등록일 */}
                      <div className="col-span-2">
                        <div className="text-body text-secondary-600">
                          {new Date(client.registrationDate).toLocaleDateString('ko-KR')}
                        </div>
                      </div>

                      {/* 최근 상담 */}
                      <div className="col-span-2">
                        <div className="text-body text-secondary-600">
                          {new Date(client.lastSession).toLocaleDateString('ko-KR')}
                        </div>
                        {client.nextSession && (
                          <div className="text-caption text-primary">
                            다음: {new Date(client.nextSession).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </div>

                      {/* 총 상담 */}
                      <div className="col-span-1">
                        <span className="text-body font-medium text-secondary-700">{client.totalSessions}회</span>
                      </div>

                      {/* 상태 */}
                      <div className="col-span-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                      </div>

                      {/* 액션 */}
                      <div className="col-span-2">
                        <div className="flex space-x-2">
                          <button className="text-primary hover:text-primary-600 text-caption font-medium transition-colors">
                            상세보기
                          </button>
                          <button className="text-secondary-400 hover:text-secondary-600 text-caption font-medium transition-colors">
                            편집
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 메모 (있는 경우에만) */}
                    {client.notes && (
                      <div className="mt-3 ml-13">
                        <div className="bg-background-50 rounded-lg p-3">
                          <span className="text-caption text-secondary-600">{client.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-custom shadow-soft p-12 text-center">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-h3 font-semibold text-secondary-600 mb-2">검색 결과가 없습니다</h3>
              <p className="text-body text-secondary-400 mb-6">
                다른 검색어를 사용하거나 필터를 조정해보세요.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientListPage;
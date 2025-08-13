import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface Expert {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  licenseNumber: string;
  licenseType: string;
  specializations: string[];
  experience: number;
  education: string[];
  certifications: string[];
  workHistory: {
    institution: string;
    position: string;
    period: string;
  }[];
  bio: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
  consultationCount: number;
  rating: number;
  consultationTypes: {
    video: boolean;
    chat: boolean;
    voice: boolean;
  };
  rates: {
    video: number;
    chat: number;
    voice: number;
  };
  totalEarnings: number;
  clientCount: number;
}

const ExpertSystemPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 승인된 전문가 샘플 데이터
  const [experts, setExperts] = useState<Expert[]>([
    {
      id: 'expert_001',
      name: '김상담사',
      email: 'kim.counselor@example.com',
      phone: '010-1111-2222',
      birthDate: '1985-03-15',
      gender: 'female',
      licenseNumber: '임상심리사 1급 제2024-001호',
      licenseType: '임상심리사 1급',
      specializations: ['우울/불안', '대인관계', '학습상담', 'ADHD'],
      experience: 8,
      education: [
        '서울대학교 심리학과 학사',
        '연세대학교 임상심리학 석사',
        '고려대학교 임상심리학 박사'
      ],
      certifications: [
        '임상심리사 1급',
        '정신건강임상심리사',
        '학습치료사',
        'CBT 인증 치료사'
      ],
      workHistory: [
        {
          institution: '서울대병원 정신건강의학과',
          position: '임상심리사',
          period: '2020-2024'
        },
        {
          institution: '강남 심리상담센터',
          position: '수석 상담사',
          period: '2016-2020'
        }
      ],
      bio: '안녕하세요. 8년간 임상 현장에서 다양한 내담자들과 함께 성장해온 김상담사입니다.',
      status: 'active',
      joinedAt: '2024-08-10T14:30:00',
      lastLogin: '2024-08-12T09:15:00',
      consultationCount: 127,
      rating: 4.8,
      consultationTypes: {
        video: true,
        chat: true,
        voice: true
      },
      rates: {
        video: 80000,
        chat: 50000,
        voice: 60000
      },
      totalEarnings: 8640000,
      clientCount: 45
    },
    {
      id: 'expert_002',
      name: '이전문가',
      email: 'lee.expert@example.com',
      phone: '010-3333-4444',
      birthDate: '1982-11-05',
      gender: 'female',
      licenseNumber: '임상심리사 2급 제2024-003호',
      licenseType: '임상심리사 2급',
      specializations: ['트라우마', '정신분석', '게슈탈트'],
      experience: 12,
      education: [
        '고려대 심리학과 학사',
        '서울대 임상심리학 석사',
        '연세대 임상심리학 박사'
      ],
      certifications: [
        '임상심리사 2급',
        '정신분석치료사',
        '게슈탈트치료사',
        'EMDR 치료사'
      ],
      workHistory: [
        {
          institution: '트라우마치료센터',
          position: '센터장',
          period: '2018-2024'
        },
        {
          institution: '삼성의료원 정신건강의학과',
          position: '임상심리사',
          period: '2012-2018'
        }
      ],
      bio: '트라우마 전문 치료사로서 12년간 다양한 임상 경험을 쌓아왔습니다.',
      status: 'active',
      joinedAt: '2024-08-08T16:45:00',
      lastLogin: '2024-08-12T08:30:00',
      consultationCount: 234,
      rating: 4.9,
      consultationTypes: {
        video: true,
        chat: false,
        voice: true
      },
      rates: {
        video: 100000,
        chat: 0,
        voice: 80000
      },
      totalEarnings: 18720000,
      clientCount: 78
    }
  ]);

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search as string);
    }
  }, [router.query]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-white';
      case 'inactive': return 'bg-background-400 text-white';
      case 'suspended': return 'bg-error text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활동중';
      case 'inactive': return '비활성';
      case 'suspended': return '정지';
      default: return status;
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || expert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getFilterCount = (status: 'all' | 'active' | 'inactive' | 'suspended') => {
    if (status === 'all') return experts.length;
    return experts.filter(expert => expert.status === status).length;
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

  const openDetailModal = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowDetailModal(true);
  };

  const handleStatusChange = (expertId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setExperts(prev => prev.map(expert => 
      expert.id === expertId 
        ? { ...expert, status: newStatus }
        : expert
    ));
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
                <span className="mr-3 text-2xl">👨‍⚕️</span>
                전문가 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                승인된 전문가들의 정보를 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getFilterCount('active')}</div>
                  <div className="text-xs text-secondary-400">활동중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{getFilterCount('inactive')}</div>
                  <div className="text-xs text-secondary-400">비활성</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-error">{getFilterCount('suspended')}</div>
                  <div className="text-xs text-secondary-400">정지됨</div>
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
                    placeholder="전문가 이름, 이메일, 전문분야로 검색..."
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

            {/* 상태 필터 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'active' as const, label: '활동중', count: getFilterCount('active') },
                  { key: 'inactive' as const, label: '비활성', count: getFilterCount('inactive') },
                  { key: 'suspended' as const, label: '정지됨', count: getFilterCount('suspended') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      statusFilter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        statusFilter === tab.key
                          ? 'bg-white text-primary'
                          : 'bg-background-200 text-secondary-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 전문가 목록 */}
          <div className="space-y-4">
            {filteredExperts.length > 0 ? (
              filteredExperts.map((expert) => (
                <div key={expert.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{expert.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-h4 font-semibold text-secondary flex items-center space-x-2">
                          <span>{expert.name}</span>
                          <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption">
                            {expert.licenseType}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(expert.status)}`}>
                            {getStatusText(expert.status)}
                          </span>
                        </h3>
                        <p className="text-caption text-secondary-400 mt-1">{expert.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-caption text-secondary-400">가입일: {formatDate(expert.joinedAt)}</div>
                      <div className="text-caption text-secondary-400 mt-1">최종 접속: {formatDateTime(expert.lastLogin)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
                    {/* 활동 통계 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">활동 통계</h4>
                      <div className="space-y-1 text-caption">
                        <div className="flex justify-between">
                          <span>상담 횟수:</span>
                          <span className="font-medium">{expert.consultationCount}회</span>
                        </div>
                        <div className="flex justify-between">
                          <span>내담자 수:</span>
                          <span className="font-medium">{expert.clientCount}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span>평점:</span>
                          <span className="font-medium text-accent">⭐ {expert.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* 수익 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">수익 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div className="flex justify-between">
                          <span>총 수익:</span>
                          <span className="font-medium text-primary">{formatCurrency(expert.totalEarnings)}</span>
                        </div>
                        <div className="text-xs text-secondary-400">
                          평균: {formatCurrency(Math.round(expert.totalEarnings / expert.consultationCount))} / 건
                        </div>
                      </div>
                    </div>

                    {/* 전문분야 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">전문분야</h4>
                      <div className="flex flex-wrap gap-1">
                        {expert.specializations.slice(0, 3).map((spec, index) => (
                          <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                        {expert.specializations.length > 3 && (
                          <span className="bg-background-200 text-secondary-500 px-2 py-1 rounded text-xs">
                            +{expert.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 상담 방식 및 요금 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">상담 방식 및 요금</h4>
                      <div className="space-y-1 text-xs">
                        {expert.consultationTypes.video && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>🎥</span>
                              <span>화상</span>
                            </span>
                            <span>{formatCurrency(expert.rates.video)}</span>
                          </div>
                        )}
                        {expert.consultationTypes.chat && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>💭</span>
                              <span>채팅</span>
                            </span>
                            <span>{formatCurrency(expert.rates.chat)}</span>
                          </div>
                        )}
                        {expert.consultationTypes.voice && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>🎧</span>
                              <span>음성</span>
                            </span>
                            <span>{formatCurrency(expert.rates.voice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <button
                      onClick={() => openDetailModal(expert)}
                      className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                    >
                      상세정보
                    </button>

                    <div className="flex space-x-2">
                      {expert.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(expert.id, 'inactive')}
                            className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                          >
                            비활성화
                          </button>
                          <button
                            onClick={() => handleStatusChange(expert.id, 'suspended')}
                            className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                          >
                            정지
                          </button>
                        </>
                      )}
                      
                      {expert.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(expert.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}

                      {expert.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(expert.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          정지해제
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/admin/system/experts/${expert.id}/edit`)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  다른 검색어를 입력하거나 필터를 변경해보세요.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">{selectedExpert.name} 전문가 상세 정보</h3>
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
                      <div className="text-caption text-secondary-500">이메일</div>
                      <div className="text-body text-secondary-700">{selectedExpert.email}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">전화번호</div>
                      <div className="text-body text-secondary-700">{selectedExpert.phone}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">생년월일</div>
                      <div className="text-body text-secondary-700">{formatDate(selectedExpert.birthDate)}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">성별</div>
                      <div className="text-body text-secondary-700">
                        {selectedExpert.gender === 'male' ? '남성' : '여성'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 학력 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">학력</h4>
                  <ul className="space-y-1">
                    {selectedExpert.education.map((edu, index) => (
                      <li key={index} className="text-body text-secondary-700 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 자격증 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">자격증</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedExpert.certifications.map((cert, index) => (
                      <div key={index} className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                        <span className="text-accent-700 text-body">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 경력 사항 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">경력 사항</h4>
                  <div className="space-y-3">
                    {selectedExpert.workHistory.map((work, index) => (
                      <div key={index} className="border border-background-200 rounded-lg p-4">
                        <div className="text-body font-medium text-secondary-700">{work.institution}</div>
                        <div className="text-caption text-secondary-500">{work.position}</div>
                        <div className="text-caption text-secondary-400">{work.period}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 소개글 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">소개글</h4>
                  <div className="bg-background-50 p-4 rounded-lg">
                    <p className="text-body text-secondary-700 leading-relaxed whitespace-pre-wrap">
                      {selectedExpert.bio}
                    </p>
                  </div>
                </div>
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

export default ExpertSystemPage;
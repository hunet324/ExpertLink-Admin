import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  type: 'general' | 'university' | 'specialized' | 'clinic';
  departments: string[];
  contactPerson: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  businessNumber: string;
  medicalLicense: string;
  contractInfo: {
    startDate: string;
    endDate: string;
    type: 'standard' | 'premium' | 'enterprise';
    commissionRate: number;
  };
  services: string[];
  operatingHours: {
    weekdays: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  images: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

const HospitalManagementPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Hospital['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Hospital['type']>('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 병원 샘플 데이터
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: 'hosp_001',
      name: '서울대학교병원',
      address: '서울특별시 종로구 대학로 101',
      phone: '02-2072-2114',
      email: 'partnership@snuh.org',
      website: 'https://www.snuh.org',
      description: '국내 최고 수준의 의료진과 첨단 의료장비를 보유한 종합병원입니다.',
      type: 'university',
      departments: ['정신건강의학과', '소아청소년정신과', '재활의학과', '신경과'],
      contactPerson: {
        name: '김담당',
        position: '기획조정실장',
        phone: '02-2072-2345',
        email: 'kim.manager@snuh.org'
      },
      businessNumber: '110-82-00123',
      medicalLicense: 'MD-2024-001',
      contractInfo: {
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        type: 'premium',
        commissionRate: 15
      },
      services: ['심리검사', '정신과 진료', '인지치료', '집단치료'],
      operatingHours: {
        weekdays: { open: '08:30', close: '17:30' },
        saturday: { open: '08:30', close: '12:30' },
        sunday: { open: '00:00', close: '00:00' }
      },
      images: ['/images/hospitals/snuh_1.jpg', '/images/hospitals/snuh_2.jpg'],
      status: 'active',
      createdAt: '2024-01-15T09:00:00',
      updatedAt: '2024-08-10T14:30:00'
    },
    {
      id: 'hosp_002',
      name: '강남세브란스병원',
      address: '서울특별시 강남구 언주로 211',
      phone: '02-2019-3114',
      email: 'contact@gs.yonsei.ac.kr',
      website: 'https://gs.severance.org',
      description: '연세대학교 의과대학 강남세브란스병원으로 최신 의료 기술을 제공합니다.',
      type: 'university',
      departments: ['정신건강의학과', '신경과', '재활의학과'],
      contactPerson: {
        name: '박협력',
        position: '대외협력팀장',
        phone: '02-2019-3456',
        email: 'park.coop@yuhs.ac'
      },
      businessNumber: '110-82-00456',
      medicalLicense: 'MD-2024-002',
      contractInfo: {
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        type: 'standard',
        commissionRate: 12
      },
      services: ['종합심리검사', '정신과 상담', '인지재활'],
      operatingHours: {
        weekdays: { open: '08:00', close: '18:00' },
        saturday: { open: '08:00', close: '13:00' },
        sunday: { open: '00:00', close: '00:00' }
      },
      images: ['/images/hospitals/gs_1.jpg'],
      status: 'active',
      createdAt: '2024-03-01T10:00:00',
      updatedAt: '2024-08-05T11:20:00'
    },
    {
      id: 'hosp_003',
      name: '마음편한 정신건강의학과의원',
      address: '서울특별시 서초구 서초대로 301',
      phone: '02-567-8901',
      email: 'info@mindpeace.co.kr',
      website: 'https://mindpeace.co.kr',
      description: '개인 맞춤형 정신건강 진료를 제공하는 전문 클리닉입니다.',
      type: 'clinic',
      departments: ['정신건강의학과'],
      contactPerson: {
        name: '최원장',
        position: '원장',
        phone: '02-567-8902',
        email: 'director@mindpeace.co.kr'
      },
      businessNumber: '123-45-67890',
      medicalLicense: 'MD-2024-003',
      contractInfo: {
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        type: 'standard',
        commissionRate: 10
      },
      services: ['개인상담', '심리검사', 'ADHD 진단'],
      operatingHours: {
        weekdays: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: '00:00', close: '00:00' }
      },
      images: [],
      status: 'pending',
      createdAt: '2024-06-01T14:30:00',
      updatedAt: '2024-06-01T14:30:00'
    },
    {
      id: 'hosp_004',
      name: '서울재활병원',
      address: '서울특별시 은평구 진관2로 58',
      phone: '02-901-3000',
      email: 'rehab@seoul-rehab.org',
      description: '재활 전문 병원으로 인지재활 프로그램을 운영합니다.',
      type: 'specialized',
      departments: ['재활의학과', '작업치료과', '언어치료과'],
      contactPerson: {
        name: '이재활',
        position: '사업개발팀장',
        phone: '02-901-3100',
        email: 'lee.bizdev@seoul-rehab.org'
      },
      businessNumber: '110-82-00789',
      medicalLicense: 'MD-2024-004',
      contractInfo: {
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        type: 'enterprise',
        commissionRate: 20
      },
      services: ['인지재활', '언어치료', '작업치료'],
      operatingHours: {
        weekdays: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { open: '00:00', close: '00:00' }
      },
      images: ['/images/hospitals/rehab_1.jpg', '/images/hospitals/rehab_2.jpg'],
      status: 'inactive',
      createdAt: '2024-02-01T11:00:00',
      updatedAt: '2024-07-15T16:45:00'
    }
  ]);

  const getTypeLabel = (type: Hospital['type']) => {
    const typeLabels = {
      'general': '종합병원',
      'university': '대학병원',
      'specialized': '전문병원',
      'clinic': '의원'
    };
    return typeLabels[type];
  };

  const getTypeColor = (type: Hospital['type']) => {
    const typeColors = {
      'general': 'bg-primary-100 text-primary-700 border-primary-200',
      'university': 'bg-accent-100 text-accent-700 border-accent-200',
      'specialized': 'bg-secondary-100 text-secondary-700 border-secondary-200',
      'clinic': 'bg-logo-point/20 text-logo-main border-logo-point/30'
    };
    return typeColors[type];
  };

  const getStatusColor = (status: Hospital['status']) => {
    const statusColors = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'pending': 'bg-secondary-400 text-white',
      'suspended': 'bg-error text-white'
    };
    return statusColors[status];
  };

  const getStatusText = (status: Hospital['status']) => {
    const statusTexts = {
      'active': '운영중',
      'inactive': '비활성',
      'pending': '승인대기',
      'suspended': '정지'
    };
    return statusTexts[status];
  };

  const getContractTypeLabel = (type: Hospital['contractInfo']['type']) => {
    const contractTypes = {
      'standard': '일반',
      'premium': '프리미엄',
      'enterprise': '기업'
    };
    return contractTypes[type];
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.departments.some(dept => dept.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || hospital.status === statusFilter;
    const matchesType = typeFilter === 'all' || hospital.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getFilterCount = (status: 'all' | Hospital['status']) => {
    if (status === 'all') return hospitals.length;
    return hospitals.filter(hospital => hospital.status === status).length;
  };

  const openHospitalModal = (hospital?: Hospital) => {
    if (hospital) {
      setSelectedHospital(hospital);
      setIsEditing(true);
    } else {
      setSelectedHospital({
        id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        type: 'clinic',
        departments: [],
        contactPerson: {
          name: '',
          position: '',
          phone: '',
          email: ''
        },
        businessNumber: '',
        medicalLicense: '',
        contractInfo: {
          startDate: '',
          endDate: '',
          type: 'standard',
          commissionRate: 10
        },
        services: [],
        operatingHours: {
          weekdays: { open: '09:00', close: '18:00' },
          saturday: { open: '09:00', close: '13:00' },
          sunday: { open: '00:00', close: '00:00' }
        },
        images: [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    }
    setShowHospitalModal(true);
  };

  const openDetailModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailModal(true);
  };

  const handleSaveHospital = () => {
    if (!selectedHospital) return;

    if (isEditing) {
      setHospitals(prev => prev.map(hospital => 
        hospital.id === selectedHospital.id 
          ? { ...selectedHospital, updatedAt: new Date().toISOString() }
          : hospital
      ));
    } else {
      const newHospital = {
        ...selectedHospital,
        id: `hosp_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setHospitals(prev => [...prev, newHospital]);
    }
    
    setShowHospitalModal(false);
    setSelectedHospital(null);
  };

  const handleDeleteHospital = (hospitalId: string) => {
    if (confirm('이 병원을 삭제하시겠습니까?')) {
      setHospitals(prev => prev.filter(hospital => hospital.id !== hospitalId));
    }
  };

  const handleStatusChange = (hospitalId: string, newStatus: Hospital['status']) => {
    setHospitals(prev => prev.map(hospital => 
      hospital.id === hospitalId 
        ? { ...hospital, status: newStatus, updatedAt: new Date().toISOString() }
        : hospital
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatTime = (time: string) => {
    if (!time || time === '00:00') return '휴무';
    return time;
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
                <span className="mr-3 text-2xl">🏥</span>
                병원 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                제휴 병원을 등록하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getFilterCount('active')}</div>
                  <div className="text-xs text-secondary-400">운영중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{getFilterCount('pending')}</div>
                  <div className="text-xs text-secondary-400">승인대기</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{hospitals.length}</div>
                  <div className="text-xs text-secondary-400">전체</div>
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
                      placeholder="병원명, 주소, 진료과로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                      className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="all">모든 유형</option>
                      <option value="university">대학병원</option>
                      <option value="general">종합병원</option>
                      <option value="specialized">전문병원</option>
                      <option value="clinic">의원</option>
                    </select>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                      검색
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openHospitalModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>병원 등록</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 상태 필터 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'active' as const, label: '운영중', count: getFilterCount('active') },
                  { key: 'pending' as const, label: '승인대기', count: getFilterCount('pending') },
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

          {/* 병원 목록 */}
          <div className="space-y-4">
            {filteredHospitals.length > 0 ? (
              filteredHospitals.map((hospital) => (
                <div key={hospital.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-h4 font-semibold text-secondary">{hospital.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium border ${getTypeColor(hospital.type)}`}>
                          {getTypeLabel(hospital.type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(hospital.status)}`}>
                          {getStatusText(hospital.status)}
                        </span>
                        <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption">
                          {getContractTypeLabel(hospital.contractInfo.type)} 계약
                        </span>
                      </div>
                      <p className="text-caption text-secondary-500 mb-3">{hospital.address}</p>
                      {hospital.description && (
                        <p className="text-caption text-secondary-600 mb-3">{hospital.description}</p>
                      )}
                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>등록: {formatDate(hospital.createdAt)}</div>
                      <div>수정: {formatDate(hospital.updatedAt)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
                    {/* 연락처 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">연락처</h4>
                      <div className="space-y-1 text-caption">
                        <div>📞 {hospital.phone}</div>
                        <div>✉️ {hospital.email}</div>
                        {hospital.website && (
                          <div>🌐 <a href={hospital.website} target="_blank" className="text-primary hover:underline">웹사이트</a></div>
                        )}
                      </div>
                    </div>

                    {/* 담당자 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">담당자</h4>
                      <div className="space-y-1 text-caption">
                        <div>{hospital.contactPerson.name} ({hospital.contactPerson.position})</div>
                        <div>📞 {hospital.contactPerson.phone}</div>
                        <div>✉️ {hospital.contactPerson.email}</div>
                      </div>
                    </div>

                    {/* 진료과 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">진료과</h4>
                      <div className="flex flex-wrap gap-1">
                        {hospital.departments.slice(0, 3).map((dept, index) => (
                          <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                            {dept}
                          </span>
                        ))}
                        {hospital.departments.length > 3 && (
                          <span className="bg-background-200 text-secondary-500 px-2 py-1 rounded text-xs">
                            +{hospital.departments.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 계약 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">계약 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div>수수료: {hospital.contractInfo.commissionRate}%</div>
                        <div>기간: {formatDate(hospital.contractInfo.startDate)} ~ {formatDate(hospital.contractInfo.endDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 운영시간 */}
                  <div className="bg-background-50 p-3 rounded-lg mb-4">
                    <h4 className="text-caption font-semibold text-secondary-600 mb-2">운영시간</h4>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-secondary-500">평일: </span>
                        <span>{formatTime(hospital.operatingHours.weekdays.open)} - {formatTime(hospital.operatingHours.weekdays.close)}</span>
                      </div>
                      <div>
                        <span className="text-secondary-500">토요일: </span>
                        <span>{formatTime(hospital.operatingHours.saturday.open)} - {formatTime(hospital.operatingHours.saturday.close)}</span>
                      </div>
                      <div>
                        <span className="text-secondary-500">일요일: </span>
                        <span>{formatTime(hospital.operatingHours.sunday.open)} - {formatTime(hospital.operatingHours.sunday.close)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <button
                      onClick={() => openDetailModal(hospital)}
                      className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                    >
                      상세정보
                    </button>

                    <div className="flex space-x-2">
                      {hospital.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(hospital.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          승인
                        </button>
                      )}
                      
                      {hospital.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(hospital.id, 'inactive')}
                          className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                        >
                          비활성화
                        </button>
                      )}

                      {hospital.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(hospital.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}

                      <button
                        onClick={() => openHospitalModal(hospital)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        수정
                      </button>
                      
                      <button
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">🏥</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 병원이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400 mb-4">
                  {searchQuery ? '다른 검색어를 입력해보세요' : '첫 번째 제휴 병원을 등록해보세요'}
                </p>
                <button
                  onClick={() => openHospitalModal()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  병원 등록하기
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 병원 등록/수정 모달 */}
      {showHospitalModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {isEditing ? '병원 정보 수정' : '새 병원 등록'}
                </h3>
                <button
                  onClick={() => setShowHospitalModal(false)}
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
                    <div>
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        병원명 *
                      </label>
                      <input
                        type="text"
                        value={selectedHospital.name}
                        onChange={(e) => setSelectedHospital({...selectedHospital, name: e.target.value})}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                        placeholder="병원명을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        병원 유형 *
                      </label>
                      <select
                        value={selectedHospital.type}
                        onChange={(e) => setSelectedHospital({...selectedHospital, type: e.target.value as Hospital['type']})}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="clinic">의원</option>
                        <option value="general">종합병원</option>
                        <option value="university">대학병원</option>
                        <option value="specialized">전문병원</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    주소 *
                  </label>
                  <input
                    type="text"
                    value={selectedHospital.address}
                    onChange={(e) => setSelectedHospital({...selectedHospital, address: e.target.value})}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    placeholder="병원 주소를 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      value={selectedHospital.phone}
                      onChange={(e) => setSelectedHospital({...selectedHospital, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="02-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={selectedHospital.email}
                      onChange={(e) => setSelectedHospital({...selectedHospital, email: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="hospital@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowHospitalModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveHospital}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  {isEditing ? '수정' : '등록'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagementPage;
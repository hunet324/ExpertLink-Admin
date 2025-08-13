import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface TestItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  type: 'psychological' | 'cognitive' | 'personality' | 'intelligence' | 'attention' | 'memory' | 'depression' | 'anxiety';
  targetAge: {
    min: number;
    max: number;
  };
  duration: number; // 분 단위
  price: number;
  instructions: string;
  interpretation: string;
  requirements: string[];
  materials: string[];
  scoringMethod: 'manual' | 'automated' | 'hybrid';
  reportFormat: 'simple' | 'detailed' | 'comprehensive';
  validityPeriod: number; // 개월 단위
  adminInstructions: string;
  qualifications: string[];
  availableHospitals: string[];
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

interface TestCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

const TestManagementPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | TestItem['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TestItem['status']>('all');
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 검사 카테고리
  const categories: TestCategory[] = [
    { id: 'adult', name: '성인 검사', description: '성인 대상 심리검사', color: 'primary' },
    { id: 'child', name: '아동/청소년 검사', description: '아동 및 청소년 대상 검사', color: 'accent' },
    { id: 'elderly', name: '노인 검사', description: '노인 대상 전문 검사', color: 'secondary' },
    { id: 'clinical', name: '임상 검사', description: '임상 진단용 검사', color: 'error' },
    { id: 'occupational', name: '직업 검사', description: '직업 적성 및 선발 검사', color: 'logo' }
  ];

  // 검사 항목 샘플 데이터
  const [testItems, setTestItems] = useState<TestItem[]>([
    {
      id: 'test_001',
      name: 'MMPI-2 (다면적 인성검사)',
      code: 'MMPI-2',
      description: '가장 널리 사용되는 객관적 성격검사로 정신병리 및 성격특성을 평가합니다.',
      category: 'adult',
      type: 'personality',
      targetAge: { min: 18, max: 99 },
      duration: 90,
      price: 35000,
      instructions: '567개의 문항에 대해 참/거짓으로 응답하며, 약 90분 소요됩니다. 솔직하게 응답하는 것이 중요합니다.',
      interpretation: 'T점수 65 이상은 임상적 유의미한 수준으로 해석하며, 프로파일 패턴을 종합적으로 분석합니다.',
      requirements: ['심리학 석사 이상', 'MMPI 해석 교육 이수', '임상 경험 2년 이상'],
      materials: ['검사지', '답안지', '프로파일 용지', '해석 매뉴얼'],
      scoringMethod: 'automated',
      reportFormat: 'comprehensive',
      validityPeriod: 12,
      adminInstructions: '조용하고 편안한 환경에서 실시하며, 충분한 시간을 제공해야 합니다.',
      qualifications: ['임상심리사', '상담심리사', '정신건강임상심리사'],
      availableHospitals: ['hosp_001', 'hosp_002'],
      status: 'active',
      version: '2.1',
      createdAt: '2024-01-15T09:00:00',
      updatedAt: '2024-08-10T14:30:00',
      createdBy: '김관리자',
      lastModifiedBy: '박담당자'
    },
    {
      id: 'test_002',
      name: 'K-WAIS-IV (한국판 웩슬러 성인지능검사)',
      code: 'K-WAIS-IV',
      description: '16-69세 성인의 인지능력을 종합적으로 평가하는 개별 지능검사입니다.',
      category: 'adult',
      type: 'intelligence',
      targetAge: { min: 16, max: 69 },
      duration: 120,
      price: 45000,
      instructions: '개별 실시하며 약 2시간 소요됩니다. 4개 지표(언어이해, 지각추론, 작업기억, 처리속도)를 평가합니다.',
      interpretation: 'IQ 90-109는 평균, 110-119는 평균상, 120-129는 우수 수준으로 해석합니다.',
      requirements: ['심리학 석사 이상', 'WAIS 실시 교육 수료', '개별검사 경험'],
      materials: ['자극책자', '기록지', '블록', '퍼즐', '스톱워치'],
      scoringMethod: 'manual',
      reportFormat: 'detailed',
      validityPeriod: 24,
      adminInstructions: '개별실시 원칙, 표준화된 지시문 준수, 정확한 시간 측정 필요합니다.',
      qualifications: ['임상심리사', '학교심리사'],
      availableHospitals: ['hosp_001', 'hosp_003'],
      status: 'active',
      version: '1.3',
      createdAt: '2024-02-01T10:00:00',
      updatedAt: '2024-07-15T16:20:00',
      createdBy: '이전문가',
      lastModifiedBy: '김관리자'
    },
    {
      id: 'test_003',
      name: 'K-CBCL (한국판 아동행동평가척도)',
      code: 'K-CBCL',
      description: '4-18세 아동청소년의 사회능력과 행동문제를 평가하는 부모 보고형 척도입니다.',
      category: 'child',
      type: 'psychological',
      targetAge: { min: 4, max: 18 },
      duration: 30,
      price: 25000,
      instructions: '부모나 주 양육자가 작성하며, 30분 내외로 소요됩니다. 지난 6개월간의 행동을 평가합니다.',
      interpretation: 'T점수 70 이상은 임상범위, 65-69는 준임상범위로 해석합니다.',
      requirements: ['아동심리 전공', '발달심리 이해', '부모 상담 경험'],
      materials: ['평가지', '프로파일지', '해석 가이드'],
      scoringMethod: 'automated',
      reportFormat: 'detailed',
      validityPeriod: 6,
      adminInstructions: '부모에게 충분한 설명 제공, 솔직한 응답 독려, 질문사항 즉시 해결',
      qualifications: ['아동청소년상담사', '임상심리사', '학교심리사'],
      availableHospitals: ['hosp_002', 'hosp_004'],
      status: 'active',
      version: '2.0',
      createdAt: '2024-03-01T11:30:00',
      updatedAt: '2024-08-05T09:45:00',
      createdBy: '박심리사',
      lastModifiedBy: '최전문가'
    },
    {
      id: 'test_004',
      name: 'BDI-II (벡 우울척도)',
      code: 'BDI-II',
      description: '13세 이상에서 우울증상의 심각도를 측정하는 자기보고형 척도입니다.',
      category: 'adult',
      type: 'depression',
      targetAge: { min: 13, max: 99 },
      duration: 15,
      price: 15000,
      instructions: '21개 문항에 대해 지난 2주간의 느낌을 0-3점으로 평가합니다.',
      interpretation: '0-13: 최소, 14-19: 경도, 20-28: 중등도, 29-63: 심한 우울로 해석합니다.',
      requirements: ['우울증 평가 교육', '정신건강 기초 지식'],
      materials: ['검사지', '채점 가이드'],
      scoringMethod: 'manual',
      reportFormat: 'simple',
      validityPeriod: 3,
      adminInstructions: '조용한 환경에서 혼자 작성하도록 하며, 자살관련 문항 주의깊게 확인',
      qualifications: ['정신건강임상심리사', '상담심리사', '임상심리사'],
      availableHospitals: ['hosp_001', 'hosp_002', 'hosp_003'],
      status: 'active',
      version: '1.1',
      createdAt: '2024-04-01T14:00:00',
      updatedAt: '2024-06-20T11:30:00',
      createdBy: '정상담사',
      lastModifiedBy: '김관리자'
    },
    {
      id: 'test_005',
      name: 'ADHD 진단검사 (성인용)',
      code: 'ADHD-ADULT',
      description: '성인 ADHD 증상을 평가하고 진단에 도움을 주는 종합검사배터리입니다.',
      category: 'adult',
      type: 'attention',
      targetAge: { min: 18, max: 65 },
      duration: 60,
      price: 40000,
      instructions: '주의력, 충동성, 과활동성을 종합적으로 평가하며, 컴퓨터 기반 검사를 포함합니다.',
      interpretation: 'ADHD 증상 심각도와 하위유형을 분석하여 진단적 정보를 제공합니다.',
      requirements: ['ADHD 전문 교육', '신경심리학적 검사 경험', '진단 경험'],
      materials: ['컴퓨터', '검사 소프트웨어', '평가지', '보고서 양식'],
      scoringMethod: 'hybrid',
      reportFormat: 'comprehensive',
      validityPeriod: 12,
      adminInstructions: 'CPT 검사 시 방해요소 제거, 약물 복용 여부 확인, 충분한 휴식 제공',
      qualifications: ['임상심리사', '신경심리사', 'ADHD 전문가'],
      availableHospitals: ['hosp_001', 'hosp_004'],
      status: 'draft',
      version: '1.0',
      createdAt: '2024-07-01T16:00:00',
      updatedAt: '2024-08-01T10:15:00',
      createdBy: '홍전문가',
      lastModifiedBy: '홍전문가'
    },
    {
      id: 'test_006',
      name: 'LOTCA (인지평가도구)',
      code: 'LOTCA',
      description: '뇌손상 환자의 인지기능을 평가하는 작업치료 전문 도구입니다.',
      category: 'elderly',
      type: 'cognitive',
      targetAge: { min: 20, max: 99 },
      duration: 45,
      price: 30000,
      instructions: '지남력, 지각, 시공간, 운동실행, 사고능력 등을 단계적으로 평가합니다.',
      interpretation: '각 영역별 점수와 총점을 통해 인지기능 수준을 4단계로 평가합니다.',
      requirements: ['작업치료학과 졸업', '신경학적 재활 경험', 'LOTCA 교육 수료'],
      materials: ['검사키트', '기록지', '시계', '색연필', '적목'],
      scoringMethod: 'manual',
      reportFormat: 'detailed',
      validityPeriod: 6,
      adminInstructions: '환자 상태에 따라 검사 순서 조정 가능, 피로도 모니터링 필수',
      qualifications: ['작업치료사', '임상심리사'],
      availableHospitals: ['hosp_004'],
      status: 'inactive',
      version: '2.5',
      createdAt: '2024-05-15T13:30:00',
      updatedAt: '2024-08-10T15:20:00',
      createdBy: '양작업치료사',
      lastModifiedBy: '김관리자'
    }
  ]);

  const getTypeLabel = (type: TestItem['type']) => {
    const typeLabels = {
      'psychological': '심리검사',
      'cognitive': '인지검사',
      'personality': '성격검사',
      'intelligence': '지능검사',
      'attention': '주의력검사',
      'memory': '기억검사',
      'depression': '우울검사',
      'anxiety': '불안검사'
    };
    return typeLabels[type];
  };

  const getTypeColor = (type: TestItem['type']) => {
    const typeColors = {
      'psychological': 'bg-primary-100 text-primary-700',
      'cognitive': 'bg-accent-100 text-accent-700',
      'personality': 'bg-secondary-100 text-secondary-700',
      'intelligence': 'bg-logo-point/20 text-logo-main',
      'attention': 'bg-error-100 text-error-700',
      'memory': 'bg-background-200 text-secondary-600',
      'depression': 'bg-purple-100 text-purple-700',
      'anxiety': 'bg-orange-100 text-orange-700'
    };
    return typeColors[type];
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 'bg-background-200 text-secondary-600';
    
    const colorMap = {
      'primary': 'bg-primary-100 text-primary-700 border-primary-200',
      'accent': 'bg-accent-100 text-accent-700 border-accent-200',
      'secondary': 'bg-secondary-100 text-secondary-700 border-secondary-200',
      'error': 'bg-error-100 text-error-700 border-error-200',
      'logo': 'bg-logo-point/20 text-logo-main border-logo-point/30'
    };
    return colorMap[category.color as keyof typeof colorMap] || 'bg-background-200 text-secondary-600';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '기타';
  };

  const getStatusColor = (status: TestItem['status']) => {
    const statusColors = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'draft': 'bg-secondary-400 text-white',
      'deprecated': 'bg-error text-white'
    };
    return statusColors[status];
  };

  const getStatusText = (status: TestItem['status']) => {
    const statusTexts = {
      'active': '활성',
      'inactive': '비활성',
      'draft': '초안',
      'deprecated': '사용중단'
    };
    return statusTexts[status];
  };

  const getScoringMethodText = (method: TestItem['scoringMethod']) => {
    const methodTexts = {
      'manual': '수동채점',
      'automated': '자동채점',
      'hybrid': '혼합채점'
    };
    return methodTexts[method];
  };

  const getReportFormatText = (format: TestItem['reportFormat']) => {
    const formatTexts = {
      'simple': '간단',
      'detailed': '상세',
      'comprehensive': '종합'
    };
    return formatTexts[format];
  };

  const filteredTests = testItems.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
    const matchesType = typeFilter === 'all' || test.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getFilterCount = (status: 'all' | TestItem['status']) => {
    if (status === 'all') return testItems.length;
    return testItems.filter(test => test.status === status).length;
  };

  const openTestModal = (test?: TestItem) => {
    if (test) {
      setSelectedTest(test);
      setIsEditing(true);
    } else {
      setSelectedTest({
        id: '',
        name: '',
        code: '',
        description: '',
        category: categories[0]?.id || 'adult',
        type: 'psychological',
        targetAge: { min: 18, max: 65 },
        duration: 60,
        price: 30000,
        instructions: '',
        interpretation: '',
        requirements: [],
        materials: [],
        scoringMethod: 'manual',
        reportFormat: 'detailed',
        validityPeriod: 12,
        adminInstructions: '',
        qualifications: [],
        availableHospitals: [],
        status: 'draft',
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '관리자',
        lastModifiedBy: '관리자'
      });
      setIsEditing(false);
    }
    setShowTestModal(true);
  };

  const openDetailModal = (test: TestItem) => {
    setSelectedTest(test);
    setShowDetailModal(true);
  };

  const handleSaveTest = () => {
    if (!selectedTest) return;

    if (isEditing) {
      setTestItems(prev => prev.map(test => 
        test.id === selectedTest.id 
          ? { ...selectedTest, updatedAt: new Date().toISOString(), lastModifiedBy: '관리자' }
          : test
      ));
    } else {
      const newTest = {
        ...selectedTest,
        id: `test_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setTestItems(prev => [...prev, newTest]);
    }
    
    setShowTestModal(false);
    setSelectedTest(null);
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('이 검사 항목을 삭제하시겠습니까?')) {
      setTestItems(prev => prev.filter(test => test.id !== testId));
    }
  };

  const handleStatusChange = (testId: string, newStatus: TestItem['status']) => {
    setTestItems(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: newStatus, updatedAt: new Date().toISOString(), lastModifiedBy: '관리자' }
        : test
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
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
                <span className="mr-3 text-2xl">🧪</span>
                검사 항목 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                심리검사 및 인지검사 항목을 등록하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getFilterCount('active')}</div>
                  <div className="text-xs text-secondary-400">활성</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{getFilterCount('draft')}</div>
                  <div className="text-xs text-secondary-400">초안</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{testItems.length}</div>
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
                      placeholder="검사명, 코드, 설명으로 검색..."
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
                      <option value="psychological">심리검사</option>
                      <option value="cognitive">인지검사</option>
                      <option value="personality">성격검사</option>
                      <option value="intelligence">지능검사</option>
                      <option value="attention">주의력검사</option>
                      <option value="depression">우울검사</option>
                      <option value="anxiety">불안검사</option>
                    </select>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                      검색
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openTestModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>검사 항목 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 카테고리 및 상태 필터 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    categoryFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'text-secondary-600 hover:bg-background-100'
                  }`}
                >
                  <span>전체</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    categoryFilter === 'all'
                      ? 'bg-white text-primary'
                      : 'bg-background-200 text-secondary-500'
                  }`}>
                    {testItems.length}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryFilter(category.id)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                      categoryFilter === category.id
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      categoryFilter === category.id
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {testItems.filter(test => test.category === category.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 검사 항목 목록 */}
          <div className="space-y-4">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div key={test.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-h4 font-semibold text-secondary">{test.name}</h3>
                        <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption font-mono">
                          {test.code}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium border ${getCategoryColor(test.category)}`}>
                          {getCategoryName(test.category)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getTypeColor(test.type)}`}>
                          {getTypeLabel(test.type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(test.status)}`}>
                          {getStatusText(test.status)}
                        </span>
                      </div>
                      {test.description && (
                        <p className="text-caption text-secondary-500 mb-3">{test.description}</p>
                      )}
                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>생성: {formatDate(test.createdAt)} ({test.createdBy})</div>
                      <div>수정: {formatDate(test.updatedAt)} ({test.lastModifiedBy})</div>
                      <div>버전: {test.version}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
                    {/* 기본 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">기본 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div>대상 연령: {test.targetAge.min}-{test.targetAge.max}세</div>
                        <div>소요 시간: {test.duration}분</div>
                        <div>검사 비용: {formatCurrency(test.price)}</div>
                        <div>유효 기간: {test.validityPeriod}개월</div>
                      </div>
                    </div>

                    {/* 실시 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">실시 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div>채점 방법: {getScoringMethodText(test.scoringMethod)}</div>
                        <div>보고서 형식: {getReportFormatText(test.reportFormat)}</div>
                        <div>검사 도구: {test.materials.length}개</div>
                      </div>
                    </div>

                    {/* 자격 요건 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">자격 요건</h4>
                      <div className="flex flex-wrap gap-1">
                        {test.qualifications.slice(0, 2).map((qual, index) => (
                          <span key={index} className="bg-accent-100 text-accent-700 px-2 py-1 rounded text-xs">
                            {qual}
                          </span>
                        ))}
                        {test.qualifications.length > 2 && (
                          <span className="bg-background-200 text-secondary-500 px-2 py-1 rounded text-xs">
                            +{test.qualifications.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 제공 병원 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">제공 병원</h4>
                      <div className="text-caption">
                        <div>{test.availableHospitals.length}개 병원에서 제공</div>
                      </div>
                    </div>
                  </div>

                  {/* 검사 지침 미리보기 */}
                  {test.instructions && (
                    <div className="bg-background-50 p-3 rounded-lg mb-4">
                      <h4 className="text-caption font-semibold text-secondary-600 mb-2">검사 지침</h4>
                      <p className="text-caption text-secondary-700 line-clamp-2">{test.instructions}</p>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <button
                      onClick={() => openDetailModal(test)}
                      className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                    >
                      상세정보
                    </button>

                    <div className="flex space-x-2">
                      {test.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(test.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}
                      
                      {test.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(test.id, 'inactive')}
                          className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                        >
                          비활성화
                        </button>
                      )}

                      {test.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(test.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}

                      <button
                        onClick={() => openTestModal(test)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        수정
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTest(test.id)}
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
                <span className="text-6xl mb-4 block">🧪</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 검사 항목이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400 mb-4">
                  {searchQuery ? '다른 검색어를 입력해보세요' : '첫 번째 검사 항목을 추가해보세요'}
                </p>
                <button
                  onClick={() => openTestModal()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  검사 항목 추가하기
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 검사 항목 등록/수정 모달 (간략화) */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {isEditing ? '검사 항목 수정' : '새 검사 항목 등록'}
                </h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      검사명 *
                    </label>
                    <input
                      type="text"
                      value={selectedTest.name}
                      onChange={(e) => setSelectedTest({...selectedTest, name: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="검사명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      검사 코드 *
                    </label>
                    <input
                      type="text"
                      value={selectedTest.code}
                      onChange={(e) => setSelectedTest({...selectedTest, code: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="검사 코드를 입력하세요"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    검사 설명
                  </label>
                  <textarea
                    value={selectedTest.description}
                    onChange={(e) => setSelectedTest({...selectedTest, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    placeholder="검사에 대한 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      카테고리 *
                    </label>
                    <select
                      value={selectedTest.category}
                      onChange={(e) => setSelectedTest({...selectedTest, category: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      검사 유형 *
                    </label>
                    <select
                      value={selectedTest.type}
                      onChange={(e) => setSelectedTest({...selectedTest, type: e.target.value as TestItem['type']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="psychological">심리검사</option>
                      <option value="cognitive">인지검사</option>
                      <option value="personality">성격검사</option>
                      <option value="intelligence">지능검사</option>
                      <option value="attention">주의력검사</option>
                      <option value="memory">기억검사</option>
                      <option value="depression">우울검사</option>
                      <option value="anxiety">불안검사</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      상태
                    </label>
                    <select
                      value={selectedTest.status}
                      onChange={(e) => setSelectedTest({...selectedTest, status: e.target.value as TestItem['status']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="draft">초안</option>
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="deprecated">사용중단</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveTest}
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

export default TestManagementPage;
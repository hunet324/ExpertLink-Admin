import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface Question {
  id: string;
  title: string;
  description?: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'scale' | 'yes_no';
  required: boolean;
  category: string;
  order: number;
  options?: {
    id: string;
    text: string;
    value: string | number;
    order: number;
  }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  logicRules?: {
    id: string;
    condition: string;
    action: 'show' | 'hide' | 'jump_to';
    targetId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
}

interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
}

const QuestionsManagementPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 설문 카테고리 샘플 데이터
  const [categories, setCategories] = useState<QuestionCategory[]>([
    {
      id: 'basic_info',
      name: '기본 정보',
      description: '내담자의 기본적인 인적사항',
      order: 1,
      color: 'primary'
    },
    {
      id: 'psychological',
      name: '심리 상태',
      description: '현재 심리적 상태 및 증상',
      order: 2,
      color: 'accent'
    },
    {
      id: 'life_style',
      name: '생활 양식',
      description: '일상생활 패턴 및 습관',
      order: 3,
      color: 'secondary'
    },
    {
      id: 'relationships',
      name: '대인 관계',
      description: '가족, 친구, 직장 내 관계',
      order: 4,
      color: 'logo'
    }
  ]);

  // 설문 문항 샘플 데이터
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q_001',
      title: '현재 나이를 선택해 주세요',
      type: 'single_choice',
      required: true,
      category: 'basic_info',
      order: 1,
      options: [
        { id: 'age_10s', text: '10대', value: '10s', order: 1 },
        { id: 'age_20s', text: '20대', value: '20s', order: 2 },
        { id: 'age_30s', text: '30대', value: '30s', order: 3 },
        { id: 'age_40s', text: '40대', value: '40s', order: 4 },
        { id: 'age_50plus', text: '50대 이상', value: '50plus', order: 5 }
      ],
      createdAt: '2024-08-10T10:00:00',
      updatedAt: '2024-08-10T10:00:00',
      status: 'active'
    },
    {
      id: 'q_002',
      title: '성별을 선택해 주세요',
      type: 'single_choice',
      required: true,
      category: 'basic_info',
      order: 2,
      options: [
        { id: 'gender_male', text: '남성', value: 'male', order: 1 },
        { id: 'gender_female', text: '여성', value: 'female', order: 2 },
        { id: 'gender_other', text: '기타', value: 'other', order: 3 }
      ],
      createdAt: '2024-08-10T10:00:00',
      updatedAt: '2024-08-10T10:00:00',
      status: 'active'
    },
    {
      id: 'q_003',
      title: '최근 2주간 우울감을 얼마나 자주 경험하셨나요?',
      description: '해당하는 정도를 선택해 주세요',
      type: 'scale',
      required: true,
      category: 'psychological',
      order: 1,
      validation: {
        min: 1,
        max: 5
      },
      options: [
        { id: 'depression_1', text: '전혀 없음', value: 1, order: 1 },
        { id: 'depression_2', text: '거의 없음', value: 2, order: 2 },
        { id: 'depression_3', text: '보통', value: 3, order: 3 },
        { id: 'depression_4', text: '자주', value: 4, order: 4 },
        { id: 'depression_5', text: '매우 자주', value: 5, order: 5 }
      ],
      logicRules: [
        {
          id: 'rule_001',
          condition: 'value >= 4',
          action: 'show',
          targetId: 'q_004'
        }
      ],
      createdAt: '2024-08-10T11:00:00',
      updatedAt: '2024-08-11T09:30:00',
      status: 'active'
    },
    {
      id: 'q_004',
      title: '우울감이 일상생활에 미치는 영향을 구체적으로 설명해 주세요',
      type: 'text',
      required: false,
      category: 'psychological',
      order: 2,
      validation: {
        minLength: 10,
        maxLength: 500
      },
      createdAt: '2024-08-10T11:00:00',
      updatedAt: '2024-08-10T11:00:00',
      status: 'active'
    },
    {
      id: 'q_005',
      title: '현재 복용 중인 약물이 있나요?',
      type: 'yes_no',
      required: true,
      category: 'basic_info',
      order: 3,
      logicRules: [
        {
          id: 'rule_002',
          condition: 'value == "yes"',
          action: 'show',
          targetId: 'q_006'
        }
      ],
      createdAt: '2024-08-10T12:00:00',
      updatedAt: '2024-08-10T12:00:00',
      status: 'active'
    },
    {
      id: 'q_006',
      title: '복용 중인 약물명과 복용 이유를 적어주세요',
      type: 'text',
      required: true,
      category: 'basic_info',
      order: 4,
      validation: {
        minLength: 5,
        maxLength: 200
      },
      createdAt: '2024-08-10T12:00:00',
      updatedAt: '2024-08-10T12:00:00',
      status: 'draft'
    }
  ]);

  const getTypeLabel = (type: Question['type']) => {
    const typeLabels = {
      'multiple_choice': '다중 선택',
      'single_choice': '단일 선택',
      'text': '텍스트',
      'scale': '척도',
      'yes_no': '예/아니오'
    };
    return typeLabels[type];
  };

  const getTypeColor = (type: Question['type']) => {
    const typeColors = {
      'multiple_choice': 'bg-primary-100 text-primary-700',
      'single_choice': 'bg-accent-100 text-accent-700',
      'text': 'bg-secondary-100 text-secondary-700',
      'scale': 'bg-logo-point/20 text-logo-main',
      'yes_no': 'bg-background-200 text-secondary-600'
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
      'logo': 'bg-logo-point/20 text-logo-main border-logo-point/30'
    };
    return colorMap[category.color as keyof typeof colorMap] || 'bg-background-200 text-secondary-600';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '기타';
  };

  const getStatusColor = (status: Question['status']) => {
    const statusColors = {
      'active': 'bg-accent text-white',
      'inactive': 'bg-background-400 text-white',
      'draft': 'bg-secondary-400 text-white'
    };
    return statusColors[status];
  };

  const getStatusText = (status: Question['status']) => {
    const statusTexts = {
      'active': '활성',
      'inactive': '비활성',
      'draft': '초안'
    };
    return statusTexts[status];
  };

  const filteredQuestions = questions.filter(question => {
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (question.description && question.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => a.order - b.order);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return questions.length;
    return questions.filter(q => q.category === categoryId).length;
  };

  const openQuestionModal = (question?: Question) => {
    if (question) {
      setSelectedQuestion(question);
      setIsEditing(true);
    } else {
      setSelectedQuestion({
        id: '',
        title: '',
        description: '',
        type: 'single_choice',
        required: false,
        category: categories[0]?.id || '',
        order: questions.length + 1,
        options: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      });
      setIsEditing(false);
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = () => {
    if (!selectedQuestion) return;

    if (isEditing) {
      setQuestions(prev => prev.map(q => 
        q.id === selectedQuestion.id 
          ? { ...selectedQuestion, updatedAt: new Date().toISOString() }
          : q
      ));
    } else {
      const newQuestion = {
        ...selectedQuestion,
        id: `q_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setQuestions(prev => [...prev, newQuestion]);
    }
    
    setShowQuestionModal(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('이 문항을 삭제하시겠습니까?')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const handleStatusChange = (questionId: string, newStatus: Question['status']) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, status: newStatus, updatedAt: new Date().toISOString() }
        : q
    ));
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
                <span className="mr-3 text-2xl">📝</span>
                설문 문항 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                내담자 진단을 위한 설문 문항을 생성하고 편집할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{questions.filter(q => q.status === 'active').length}</div>
                  <div className="text-xs text-secondary-400">활성 문항</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{questions.filter(q => q.status === 'draft').length}</div>
                  <div className="text-xs text-secondary-400">초안</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{categories.length}</div>
                  <div className="text-xs text-secondary-400">카테고리</div>
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
                  <input
                    type="text"
                    placeholder="문항 제목이나 설명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                    검색
                  </button>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-secondary-400 text-white px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2"
                  >
                    <span>🏷️</span>
                    <span>카테고리 관리</span>
                  </button>
                  <button
                    onClick={() => openQuestionModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>문항 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 카테고리 필터 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'text-secondary-600 hover:bg-background-100'
                  }`}
                >
                  <span>전체</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedCategory === 'all'
                      ? 'bg-white text-primary'
                      : 'bg-background-200 text-secondary-500'
                  }`}>
                    {getCategoryCount('all')}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCategory === category.id
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {getCategoryCount(category.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 문항 목록 */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption font-mono">
                            #{question.order}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium border ${getCategoryColor(question.category)}`}>
                            {getCategoryName(question.category)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getTypeColor(question.type)}`}>
                            {getTypeLabel(question.type)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(question.status)}`}>
                            {getStatusText(question.status)}
                          </span>
                          {question.required && (
                            <span className="bg-error-100 text-error-700 px-2 py-1 rounded text-xs font-medium">
                              필수
                            </span>
                          )}
                          {question.logicRules && question.logicRules.length > 0 && (
                            <span className="bg-logo-point/20 text-logo-main px-2 py-1 rounded text-xs font-medium">
                              분기 {question.logicRules.length}개
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-h4 font-semibold text-secondary mb-2">{question.title}</h3>
                      {question.description && (
                        <p className="text-caption text-secondary-500 mb-3">{question.description}</p>
                      )}
                      
                      {/* 선택지 미리보기 */}
                      {question.options && question.options.length > 0 && (
                        <div className="bg-background-50 p-3 rounded-lg">
                          <div className="text-caption text-secondary-600 mb-2">선택지 ({question.options.length}개)</div>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.slice(0, 4).map((option, index) => (
                              <div key={option.id} className="text-caption text-secondary-700 flex items-center">
                                <span className="w-4 h-4 bg-background-200 rounded-full mr-2 flex-shrink-0"></span>
                                {option.text}
                              </div>
                            ))}
                            {question.options.length > 4 && (
                              <div className="text-caption text-secondary-400 col-span-2">
                                ... 외 {question.options.length - 4}개
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 유효성 검사 규칙 */}
                      {question.validation && (
                        <div className="bg-primary-50 p-3 rounded-lg mt-3">
                          <div className="text-caption text-primary-600 mb-1">유효성 검사</div>
                          <div className="text-caption text-primary-700">
                            {question.validation.minLength && `최소 ${question.validation.minLength}자`}
                            {question.validation.maxLength && ` / 최대 ${question.validation.maxLength}자`}
                            {question.validation.min && `최솟값 ${question.validation.min}`}
                            {question.validation.max && ` / 최댓값 ${question.validation.max}`}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>생성: {new Date(question.createdAt).toLocaleDateString('ko-KR')}</div>
                      <div>수정: {new Date(question.updatedAt).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <div className="flex items-center space-x-2">
                      {question.logicRules && question.logicRules.length > 0 && (
                        <button
                          onClick={() => router.push(`/admin/cms/logic?question=${question.id}`)}
                          className="bg-logo-point/10 text-logo-main px-3 py-2 rounded-lg text-caption font-medium hover:bg-logo-point/20 transition-colors flex items-center space-x-1"
                        >
                          <span>🔀</span>
                          <span>분기 로직</span>
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {question.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(question.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}
                      
                      {question.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(question.id, 'inactive')}
                          className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                        >
                          비활성화
                        </button>
                      )}

                      {question.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(question.id, 'active')}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          활성화
                        </button>
                      )}

                      <button
                        onClick={() => openQuestionModal(question)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        편집
                      </button>
                      
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
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
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '설문 문항이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400 mb-4">
                  {searchQuery ? '다른 검색어를 입력해보세요' : '첫 번째 설문 문항을 추가해보세요'}
                </p>
                <button
                  onClick={() => openQuestionModal()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  문항 추가하기
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 문항 편집 모달 */}
      {showQuestionModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {isEditing ? '문항 편집' : '새 문항 추가'}
                </h3>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      문항 제목 *
                    </label>
                    <input
                      type="text"
                      value={selectedQuestion.title}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, title: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="문항 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      문항 유형 *
                    </label>
                    <select
                      value={selectedQuestion.type}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, type: e.target.value as Question['type']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="single_choice">단일 선택</option>
                      <option value="multiple_choice">다중 선택</option>
                      <option value="text">텍스트</option>
                      <option value="scale">척도</option>
                      <option value="yes_no">예/아니오</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    문항 설명
                  </label>
                  <textarea
                    value={selectedQuestion.description}
                    onChange={(e) => setSelectedQuestion({...selectedQuestion, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="문항에 대한 추가 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      카테고리 *
                    </label>
                    <select
                      value={selectedQuestion.category}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, category: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      순서
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQuestion.order}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      상태
                    </label>
                    <select
                      value={selectedQuestion.status}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, status: e.target.value as Question['status']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="draft">초안</option>
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedQuestion.required}
                    onChange={(e) => setSelectedQuestion({...selectedQuestion, required: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="required" className="text-caption text-secondary-600">
                    필수 문항으로 설정
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  {isEditing ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsManagementPage;
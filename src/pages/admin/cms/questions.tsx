import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { surveyService, PsychTest, PsychQuestion, CreateQuestionRequest, UpdateQuestionRequest } from '@/services/survey';

interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
}

const QuestionsManagementPage: React.FC = () => {
  const router = useRouter();
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<PsychQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 데이터 상태
  const [psychTests, setPsychTests] = useState<PsychTest[]>([]);
  const [questions, setQuestions] = useState<PsychQuestion[]>([]);

  // 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [testsData, questionsData] = await Promise.all([
          surveyService.getAllPsychTests(),
          surveyService.getAllPsychQuestions()
        ]);

        console.log('받은 문항 데이터:', questionsData);
        setPsychTests(testsData);
        setQuestions(questionsData);
        
        // 첫 번째 테스트를 기본 선택 (있는 경우)
        if (testsData.length > 0) {
          setSelectedTestId(testsData[0].id);
        }
      } catch (err: any) {
        console.error('데이터 로딩 실패:', err);
        setError(err.message || '데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 선택된 테스트의 문항만 필터링
  useEffect(() => {
    if (selectedTestId) {
      const loadTestQuestions = async () => {
        try {
          const questionsData = await surveyService.getAllPsychQuestions(selectedTestId);
          setQuestions(questionsData);
        } catch (err: any) {
          console.error('문항 로딩 실패:', err);
          setError(err.message || '문항을 불러올 수 없습니다.');
        }
      };

      loadTestQuestions();
    }
  }, [selectedTestId]);

  const getTypeLabel = (type: PsychQuestion['questionType']) => {
    const typeLabels = {
      'multiple_choice': '다중 선택',
      'text': '텍스트',
      'scale': '척도',
      'yes_no': '예/아니오'
    };
    return typeLabels[type];
  };

  const getTypeColor = (type: PsychQuestion['questionType']) => {
    const typeColors = {
      'multiple_choice': 'bg-primary-100 text-primary-700',
      'text': 'bg-secondary-100 text-secondary-700',
      'scale': 'bg-logo-point/20 text-logo-main',
      'yes_no': 'bg-background-200 text-secondary-600'
    };
    return typeColors[type];
  };

  const getTestName = (testId: number) => {
    const test = psychTests.find(test => test.id === testId);
    return test?.title || '알 수 없음';
  };

  const getTestColor = () => {
    return 'bg-primary-100 text-primary-700 border-primary-200';
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (question.helpText && question.helpText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  }).sort((a, b) => a.questionOrder - b.questionOrder);

  const openQuestionModal = (question?: PsychQuestion) => {
    if (question) {
      console.log('편집할 문항 데이터:', question);
      console.log('isRequired:', question.isRequired);
      console.log('helpText:', question.helpText);
      console.log('questionOrder:', question.questionOrder);
      setSelectedQuestion(question);
      setIsEditing(true);
    } else {
      // 설문 테스트가 선택되지 않은 경우 첫 번째 테스트를 기본으로 선택
      const defaultTestId = selectedTestId || (psychTests.length > 0 ? psychTests[0].id : null);
      
      if (!defaultTestId) {
        alert('사용 가능한 설문 테스트가 없습니다. 먼저 설문 테스트를 생성해주세요.');
        return;
      }
      
      // 선택된 테스트가 없었다면 기본 테스트로 설정
      if (!selectedTestId && defaultTestId) {
        setSelectedTestId(defaultTestId);
      }
      
      setSelectedQuestion({
        id: 0,
        testId: defaultTestId,
        question: '',
        questionOrder: questions.length + 1,
        questionType: 'multiple_choice',
        options: [],
        isRequired: false,
        helpText: '',
        createdAt: new Date().toISOString()
      });
      setIsEditing(false);
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      setLoading(true);
      
      if (isEditing) {
        const updatedQuestion = await surveyService.updatePsychQuestion(selectedQuestion.id, {
          question: selectedQuestion.question,
          questionType: selectedQuestion.questionType,
          questionOrder: selectedQuestion.questionOrder,
          options: selectedQuestion.options,
          isRequired: selectedQuestion.isRequired,
          helpText: selectedQuestion.helpText
        });
        
        setQuestions(prev => prev.map(q => 
          q.id === selectedQuestion.id ? updatedQuestion : q
        ));
      } else {
        const newQuestion = await surveyService.createPsychQuestion({
          testId: selectedQuestion.testId,
          question: selectedQuestion.question,
          questionType: selectedQuestion.questionType,
          questionOrder: selectedQuestion.questionOrder,
          options: selectedQuestion.options,
          isRequired: selectedQuestion.isRequired,
          helpText: selectedQuestion.helpText
        });
        
        setQuestions(prev => [...prev, newQuestion]);
      }
      
      setShowQuestionModal(false);
      setSelectedQuestion(null);
    } catch (err: any) {
      console.error('문항 저장 실패:', err);
      setError(err.message || '문항을 저장할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('이 문항을 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      await surveyService.deletePsychQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err: any) {
      console.error('문항 삭제 실패:', err);
      setError(err.message || '문항을 삭제할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="super_admin" 
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
                  <div className="text-h4 font-bold text-accent">{questions.length}</div>
                  <div className="text-xs text-secondary-400">전체 문항</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{questions.filter(q => q.isRequired).length}</div>
                  <div className="text-xs text-secondary-400">필수 문항</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{psychTests.length}</div>
                  <div className="text-xs text-secondary-400">설문 테스트</div>
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
                    onClick={() => openQuestionModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>문항 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 설문 테스트 선택 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedTestId(null)}
                  className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    selectedTestId === null
                      ? 'bg-primary text-white'
                      : 'text-secondary-600 hover:bg-background-100'
                  }`}
                >
                  <span>전체</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedTestId === null
                      ? 'bg-white text-primary'
                      : 'bg-background-200 text-secondary-500'
                  }`}>
                    {questions.length}
                  </span>
                </button>
                {psychTests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => setSelectedTestId(test.id)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                      selectedTestId === test.id
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{test.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedTestId === test.id
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {questions.filter(q => q.testId === test.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 문항 목록 */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption font-mono">
                            #{question.questionOrder}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium border ${getTestColor()}`}>
                            {getTestName(question.testId)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getTypeColor(question.questionType)}`}>
                            {getTypeLabel(question.questionType)}
                          </span>
                          {question.isRequired && (
                            <span className="bg-error-100 text-error-700 px-2 py-1 rounded text-xs font-medium">
                              필수
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-h4 font-semibold text-secondary mb-2">{question.question}</h3>
                      {question.helpText && (
                        <p className="text-caption text-secondary-500 mb-3">{question.helpText}</p>
                      )}
                      
                      {/* 선택지 미리보기 */}
                      {question.options && question.options.length > 0 && (
                        <div className="bg-background-50 p-3 rounded-lg">
                          <div className="text-caption text-secondary-600 mb-2">선택지 ({question.options.length}개)</div>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.slice(0, 4).map((option, index) => (
                              <div key={index} className="text-caption text-secondary-700 flex items-center">
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

                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>생성: {new Date(question.createdAt).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-end pt-4 border-t border-background-200">
                    <div className="flex space-x-2">
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
                      value={selectedQuestion.question}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, question: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="문항 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      문항 유형 *
                    </label>
                    <select
                      value={selectedQuestion.questionType}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, questionType: e.target.value as PsychQuestion['questionType']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="multiple_choice">다중 선택</option>
                      <option value="text">텍스트</option>
                      <option value="scale">척도</option>
                      <option value="yes_no">예/아니오</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    도움말 텍스트
                  </label>
                  <textarea
                    value={selectedQuestion.helpText || ''}
                    onChange={(e) => setSelectedQuestion({...selectedQuestion, helpText: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="문항에 대한 추가 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      설문 테스트
                    </label>
                    <select
                      value={selectedQuestion.testId}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, testId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      disabled={isEditing} // 편집 시에는 테스트 변경 불가
                    >
                      {psychTests.map(test => (
                        <option key={test.id} value={test.id}>{test.title}</option>
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
                      value={selectedQuestion.questionOrder}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, questionOrder: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedQuestion.isRequired}
                    onChange={(e) => setSelectedQuestion({...selectedQuestion, isRequired: e.target.checked})}
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
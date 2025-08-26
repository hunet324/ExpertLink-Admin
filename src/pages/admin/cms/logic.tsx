import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { logicService, LogicRule, CreateLogicRuleRequest, UpdateLogicRuleRequest } from '@/services/logic';
import { surveyService, PsychTest, PsychQuestion } from '@/services/survey';

const LogicManagementPage: React.FC = () => {
  const router = useRouter();
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogicRule, setSelectedLogicRule] = useState<LogicRule | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // 데이터 상태
  const [psychTests, setPsychTests] = useState<PsychTest[]>([]);
  const [questions, setQuestions] = useState<PsychQuestion[]>([]);
  const [logicRules, setLogicRules] = useState<LogicRule[]>([]);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // 설문 테스트 목록 조회
        const testsData = await surveyService.getAllPsychTests();
        setPsychTests(testsData);
        
        // 첫 번째 테스트 자동 선택
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

  // 선택된 테스트의 문항 및 분기 로직 로딩
  useEffect(() => {
    if (selectedTestId) {
      const loadTestData = async () => {
        try {
          // 문항 조회
          const questionsData = await surveyService.getAllPsychQuestions(selectedTestId);
          setQuestions(questionsData);
          
          // 분기 로직 조회
          const rulesData = await logicService.getAllLogicRules(selectedTestId);
          setLogicRules(rulesData);
        } catch (err: any) {
          console.error('테스트 데이터 로딩 실패:', err);
          setError(err.message || '테스트 데이터를 불러올 수 없습니다.');
        }
      };

      loadTestData();
    }
  }, [selectedTestId]);

  // URL 파라미터에서 문항 ID 가져오기
  useEffect(() => {
    if (router.query.question) {
      setSelectedQuestionId(parseInt(router.query.question as string));
    }
  }, [router.query]);

  const getQuestionTitle = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.question : '알 수 없는 문항';
  };

  const getConditionText = (condition: LogicRule['condition']) => {
    switch (condition.type) {
      case 'equals':
        return `= ${condition.value}`;
      case 'not_equals':
        return `≠ ${condition.value}`;
      case 'greater_than':
        return `> ${condition.value}`;
      case 'less_than':
        return `< ${condition.value}`;
      case 'contains':
        return `포함: ${condition.value}`;
      case 'in_range':
        return Array.isArray(condition.value) 
          ? `포함: ${condition.value.join(', ')}`
          : `범위: ${(condition.value as any).min} ~ ${(condition.value as any).max}`;
      default:
        return String(condition.value);
    }
  };

  const getActionText = (action: LogicRule['action']) => {
    switch (action.type) {
      case 'show_question':
        return `문항 표시: ${getQuestionTitle(action.targetQuestionId!)}`;
      case 'hide_question':
        return `문항 숨김: ${getQuestionTitle(action.targetQuestionId!)}`;
      case 'jump_to_question':
        return `문항 이동: ${getQuestionTitle(action.targetQuestionId!)}`;
      case 'end_survey':
        return '설문 종료';
      case 'show_message':
        return `메시지 표시: ${action.message}`;
      default:
        return '알 수 없는 액션';
    }
  };

  const filteredRules = logicRules.filter(rule => {
    const matchesQuestion = !selectedQuestionId || rule.sourceQuestionId === selectedQuestionId;
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (rule.description && rule.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuestion && matchesSearch;
  }).sort((a, b) => a.priority - b.priority);

  const openRuleModal = (rule?: LogicRule) => {
    if (rule) {
      setSelectedLogicRule(rule);
      setIsEditing(true);
    } else {
      if (!selectedTestId) {
        alert('먼저 설문 테스트를 선택해주세요.');
        return;
      }
      
      setSelectedLogicRule({
        id: 0,
        testId: selectedTestId,
        name: '',
        description: '',
        sourceQuestionId: selectedQuestionId || (questions[0]?.id || 0),
        condition: {
          type: 'equals',
          value: ''
        },
        action: {
          type: 'show_question',
          targetQuestionId: undefined
        },
        priority: logicRules.length + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    }
    setShowRuleModal(true);
  };

  const handleSaveRule = async () => {
    if (!selectedLogicRule || !selectedTestId) return;

    try {
      setLoading(true);
      
      if (isEditing && selectedLogicRule.id) {
        // 수정
        const updateData: UpdateLogicRuleRequest = {
          name: selectedLogicRule.name,
          description: selectedLogicRule.description,
          sourceQuestionId: selectedLogicRule.sourceQuestionId,
          condition: selectedLogicRule.condition,
          action: selectedLogicRule.action,
          priority: selectedLogicRule.priority,
          isActive: selectedLogicRule.isActive
        };
        
        const updatedRule = await logicService.updateLogicRule(selectedLogicRule.id, updateData);
        setLogicRules(prev => prev.map(rule => 
          rule.id === selectedLogicRule.id ? updatedRule : rule
        ));
      } else {
        // 생성
        const createData: CreateLogicRuleRequest = {
          testId: selectedTestId,
          name: selectedLogicRule.name,
          description: selectedLogicRule.description,
          sourceQuestionId: selectedLogicRule.sourceQuestionId,
          condition: selectedLogicRule.condition,
          action: selectedLogicRule.action,
          priority: selectedLogicRule.priority,
          isActive: selectedLogicRule.isActive
        };
        
        const newRule = await logicService.createLogicRule(createData);
        setLogicRules(prev => [...prev, newRule]);
      }
      
      setShowRuleModal(false);
      setSelectedLogicRule(null);
    } catch (err: any) {
      console.error('분기 로직 저장 실패:', err);
      setError(err.message || '분기 로직을 저장할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('이 분기 로직을 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      await logicService.deleteLogicRule(ruleId);
      setLogicRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err: any) {
      console.error('분기 로직 삭제 실패:', err);
      setError(err.message || '분기 로직을 삭제할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ruleId: number) => {
    try {
      console.log('=== 상태 토글 요청 ===');
      console.log('ruleId:', ruleId, 'type:', typeof ruleId);
      
      const updatedRule = await logicService.toggleLogicRuleStatus(ruleId);
      console.log('토글 성공:', updatedRule);
      console.log('토글 전후 상태:', { 
        before: logicRules.find(r => r.id === ruleId)?.isActive, 
        after: updatedRule.isActive 
      });
      
      setLogicRules(prev => prev.map(rule => 
        rule.id === ruleId ? updatedRule : rule
      ));
    } catch (err: any) {
      console.error('분기 로직 상태 변경 실패:', err);
      console.error('에러 상세:', err.response?.data);
      setError(err.message || '분기 로직 상태를 변경할 수 없습니다.');
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
                <span className="mr-3 text-2xl">🔀</span>
                분기 로직 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                설문 답변에 따라 다음 문항을 제어하는 조건부 로직을 관리합니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{logicRules.filter(rule => rule.isActive).length}</div>
                  <div className="text-xs text-secondary-400">활성 규칙</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{logicRules.filter(rule => !rule.isActive).length}</div>
                  <div className="text-xs text-secondary-400">비활성</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{logicRules.length}</div>
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
            {/* 설문 테스트 선택 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2 overflow-x-auto">
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
                      {logicRules.filter(r => r.testId === test.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 검색바 및 액션 버튼 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="규칙 이름이나 설명으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedQuestionId || ''}
                      onChange={(e) => setSelectedQuestionId(e.target.value ? parseInt(e.target.value) : null)}
                      className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">모든 문항</option>
                      {questions.map(question => (
                        <option key={question.id} value={question.id}>
                          #{question.questionOrder}. {question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                    검색
                  </button>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openRuleModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>규칙 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 분기 로직 플로우 시각화 */}
            {selectedQuestionId && (
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  선택된 문항: {getQuestionTitle(selectedQuestionId)}
                </h3>
                <div className="bg-background-50 p-4 rounded-lg">
                  <div className="text-caption text-secondary-600 mb-2">
                    이 문항에 연결된 분기 규칙: {filteredRules.filter(rule => rule.sourceQuestionId === selectedQuestionId).length}개
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredRules.filter(rule => rule.sourceQuestionId === selectedQuestionId).map(rule => (
                      <span
                        key={rule.id}
                        className={`px-3 py-1 rounded-full text-caption font-medium ${
                          rule.isActive 
                            ? 'bg-accent text-white'
                            : 'bg-background-200 text-secondary-500'
                        }`}
                      >
                        {rule.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 분기 규칙 목록 */}
          <div className="space-y-4">
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-h4 font-semibold text-secondary">{rule.name}</h3>
                        <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption font-mono">
                          우선순위 #{rule.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${
                          rule.isActive 
                            ? 'bg-accent text-white'
                            : 'bg-background-400 text-white'
                        }`}>
                          {rule.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-caption text-secondary-500 mb-3">{rule.description}</p>
                      )}
                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>생성: {new Date(rule.createdAt).toLocaleDateString('ko-KR')}</div>
                      <div>수정: {new Date(rule.updatedAt).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>

                  {/* 로직 플로우 */}
                  <div className="bg-background-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center space-x-4">
                      {/* 소스 문항 */}
                      <div className="flex-1">
                        <div className="text-caption text-secondary-600 mb-1">소스 문항</div>
                        <div className="bg-primary-100 text-primary-700 p-3 rounded-lg border-l-4 border-primary">
                          <div className="text-caption font-medium">#{questions.find(q => q.id === rule.sourceQuestionId)?.questionOrder || '?'}</div>
                          <div className="text-body">{getQuestionTitle(rule.sourceQuestionId)}</div>
                        </div>
                      </div>

                      {/* 조건 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">→</span>
                        <div className="bg-secondary-100 text-secondary-700 px-3 py-2 rounded-lg border">
                          <div className="text-caption">조건</div>
                          <div className="text-body font-mono">{getConditionText(rule.condition)}</div>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>

                      {/* 액션 */}
                      <div className="flex-1">
                        <div className="text-caption text-secondary-600 mb-1">실행 액션</div>
                        <div className="bg-accent-100 text-accent-700 p-3 rounded-lg border-l-4 border-accent">
                          <div className="text-body">{getActionText(rule.action)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(rule.id)}
                        className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors ${
                          rule.isActive
                            ? 'bg-background-200 text-secondary-600 hover:bg-background-300'
                            : 'bg-accent text-white hover:bg-accent-600'
                        }`}
                      >
                        {rule.isActive ? '비활성화' : '활성화'}
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openRuleModal(rule)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        편집
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
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
                <span className="text-6xl mb-4 block">🔀</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {searchQuery || selectedQuestionId ? '검색 결과가 없습니다' : '분기 로직이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400 mb-4">
                  {searchQuery || selectedQuestionId ? '검색 조건을 변경해보세요' : '첫 번째 분기 로직을 추가해보세요'}
                </p>
                <button
                  onClick={() => openRuleModal()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  분기 로직 추가하기
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 분기 로직 편집 모달 */}
      {showRuleModal && selectedLogicRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {isEditing ? '분기 로직 편집' : '새 분기 로직 추가'}
                </h3>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    규칙 이름 *
                  </label>
                  <input
                    type="text"
                    value={selectedLogicRule.name}
                    onChange={(e) => setSelectedLogicRule({...selectedLogicRule, name: e.target.value})}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="규칙 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    규칙 설명
                  </label>
                  <textarea
                    value={selectedLogicRule.description}
                    onChange={(e) => setSelectedLogicRule({...selectedLogicRule, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="이 규칙에 대한 설명을 입력하세요"
                  />
                </div>

                {/* 조건 설정 */}
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="text-body font-semibold text-primary-700 mb-4">조건 설정</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        소스 문항 *
                      </label>
                      <select
                        value={selectedLogicRule.sourceQuestionId}
                        onChange={(e) => setSelectedLogicRule({...selectedLogicRule, sourceQuestionId: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        {questions.map(question => (
                          <option key={question.id} value={question.id}>
                            #{question.questionOrder}. {question.question}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        조건 타입 *
                      </label>
                      <select
                        value={selectedLogicRule.condition.type}
                        onChange={(e) => setSelectedLogicRule({
                          ...selectedLogicRule, 
                          condition: { ...selectedLogicRule.condition, type: e.target.value as LogicRule['condition']['type'] }
                        })}
                        className="w-full px-3 py-2 border >border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="equals">같음 (=)</option>
                        <option value="not_equals">다름 (≠)</option>
                        <option value="greater_than">초과 (&gt;)</option>
                        <option value="less_than">미만 (&lt;)</option>
                        <option value="contains">포함</option>
                        <option value="in_range">범위 포함</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      조건 값 *
                    </label>
                    <input
                      type="text"
                      value={String(selectedLogicRule.condition.value)}
                      onChange={(e) => setSelectedLogicRule({
                        ...selectedLogicRule,
                        condition: { ...selectedLogicRule.condition, value: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="조건 값을 입력하세요 (예: yes, 3, 10s,20s)"
                    />
                    <p className="text-xs text-secondary-400 mt-1">
                      여러 값은 쉼표로 구분하세요 (예: option1,option2)
                    </p>
                  </div>
                </div>

                {/* 액션 설정 */}
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h4 className="text-body font-semibold text-accent-700 mb-4">액션 설정</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        액션 타입 *
                      </label>
                      <select
                        value={selectedLogicRule.action.type}
                        onChange={(e) => setSelectedLogicRule({
                          ...selectedLogicRule,
                          action: { ...selectedLogicRule.action, type: e.target.value as LogicRule['action']['type'] }
                        })}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="show_question">문항 표시</option>
                        <option value="hide_question">문항 숨김</option>
                        <option value="jump_to_question">문항 이동</option>
                        <option value="end_survey">설문 종료</option>
                        <option value="show_message">메시지 표시</option>
                      </select>
                    </div>
                    {['show_question', 'hide_question', 'jump_to_question'].includes(selectedLogicRule.action.type) && (
                      <div>
                        <label className="block text-caption font-medium text-secondary-600 mb-2">
                          대상 문항 *
                        </label>
                        <select
                          value={selectedLogicRule.action.targetQuestionId || ''}
                          onChange={(e) => setSelectedLogicRule({
                            ...selectedLogicRule,
                            action: { ...selectedLogicRule.action, targetQuestionId: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                        >
                          <option value="">문항을 선택하세요</option>
                          {questions.map(question => (
                            <option key={question.id} value={question.id}>
                              #{question.questionOrder}. {question.question}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {selectedLogicRule.action.type === 'show_message' && (
                    <div className="mt-4">
                      <label className="block text-caption font-medium text-secondary-600 mb-2">
                        메시지 내용 *
                      </label>
                      <textarea
                        value={selectedLogicRule.action.message || ''}
                        onChange={(e) => setSelectedLogicRule({
                          ...selectedLogicRule,
                          action: { ...selectedLogicRule.action, message: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        placeholder="표시할 메시지를 입력하세요"
                      />
                    </div>
                  )}
                </div>

                {/* 기타 설정 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      우선순위
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedLogicRule.priority}
                      onChange={(e) => setSelectedLogicRule({...selectedLogicRule, priority: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={selectedLogicRule.isActive}
                      onChange={(e) => setSelectedLogicRule({...selectedLogicRule, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-caption text-secondary-600">
                      규칙 활성화
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveRule}
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

export default LogicManagementPage;
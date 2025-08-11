import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';

interface AssessmentResult {
  id: string;
  clientId: string;
  clientName: string;
  assessmentName: string;
  assessmentDate: string;
  score: number;
  maxScore: number;
  percentile?: number;
  interpretation: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  rawScores?: {
    subscale: string;
    score: number;
    interpretation: string;
  }[];
  hasReport: boolean;
  feedbackStatus: 'pending' | 'draft' | 'completed';
  expertNotes?: string;
}

const AssessmentResultsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // 검사 결과 샘플 데이터
  const assessmentResults: AssessmentResult[] = [
    {
      id: '1',
      clientId: '1',
      clientName: '김민수',
      assessmentName: 'GAD-7 (범불안장애 척도)',
      assessmentDate: '2024-08-01',
      score: 12,
      maxScore: 21,
      percentile: 75,
      interpretation: '중간 수준의 불안',
      riskLevel: 'medium',
      recommendations: [
        '인지행동치료 권장',
        '이완 훈련 필요',
        '정기적인 모니터링'
      ],
      rawScores: [
        { subscale: '신체적 증상', score: 6, interpretation: '중간' },
        { subscale: '인지적 증상', score: 6, interpretation: '중간' }
      ],
      hasReport: true,
      feedbackStatus: 'completed',
      expertNotes: '불안 수준이 일상생활에 영향을 주는 정도. 치료적 개입 필요.'
    },
    {
      id: '2',
      clientId: '1',
      clientName: '김민수',
      assessmentName: 'PHQ-9 (우울증 선별도구)',
      assessmentDate: '2024-07-25',
      score: 8,
      maxScore: 27,
      percentile: 60,
      interpretation: '경미한 우울',
      riskLevel: 'low',
      recommendations: [
        '생활습관 개선',
        '사회적 활동 증가',
        '지속적인 관찰'
      ],
      rawScores: [
        { subscale: '핵심 증상', score: 4, interpretation: '경미' },
        { subscale: '신체적 증상', score: 2, interpretation: '낮음' },
        { subscale: '인지적 증상', score: 2, interpretation: '낮음' }
      ],
      hasReport: true,
      feedbackStatus: 'draft'
    },
    {
      id: '3',
      clientId: '2',
      clientName: '이지은',
      assessmentName: 'Beck 우울 척도 (BDI-II)',
      assessmentDate: '2024-08-03',
      score: 18,
      maxScore: 63,
      percentile: 70,
      interpretation: '경미-중간 우울',
      riskLevel: 'medium',
      recommendations: [
        '개인 상담치료 권장',
        '약물치료 상담 고려',
        '가족 지지체계 강화'
      ],
      hasReport: true,
      feedbackStatus: 'pending'
    },
    {
      id: '4',
      clientId: '3',
      clientName: '박준형',
      assessmentName: '직업 스트레스 척도',
      assessmentDate: '2024-07-30',
      score: 85,
      maxScore: 120,
      percentile: 85,
      interpretation: '높은 수준의 직업 스트레스',
      riskLevel: 'high',
      recommendations: [
        '스트레스 관리 프로그램 참여',
        '작업 환경 개선 방안 논의',
        '정신건강 전문가 상담'
      ],
      hasReport: false,
      feedbackStatus: 'pending'
    }
  ];

  const clients = [
    { id: '1', name: '김민수' },
    { id: '2', name: '이지은' },
    { id: '3', name: '박준형' }
  ];

  const assessmentTypes = [
    'GAD-7 (범불안장애 척도)',
    'PHQ-9 (우울증 선별도구)',
    'Beck 우울 척도 (BDI-II)',
    '직업 스트레스 척도',
    'MMPI-2',
    'WAIS-IV'
  ];

  const filteredResults = assessmentResults.filter(result => {
    const matchesClient = selectedClient === '' || result.clientId === selectedClient;
    const matchesAssessment = selectedAssessment === '' || result.assessmentName === selectedAssessment;
    return matchesClient && matchesAssessment;
  }).sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'medium': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'high': return 'bg-error-100 text-error-700 border-error-200';
      default: return 'bg-background-100 text-secondary-600 border-background-200';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
      default: return risk;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent text-white';
      case 'draft': return 'bg-primary-100 text-primary-700';
      case 'pending': return 'bg-background-400 text-secondary-600';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'draft': return '작성중';
      case 'pending': return '대기';
      default: return status;
    }
  };

  const handleViewDetail = (result: AssessmentResult) => {
    setSelectedResult(result);
    setFeedbackText(result.expertNotes || '');
    setViewMode('detail');
  };

  const handleSaveFeedback = () => {
    if (selectedResult) {
      // 피드백 저장 로직
      console.log('Saving feedback for:', selectedResult.id, feedbackText);
      alert('피드백이 저장되었습니다.');
    }
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
              <h1 className="text-2xl font-bold text-secondary">검사 피드백</h1>
              <p className="text-sm text-secondary-400 mt-1">
                {viewMode === 'list' ? 
                  `전체 ${assessmentResults.length}건 중 ${filteredResults.length}건 표시` :
                  '검사 결과 상세보기 및 피드백 작성'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              {viewMode === 'detail' && (
                <button 
                  onClick={() => setViewMode('list')}
                  className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-background-300 transition-colors"
                >
                  ← 목록으로
                </button>
              )}
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                검사 의뢰
              </button>
            </div>
          </div>
        </header>

        {viewMode === 'list' ? (
          <>
            {/* 필터 영역 */}
            <div className="bg-white px-6 py-4 border-b border-background-200">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="border border-background-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">모든 내담자</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                  className="border border-background-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">모든 검사</option>
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <button 
                  onClick={() => {
                    setSelectedClient('');
                    setSelectedAssessment('');
                  }}
                  className="text-sm text-primary hover:text-primary-600 transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>

            {/* 검사 결과 목록 */}
            <main className="flex-1 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="p-6 space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="bg-white rounded-custom shadow-soft overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-secondary">{result.assessmentName}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(result.riskLevel)}`}>
                                위험도: {getRiskText(result.riskLevel)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-secondary-400">
                              <span>{result.clientName}</span>
                              <span>{new Date(result.assessmentDate).toLocaleDateString('ko-KR')}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.feedbackStatus)}`}>
                                피드백: {getStatusText(result.feedbackStatus)}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleViewDetail(result)}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                          >
                            상세보기
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 mb-4">
                          <div className="text-center p-4 bg-background-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">{result.score}</div>
                            <div className="text-sm text-secondary-400">점수</div>
                            <div className="text-xs text-secondary-400">({result.score}/{result.maxScore})</div>
                          </div>
                          {result.percentile && (
                            <div className="text-center p-4 bg-background-50 rounded-lg">
                              <div className="text-2xl font-bold text-accent">{result.percentile}%</div>
                              <div className="text-sm text-secondary-400">백분위</div>
                            </div>
                          )}
                          <div className="text-center p-4 bg-background-50 rounded-lg">
                            <div className="text-sm font-medium text-secondary-700">{result.interpretation}</div>
                            <div className="text-xs text-secondary-400">해석</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-secondary-700 mb-2">권장사항</h4>
                          <ul className="space-y-1">
                            {result.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-secondary-600">
                                <span className="text-accent">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-secondary-600 mb-2">검사 결과가 없습니다</h3>
                  <p className="text-secondary-400 mb-6">
                    필터 조건을 변경하거나 새로운 검사를 의뢰해보세요.
                  </p>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                    검사 의뢰하기
                  </button>
                </div>
              )}
            </main>
          </>
        ) : (
          /* 상세 보기 */
          selectedResult && (
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* 기본 정보 */}
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-secondary mb-2">{selectedResult.assessmentName}</h2>
                      <div className="flex items-center space-x-4 text-sm text-secondary-400">
                        <span>{selectedResult.clientName}</span>
                        <span>{new Date(selectedResult.assessmentDate).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getRiskColor(selectedResult.riskLevel)}`}>
                      위험도: {getRiskText(selectedResult.riskLevel)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-background-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">{selectedResult.score}</div>
                      <div className="text-sm text-secondary-400">총점</div>
                      <div className="text-xs text-secondary-400 mt-1">
                        최대 {selectedResult.maxScore}점
                      </div>
                    </div>
                    {selectedResult.percentile && (
                      <div className="text-center p-6 bg-background-50 rounded-lg">
                        <div className="text-3xl font-bold text-accent mb-2">{selectedResult.percentile}%</div>
                        <div className="text-sm text-secondary-400">백분위</div>
                      </div>
                    )}
                    <div className="text-center p-6 bg-background-50 rounded-lg">
                      <div className="text-lg font-medium text-secondary-700 mb-2">{selectedResult.interpretation}</div>
                      <div className="text-sm text-secondary-400">해석</div>
                    </div>
                    <div className="text-center p-6 bg-background-50 rounded-lg">
                      <div className={`text-lg font-medium mb-2 ${
                        selectedResult.feedbackStatus === 'completed' ? 'text-accent' :
                        selectedResult.feedbackStatus === 'draft' ? 'text-primary' : 'text-secondary-400'
                      }`}>
                        {getStatusText(selectedResult.feedbackStatus)}
                      </div>
                      <div className="text-sm text-secondary-400">피드백 상태</div>
                    </div>
                  </div>
                </div>

                {/* 세부 점수 */}
                {selectedResult.rawScores && (
                  <div className="bg-white rounded-custom shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-secondary mb-4">세부 영역별 점수</h3>
                    <div className="space-y-4">
                      {selectedResult.rawScores.map((subscale, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-background-50 rounded-lg">
                          <span className="font-medium text-secondary-700">{subscale.subscale}</span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary mr-4">{subscale.score}점</span>
                            <span className="text-sm text-secondary-500">{subscale.interpretation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 권장사항 */}
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4">권장사항</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-accent-50 rounded-lg">
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-secondary-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 전문가 피드백 */}
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4">전문가 피드백</h3>
                  <textarea
                    rows={8}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="검사 결과에 대한 전문가 의견과 피드백을 작성해주세요..."
                    className="w-full px-4 py-3 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={handleSaveFeedback}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      피드백 저장
                    </button>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex justify-center space-x-4">
                  <button className="bg-background-200 text-secondary-600 px-6 py-3 rounded-lg font-medium hover:bg-background-300 transition-colors">
                    PDF 리포트 생성
                  </button>
                  <button className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-600 transition-colors">
                    결과 공유
                  </button>
                </div>
              </div>
            </main>
          )
        )}
      </div>
    </div>
  );
};

export default AssessmentResultsPage;
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface AssessmentData {
  id: string;
  clientName: string;
  clientId: string;
  testType: string;
  testDate: string;
  status: 'pending_feedback' | 'completed' | 'sent';
  priority: 'high' | 'medium' | 'low';
  scores: {
    [key: string]: number | string;
  };
  rawData: any;
}

interface FeedbackTemplate {
  id: string;
  name: string;
  sections: {
    title: string;
    content: string;
    editable: boolean;
  }[];
}

const AssessmentFeedbackPage: React.FC = () => {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false);

  // 피드백 대기 중인 검사 결과 샘플 데이터
  const pendingAssessments: AssessmentData[] = [
    {
      id: 'assessment_001',
      clientName: '김**',
      clientId: 'client_003',
      testType: 'MMPI-2',
      testDate: '2024-08-10',
      status: 'pending_feedback',
      priority: 'high',
      scores: {
        'L척도': 45,
        'F척도': 65,
        'K척도': 50,
        '우울': 75,
        '불안': 70
      },
      rawData: {}
    },
    {
      id: 'assessment_002',
      clientName: '박**',
      clientId: 'client_002',
      testType: 'Beck 우울 척도',
      testDate: '2024-08-09',
      status: 'pending_feedback',
      priority: 'medium',
      scores: {
        '총점': 18,
        '심각도': '중간'
      },
      rawData: {}
    },
    {
      id: 'assessment_003',
      clientName: '이**',
      clientId: 'client_001',
      testType: 'SCL-90-R',
      testDate: '2024-08-08',
      status: 'pending_feedback',
      priority: 'low',
      scores: {
        'GSI': 1.2,
        '우울': 1.5,
        '불안': 1.3,
        '대인예민성': 1.1
      },
      rawData: {}
    }
  ];

  // 피드백 템플릿 샘플 데이터
  const feedbackTemplates: FeedbackTemplate[] = [
    {
      id: 'template_mmpi',
      name: 'MMPI-2 기본 템플릿',
      sections: [
        {
          title: '검사 개요',
          content: 'MMPI-2는 성격특성과 정신병리를 종합적으로 평가하는 심리검사입니다.',
          editable: false
        },
        {
          title: '주요 결과',
          content: '[검사 결과를 바탕으로 작성해주세요]',
          editable: true
        },
        {
          title: '해석 및 권고사항',
          content: '[전문가 의견을 작성해주세요]',
          editable: true
        }
      ]
    },
    {
      id: 'template_beck',
      name: 'Beck 우울 척도 템플릿',
      sections: [
        {
          title: '검사 설명',
          content: 'Beck 우울 척도는 우울증상의 정도를 측정하는 자기보고식 검사입니다.',
          editable: false
        },
        {
          title: '결과 해석',
          content: '[점수에 따른 해석을 작성해주세요]',
          editable: true
        },
        {
          title: '치료적 제언',
          content: '[치료 방향성을 제시해주세요]',
          editable: true
        }
      ]
    }
  ];

  const selectedAssessmentData = pendingAssessments.find(a => a.id === selectedAssessment);
  const currentTemplate = feedbackTemplates.find(t => t.id === selectedTemplate);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-50 border-error-200';
      case 'medium': return 'text-primary bg-primary-50 border-primary-200';
      case 'low': return 'text-secondary-400 bg-secondary-50 border-secondary-200';
      default: return 'text-secondary-400 bg-secondary-50 border-secondary-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_feedback': return 'bg-primary text-white';
      case 'completed': return 'bg-accent text-white';
      case 'sent': return 'bg-secondary-400 text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_feedback': return '피드백 대기';
      case 'completed': return '작성 완료';
      case 'sent': return '전송 완료';
      default: return status;
    }
  };

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessment(assessmentId);
    // 기존 피드백이 있다면 로드
    setFeedbackContent('');
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = feedbackTemplates.find(t => t.id === templateId);
    if (template && selectedAssessmentData) {
      // 템플릿을 기반으로 초기 피드백 생성
      let initialContent = `# ${selectedAssessmentData.clientName}님 ${selectedAssessmentData.testType} 검사 피드백\n\n`;
      initialContent += `**검사 일자:** ${selectedAssessmentData.testDate}\n\n`;
      
      template.sections.forEach(section => {
        initialContent += `## ${section.title}\n\n${section.content}\n\n`;
      });
      
      setFeedbackContent(initialContent);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedAssessmentData || !feedbackContent.trim()) {
      alert('선택된 검사와 피드백 내용을 확인해주세요.');
      return;
    }
    
    console.log('임시저장:', {
      assessmentId: selectedAssessmentData.id,
      content: feedbackContent
    });
    
    alert('피드백이 임시저장되었습니다.');
  };

  const handleCompleteFeedback = async () => {
    if (!selectedAssessmentData || !feedbackContent.trim()) {
      alert('선택된 검사와 피드백 내용을 확인해주세요.');
      return;
    }
    
    if (confirm('피드백 작성을 완료하시겠습니까?')) {
      console.log('피드백 완료:', {
        assessmentId: selectedAssessmentData.id,
        content: feedbackContent
      });
      
      alert('피드백이 완료되었습니다.');
      // 목록에서 제거하고 완료 상태로 변경
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedAssessmentData || !feedbackContent.trim()) {
      alert('선택된 검사와 피드백 내용을 확인해주세요.');
      return;
    }
    
    if (confirm('내담자에게 피드백을 전송하시겠습니까?')) {
      console.log('피드백 전송:', {
        assessmentId: selectedAssessmentData.id,
        clientId: selectedAssessmentData.clientId,
        content: feedbackContent
      });
      
      alert('피드백이 내담자에게 전송되었습니다.');
    }
  };

  const formatScores = (scores: { [key: string]: number | string }) => {
    return Object.entries(scores).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1">
        <span className="text-secondary-600">{key}:</span>
        <span className="font-medium text-secondary-700">{value}</span>
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                피드백 작성
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                검사 결과를 바탕으로 전문적인 피드백을 작성하고 전송할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{pendingAssessments.length}</div>
                  <div className="text-xs text-secondary-400">대기중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-error">
                    {pendingAssessments.filter(a => a.priority === 'high').length}
                  </div>
                  <div className="text-xs text-secondary-400">긴급</div>
                </div>
              </div>

              {/* 알림 및 프로필 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">김</span>
                </div>
                <span className="text-body text-secondary-600">김상담사님</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full flex space-x-6">
            {/* 검사 목록 */}
            <div className="w-80 bg-white rounded-custom shadow-soft overflow-hidden">
              <div className="p-4 border-b border-background-200">
                <h3 className="text-h4 font-semibold text-secondary">피드백 대기 목록</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {pendingAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    onClick={() => handleSelectAssessment(assessment.id)}
                    className={`p-4 border-b border-background-100 cursor-pointer transition-colors ${
                      selectedAssessment === assessment.id 
                        ? 'bg-primary-50 border-primary-200' 
                        : 'hover:bg-background-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-body font-semibold text-secondary-700">
                        {assessment.clientName}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(assessment.priority)}`}>
                        {getPriorityText(assessment.priority)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-caption text-secondary-600">
                      <div className="font-medium">{assessment.testType}</div>
                      <div>검사일: {new Date(assessment.testDate).toLocaleDateString('ko-KR')}</div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(assessment.status)}`}>
                        {getStatusText(assessment.status)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {pendingAssessments.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="text-secondary-400 text-caption">피드백 대기 중인 검사가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 피드백 작성 영역 */}
            <div className="flex-1 flex flex-col space-y-6">
              {selectedAssessmentData ? (
                <>
                  {/* 검사 정보 */}
                  <div className="bg-white rounded-custom shadow-soft p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-h4 font-semibold text-secondary">
                        {selectedAssessmentData.clientName}님 - {selectedAssessmentData.testType}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedAssessmentData.priority)}`}>
                          {getPriorityText(selectedAssessmentData.priority)}
                        </span>
                        <button
                          onClick={() => router.push(`/expert/clients/profile?id=${selectedAssessmentData.clientId}`)}
                          className="bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption hover:bg-background-300 transition-colors"
                        >
                          내담자 정보
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-caption text-secondary-400 block mb-2">검사 정보</label>
                        <div className="space-y-1 text-body text-secondary-700">
                          <div>검사명: {selectedAssessmentData.testType}</div>
                          <div>검사일: {new Date(selectedAssessmentData.testDate).toLocaleDateString('ko-KR')}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-caption text-secondary-400 block mb-2">주요 점수</label>
                        <div className="bg-background-50 p-3 rounded-lg text-caption">
                          {formatScores(selectedAssessmentData.scores)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 템플릿 선택 */}
                  <div className="bg-white rounded-custom shadow-soft p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-body font-medium text-secondary">피드백 템플릿</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleSelectTemplate(e.target.value)}
                        className="border border-background-300 rounded-lg px-3 py-2 text-caption focus:outline-none focus:border-primary-300"
                      >
                        <option value="">템플릿 선택</option>
                        {feedbackTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 피드백 작성 */}
                  <div className="bg-white rounded-custom shadow-soft flex-1 flex flex-col">
                    <div className="p-4 border-b border-background-200 flex items-center justify-between">
                      <h3 className="text-h4 font-semibold text-secondary">피드백 작성</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsPreview(!isPreview)}
                          className={`px-3 py-2 rounded-lg text-caption transition-colors ${
                            isPreview 
                              ? 'bg-primary text-white' 
                              : 'bg-background-200 text-secondary-600 hover:bg-background-300'
                          }`}
                        >
                          {isPreview ? '편집' : '미리보기'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4">
                      {isPreview ? (
                        <div className="prose max-w-none text-secondary-700 whitespace-pre-wrap">
                          {feedbackContent || '피드백 내용을 작성해주세요.'}
                        </div>
                      ) : (
                        <textarea
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          placeholder="피드백 내용을 작성해주세요. 마크다운 형식을 사용할 수 있습니다."
                          className="w-full h-full resize-none border-none focus:outline-none text-body p-4 bg-background-25 rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-background-200 flex items-center justify-between">
                      <div className="text-caption text-secondary-400">
                        {feedbackContent.length}자 작성됨
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveDraft}
                          className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                        >
                          임시저장
                        </button>
                        <button
                          onClick={handleCompleteFeedback}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                        >
                          작성완료
                        </button>
                        <button
                          onClick={handleSendFeedback}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          전송하기
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-custom shadow-soft flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">📝</span>
                    <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                      검사를 선택해주세요
                    </h3>
                    <p className="text-caption text-secondary-400">
                      좌측 목록에서 피드백을 작성할 검사를 선택해주세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentFeedbackPage;
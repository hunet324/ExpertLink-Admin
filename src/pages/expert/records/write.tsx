import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';

interface SessionTemplate {
  id: string;
  name: string;
  sections: {
    title: string;
    fields: {
      label: string;
      type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
      options?: string[];
      required?: boolean;
      placeholder?: string;
    }[];
  }[];
}

const RecordWritePage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'chat' | 'voice'>('video');
  const [formData, setFormData] = useState<Record<string, any>>({});

  // 내담자 목록 (샘플)
  const clients = [
    { id: '1', name: '김민수', age: 28 },
    { id: '2', name: '이지은', age: 32 },
    { id: '3', name: '박준형', age: 45 },
    { id: '4', name: '정하린', age: 35 },
  ];

  // 상담 기록 템플릿들
  const templates: SessionTemplate[] = [
    {
      id: 'initial',
      name: '초기 상담 기록',
      sections: [
        {
          title: '기본 정보',
          fields: [
            { label: '상담 일시', type: 'text', required: true, placeholder: 'YYYY-MM-DD HH:MM' },
            { label: '상담 시간 (분)', type: 'number', required: true, placeholder: '60' },
            { label: '상담 장소/방식', type: 'select', options: ['화상 상담', '채팅 상담', '음성 상담'], required: true },
          ]
        },
        {
          title: '주호소 및 증상',
          fields: [
            { label: '주호소 문제', type: 'textarea', required: true, placeholder: '내담자가 호소하는 주요 문제점을 기술하세요...' },
            { label: '현재 증상', type: 'textarea', placeholder: '관찰된 증상들을 구체적으로 기술하세요...' },
            { label: '증상 지속 기간', type: 'text', placeholder: '예: 3개월 전부터' },
            { label: '증상 심각도', type: 'radio', options: ['경미', '보통', '심각', '매우 심각'], required: true },
          ]
        },
        {
          title: '상담 내용',
          fields: [
            { label: '상담 진행 과정', type: 'textarea', required: true, placeholder: '상담이 어떻게 진행되었는지 시간순으로 기술하세요...' },
            { label: '사용된 기법', type: 'checkbox', options: ['인지행동치료', '정신분석', '해결중심치료', '게슈탈트치료', '기타'] },
            { label: '내담자 반응', type: 'textarea', placeholder: '상담에 대한 내담자의 반응과 참여도를 기술하세요...' },
          ]
        },
        {
          title: '평가 및 계획',
          fields: [
            { label: '상담 목표', type: 'textarea', required: true, placeholder: '이번 상담을 통해 달성하고자 한 목표...' },
            { label: '진전 사항', type: 'textarea', placeholder: '이전 상담 대비 개선된 점이나 변화...' },
            { label: '다음 상담 계획', type: 'textarea', required: true, placeholder: '다음 회기에서 다룰 내용이나 방향...' },
            { label: '과제 및 권고사항', type: 'textarea', placeholder: '내담자에게 제안한 과제나 권고사항...' },
          ]
        }
      ]
    },
    {
      id: 'follow_up',
      name: '후속 상담 기록',
      sections: [
        {
          title: '기본 정보',
          fields: [
            { label: '상담 일시', type: 'text', required: true, placeholder: 'YYYY-MM-DD HH:MM' },
            { label: '상담 시간 (분)', type: 'number', required: true, placeholder: '60' },
            { label: '회기 번호', type: 'number', required: true, placeholder: '2' },
          ]
        },
        {
          title: '전회 과제 확인',
          fields: [
            { label: '과제 수행 여부', type: 'radio', options: ['완전 수행', '부분 수행', '미수행'], required: true },
            { label: '과제 수행 결과', type: 'textarea', placeholder: '과제를 통해 얻은 결과나 느낀 점...' },
            { label: '어려웠던 점', type: 'textarea', placeholder: '과제 수행 중 어려웠던 점이나 장애 요소...' },
          ]
        },
        {
          title: '현재 상태',
          fields: [
            { label: '증상 변화', type: 'textarea', required: true, placeholder: '지난 회기 이후 증상의 변화...' },
            { label: '기분 상태', type: 'radio', options: ['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨'], required: true },
            { label: '일상 기능', type: 'radio', options: ['정상', '약간 저하', '중간 저하', '심한 저하'], required: true },
          ]
        },
        {
          title: '이번 회기 진행',
          fields: [
            { label: '주요 다룬 내용', type: 'textarea', required: true, placeholder: '이번 상담에서 주로 다룬 주제나 내용...' },
            { label: '내담자 통찰', type: 'textarea', placeholder: '내담자가 스스로 깨달은 점이나 통찰...' },
            { label: '치료적 개입', type: 'textarea', placeholder: '상담자가 사용한 개입 기법이나 방법...' },
          ]
        }
      ]
    },
    {
      id: 'crisis',
      name: '위기 상담 기록',
      sections: [
        {
          title: '위기 상황 정보',
          fields: [
            { label: '위기 유형', type: 'radio', options: ['자살 위험', '자해 행동', '공황 발작', '급성 스트레스', '기타'], required: true },
            { label: '위험도 평가', type: 'radio', options: ['낮음', '보통', '높음', '매우 높음'], required: true },
            { label: '즉시 개입 필요성', type: 'radio', options: ['불필요', '권장', '필수', '응급'], required: true },
          ]
        },
        {
          title: '상황 평가',
          fields: [
            { label: '위기 상황 경위', type: 'textarea', required: true, placeholder: '위기 상황이 발생한 경위와 과정...' },
            { label: '현재 상태', type: 'textarea', required: true, placeholder: '내담자의 현재 정신적, 신체적 상태...' },
            { label: '안전 요소', type: 'textarea', placeholder: '내담자를 보호할 수 있는 요소들...' },
          ]
        },
        {
          title: '개입 및 조치',
          fields: [
            { label: '즉시 조치 사항', type: 'textarea', required: true, placeholder: '즉시 취한 조치나 개입...' },
            { label: '안전 계획', type: 'textarea', required: true, placeholder: '안전을 위해 수립한 계획...' },
            { label: '추가 지원', type: 'checkbox', options: ['응급실 이송', '보호자 연락', '정신과 의뢰', '사회복지사 연계', '경찰 신고'] },
          ]
        }
      ]
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSave = () => {
    console.log('저장할 데이터:', {
      clientId: selectedClient,
      templateId: selectedTemplate,
      sessionType,
      data: formData,
      createdAt: new Date().toISOString()
    });
    alert('상담 기록이 저장되었습니다.');
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({}); // 폼 데이터 초기화
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
              <h1 className="text-2xl font-bold text-secondary">상담 기록 작성</h1>
              <p className="text-sm text-secondary-400 mt-1">
                템플릿을 선택하여 체계적으로 상담 기록을 작성하세요
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-background-300 transition-colors">
                임시저장
              </button>
              <button 
                onClick={handleSave}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 기본 설정 카드 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <h2 className="text-lg font-semibold text-secondary mb-4">기본 설정</h2>
              <div className="grid grid-cols-3 gap-6">
                {/* 내담자 선택 */}
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-2">
                    내담자 선택 <span className="text-error">*</span>
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">내담자를 선택하세요</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.age}세)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 상담 유형 */}
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-2">
                    상담 유형 <span className="text-error">*</span>
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="video">화상 상담</option>
                    <option value="chat">채팅 상담</option>
                    <option value="voice">음성 상담</option>
                  </select>
                </div>

                {/* 템플릿 선택 */}
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-2">
                    기록 템플릿 <span className="text-error">*</span>
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">템플릿을 선택하세요</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 템플릿 폼 */}
            {currentTemplate && (
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-6">{currentTemplate.name}</h2>
                
                {currentTemplate.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-8">
                    <h3 className="text-base font-medium text-secondary-700 mb-4 pb-2 border-b border-background-200">
                      {section.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex}>
                          <label className="block text-sm font-medium text-secondary-600 mb-2">
                            {field.label}
                            {field.required && <span className="text-error ml-1">*</span>}
                          </label>
                          
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              required={field.required}
                            />
                          )}
                          
                          {field.type === 'number' && (
                            <input
                              type="number"
                              placeholder={field.placeholder}
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              required={field.required}
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <textarea
                              rows={4}
                              placeholder={field.placeholder}
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              required={field.required}
                            />
                          )}
                          
                          {field.type === 'select' && (
                            <select
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              required={field.required}
                            >
                              <option value="">선택하세요</option>
                              {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                          
                          {field.type === 'radio' && (
                            <div className="flex flex-wrap gap-4">
                              {field.options?.map(option => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={field.label}
                                    value={option}
                                    checked={formData[field.label] === option}
                                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                                    className="w-4 h-4 text-primary border-background-300 focus:ring-2 focus:ring-primary"
                                    required={field.required}
                                  />
                                  <span className="ml-2 text-sm text-secondary-600">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {field.type === 'checkbox' && (
                            <div className="flex flex-wrap gap-4">
                              {field.options?.map(option => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    value={option}
                                    checked={formData[field.label]?.includes(option) || false}
                                    onChange={(e) => {
                                      const currentValues = formData[field.label] || [];
                                      if (e.target.checked) {
                                        handleInputChange(field.label, [...currentValues, option]);
                                      } else {
                                        handleInputChange(field.label, currentValues.filter((v: string) => v !== option));
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-background-300 rounded focus:ring-2 focus:ring-primary"
                                  />
                                  <span className="ml-2 text-sm text-secondary-600">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 안내 메시지 */}
            {!selectedTemplate && (
              <div className="bg-background-100 rounded-custom p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-secondary-600 mb-2">템플릿을 선택하세요</h3>
                <p className="text-secondary-400">
                  내담자와 기록 템플릿을 선택하면 구조화된 상담 기록 작성이 시작됩니다.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordWritePage;
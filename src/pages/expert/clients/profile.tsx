import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';

interface ClientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registrationDate: string;
  referralSource: string;
  primaryConcerns: string[];
  medicalHistory: string;
  currentMedications: string;
  previousTherapy: string;
  riskAssessment: {
    suicideRisk: 'low' | 'medium' | 'high';
    selfHarmRisk: 'low' | 'medium' | 'high';
    notes: string;
  };
  treatmentGoals: string[];
  sessionCount: number;
  lastSessionDate: string;
  nextSessionDate: string;
  status: 'active' | 'inactive' | 'completed';
  notes: string;
}

const ClientProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'assessments' | 'notes'>('profile');

  // 샘플 내담자 데이터
  const [client, setClient] = useState<ClientProfile>({
    id: '1',
    name: '김민수',
    age: 28,
    gender: 'male',
    birthDate: '1996-03-15',
    phoneNumber: '010-1234-5678',
    email: 'kim.minsu@email.com',
    address: '서울시 강남구 역삼동 123-45',
    emergencyContact: {
      name: '김영희',
      relationship: '배우자',
      phone: '010-9876-5432'
    },
    registrationDate: '2024-06-15',
    referralSource: '자가 의뢰',
    primaryConcerns: ['불안 장애', '사회 공포증', '업무 스트레스'],
    medicalHistory: '2023년 위염 진단, 현재 치료 중',
    currentMedications: '없음',
    previousTherapy: '2022년 6개월간 상담 경험 (타 상담소)',
    riskAssessment: {
      suicideRisk: 'low',
      selfHarmRisk: 'low',
      notes: '현재 자해나 자살 사고 없음. 지지체계 양호.'
    },
    treatmentGoals: [
      '사회적 상황에서의 불안 감소',
      '업무 관련 스트레스 관리 능력 향상',
      '자기 효능감 증진'
    ],
    sessionCount: 8,
    lastSessionDate: '2024-08-05',
    nextSessionDate: '2024-08-12',
    status: 'active',
    notes: '협조적이며 치료에 적극적으로 참여. 과제 수행률 높음.'
  });

  // 최근 상담 세션 (샘플)
  const recentSessions = [
    {
      id: '1',
      date: '2024-08-05',
      type: 'video',
      duration: 60,
      summary: '인지행동치료 기법을 통한 불안 관리 연습',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-07-29',
      type: 'video',
      duration: 60,
      summary: '사회적 상황 노출 치료 계획 수립',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-07-22',
      type: 'chat',
      duration: 45,
      summary: '불안 증상 모니터링 및 대처 전략 검토',
      status: 'completed'
    }
  ];

  // 평가 도구 결과 (샘플)
  const assessmentResults = [
    {
      id: '1',
      name: 'GAD-7 (범불안장애 척도)',
      date: '2024-07-01',
      score: '12점',
      interpretation: '중간 수준의 불안',
      notes: '초기 평가 대비 3점 감소'
    },
    {
      id: '2',
      name: 'PHQ-9 (우울증 선별도구)',
      date: '2024-07-01',
      score: '8점',
      interpretation: '경미한 우울',
      notes: '불안과 연관된 우울 증상'
    },
    {
      id: '3',
      name: 'Beck 불안 척도',
      date: '2024-06-15',
      score: '18점',
      interpretation: '경미-중간 불안',
      notes: '초기 평가'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-accent bg-accent-50';
      case 'medium': return 'text-primary bg-primary-50';
      case 'high': return 'text-error bg-error-50';
      default: return 'text-secondary-400 bg-background-100';
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

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'chat': return '💭';
      case 'voice': return '🎧';
      default: return '💬';
    }
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
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-bold">
                {client.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary">{client.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-secondary-400">
                  <span>{client.age}세 • {client.gender === 'male' ? '남성' : '여성'}</span>
                  <span>총 {client.sessionCount}회 상담</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-accent text-white' : 'bg-background-400 text-secondary-600'
                  }`}>
                    {client.status === 'active' ? '진행중' : client.status === 'completed' ? '완료' : '비활성'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-background-300 transition-colors">
                일정 예약
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                {isEditing ? '저장하기' : '편집하기'}
              </button>
            </div>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-background-200">
          <nav className="px-6">
            <div className="flex space-x-8">
              {[
                { id: 'profile', label: '기본 정보', icon: '👤' },
                { id: 'sessions', label: '상담 이력', icon: '📝' },
                { id: 'assessments', label: '평가 결과', icon: '📊' },
                { id: 'notes', label: '특이사항', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* 기본 정보 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">기본 정보</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">이름</label>
                    <input
                      type="text"
                      value={client.name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">생년월일</label>
                    <input
                      type="date"
                      value={client.birthDate}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">연락처</label>
                    <input
                      type="tel"
                      value={client.phoneNumber}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">이메일</label>
                    <input
                      type="email"
                      value={client.email}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-secondary-600 mb-2">주소</label>
                    <input
                      type="text"
                      value={client.address}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                </div>
              </div>

              {/* 응급연락처 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">응급 연락처</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">이름</label>
                    <input
                      type="text"
                      value={client.emergencyContact.name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">관계</label>
                    <input
                      type="text"
                      value={client.emergencyContact.relationship}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">연락처</label>
                    <input
                      type="tel"
                      value={client.emergencyContact.phone}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                </div>
              </div>

              {/* 임상 정보 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">임상 정보</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">주호소 문제</label>
                    <div className="flex flex-wrap gap-2">
                      {client.primaryConcerns.map((concern, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">병력</label>
                    <textarea
                      rows={3}
                      value={client.medicalHistory}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">현재 복용 약물</label>
                    <input
                      type="text"
                      value={client.currentMedications}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">이전 상담 경험</label>
                    <textarea
                      rows={2}
                      value={client.previousTherapy}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                    />
                  </div>
                </div>
              </div>

              {/* 위험 평가 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">위험 평가</h2>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">자살 위험도</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(client.riskAssessment.suicideRisk)}`}>
                      {getRiskText(client.riskAssessment.suicideRisk)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600 mb-2">자해 위험도</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(client.riskAssessment.selfHarmRisk)}`}>
                      {getRiskText(client.riskAssessment.selfHarmRisk)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-2">평가 노트</label>
                  <textarea
                    rows={3}
                    value={client.riskAssessment.notes}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                  />
                </div>
              </div>

              {/* 치료 목표 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">치료 목표</h2>
                <div className="space-y-2">
                  {client.treatmentGoals.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-secondary-600">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-custom shadow-soft overflow-hidden">
                <div className="px-6 py-4 bg-background-50 border-b border-background-200">
                  <h2 className="text-lg font-semibold text-secondary">최근 상담 이력</h2>
                </div>
                <div className="divide-y divide-background-200">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getSessionTypeIcon(session.type)}</span>
                          <div>
                            <div className="font-medium text-secondary-700">
                              {new Date(session.date).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="text-sm text-secondary-400">{session.duration}분</div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-medium">
                          완료
                        </span>
                      </div>
                      <p className="text-secondary-600">{session.summary}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-background-50 border-t border-background-200">
                  <button className="text-primary hover:text-primary-600 text-sm font-medium transition-colors">
                    전체 상담 이력 보기 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-custom shadow-soft overflow-hidden">
                <div className="px-6 py-4 bg-background-50 border-b border-background-200">
                  <h2 className="text-lg font-semibold text-secondary">평가 도구 결과</h2>
                </div>
                <div className="divide-y divide-background-200">
                  {assessmentResults.map((assessment) => (
                    <div key={assessment.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-secondary-700">{assessment.name}</h3>
                          <div className="text-sm text-secondary-400">
                            {new Date(assessment.date).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{assessment.score}</div>
                          <div className="text-sm text-secondary-500">{assessment.interpretation}</div>
                        </div>
                      </div>
                      <p className="text-secondary-600">{assessment.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">특이사항 및 메모</h2>
                <textarea
                  rows={12}
                  value={client.notes}
                  disabled={!isEditing}
                  placeholder="내담자 관련 특이사항, 치료 진행 상황, 기타 중요한 정보를 기록하세요..."
                  className="w-full px-4 py-3 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background-50"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientProfilePage;
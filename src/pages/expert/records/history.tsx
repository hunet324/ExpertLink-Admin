import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';

interface SessionRecord {
  id: string;
  clientId: string;
  clientName: string;
  sessionDate: string;
  sessionType: 'video' | 'chat' | 'voice';
  duration: number;
  templateType: string;
  status: 'completed' | 'draft';
  summary: string;
  nextSessionPlan?: string;
  createdAt: string;
  updatedAt: string;
}

const RecordHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'chat' | 'voice'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  // 상담 기록 샘플 데이터
  const records: SessionRecord[] = [
    {
      id: '1',
      clientId: '1',
      clientName: '김민수',
      sessionDate: '2024-08-08',
      sessionType: 'video',
      duration: 60,
      templateType: '후속 상담 기록',
      status: 'completed',
      summary: '불안 증상에 대한 인지행동치료 진행. 과제 수행 결과 확인 및 새로운 대처 전략 논의.',
      nextSessionPlan: '학습된 대처 전략을 실제 상황에 적용해보고 결과 점검',
      createdAt: '2024-08-08T14:30:00',
      updatedAt: '2024-08-08T15:30:00'
    },
    {
      id: '2',
      clientId: '2',
      clientName: '이지은',
      sessionDate: '2024-08-07',
      sessionType: 'chat',
      duration: 45,
      templateType: '초기 상담 기록',
      status: 'completed',
      summary: '우울 증상 호소. 최근 직장 내 스트레스와 관련된 문제 상황 파악 및 초기 평가 완료.',
      nextSessionPlan: '우울감 정도 측정을 위한 척도 검사 및 치료 방향 설정',
      createdAt: '2024-08-07T10:00:00',
      updatedAt: '2024-08-07T11:00:00'
    },
    {
      id: '3',
      clientId: '3',
      clientName: '박준형',
      sessionDate: '2024-08-06',
      sessionType: 'voice',
      duration: 50,
      templateType: '위기 상담 기록',
      status: 'completed',
      summary: '급성 스트레스 반응으로 응급 상담 진행. 안전 계획 수립 및 즉시 지원 방안 논의.',
      nextSessionPlan: '스트레스 관리 기법 교육 및 추가 평가 필요',
      createdAt: '2024-08-06T16:00:00',
      updatedAt: '2024-08-06T17:00:00'
    },
    {
      id: '4',
      clientId: '1',
      clientName: '김민수',
      sessionDate: '2024-08-01',
      sessionType: 'video',
      duration: 60,
      templateType: '초기 상담 기록',
      status: 'completed',
      summary: '초기 면담을 통한 주호소 문제 파악. 불안장애 의심 소견으로 추가 평가 계획.',
      nextSessionPlan: '불안척도 검사 및 인지행동치료 적용 가능성 평가',
      createdAt: '2024-08-01T14:00:00',
      updatedAt: '2024-08-01T15:00:00'
    },
    {
      id: '5',
      clientId: '4',
      clientName: '정하린',
      sessionDate: '2024-07-30',
      sessionType: 'video',
      duration: 55,
      templateType: '후속 상담 기록',
      status: 'draft',
      summary: '육아 스트레스 관련 상담 진행 중. 기록 작성 미완료.',
      createdAt: '2024-07-30T13:00:00',
      updatedAt: '2024-07-30T13:30:00'
    }
  ];

  const clients = [
    { id: '1', name: '김민수' },
    { id: '2', name: '이지은' },
    { id: '3', name: '박준형' },
    { id: '4', name: '정하린' }
  ];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = selectedClient === '' || record.clientId === selectedClient;
    const matchesType = selectedType === 'all' || record.sessionType === selectedType;
    
    let matchesDate = true;
    if (dateRange.from) {
      matchesDate = matchesDate && new Date(record.sessionDate) >= new Date(dateRange.from);
    }
    if (dateRange.to) {
      matchesDate = matchesDate && new Date(record.sessionDate) <= new Date(dateRange.to);
    }
    
    return matchesSearch && matchesClient && matchesType && matchesDate;
  }).sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'chat': return '💭';
      case 'voice': return '🎧';
      default: return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-accent text-white' : 'bg-background-400 text-secondary-600';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? '완료' : '임시저장';
  };

  const selectedRecordDetail = selectedRecord ? records.find(r => r.id === selectedRecord) : null;

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* 메인 목록 영역 */}
        <div className={`${selectedRecord ? 'w-1/2' : 'w-full'} flex flex-col border-r border-background-200`}>
          {/* 헤더 */}
          <header className="bg-white shadow-soft px-6 py-4 border-b border-background-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-secondary">상담 이력</h1>
                <p className="text-sm text-secondary-400 mt-1">
                  전체 {records.length}건 중 {filteredRecords.length}건 표시
                </p>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                + 새 기록 작성
              </button>
            </div>
          </header>

          {/* 필터 영역 */}
          <div className="bg-white px-6 py-4 border-b border-background-200">
            {/* 검색 및 기본 필터 */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">🔍</span>
                  <input
                    type="text"
                    placeholder="내담자명, 상담 내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="border border-background-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">모든 유형</option>
                <option value="video">화상 상담</option>
                <option value="chat">채팅 상담</option>
                <option value="voice">음성 상담</option>
              </select>
            </div>
            
            {/* 날짜 필터 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-secondary-600">기간:</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-background-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-secondary-400">~</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-background-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClient('');
                  setSelectedType('all');
                  setDateRange({ from: '', to: '' });
                }}
                className="text-sm text-primary hover:text-primary-600 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>

          {/* 기록 목록 */}
          <div className="flex-1 overflow-y-auto">
            {filteredRecords.length > 0 ? (
              <div className="divide-y divide-background-200">
                {filteredRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className={`p-6 hover:bg-background-50 cursor-pointer transition-colors ${
                      selectedRecord === record.id ? 'bg-primary-50 border-r-2 border-r-primary' : ''
                    }`}
                    onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getSessionTypeIcon(record.sessionType)}</span>
                        <div>
                          <h3 className="font-medium text-secondary-700">{record.clientName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-secondary-400">
                              {new Date(record.sessionDate).toLocaleDateString('ko-KR')}
                            </span>
                            <span className="text-secondary-300">•</span>
                            <span className="text-sm text-secondary-400">{record.duration}분</span>
                            <span className="text-secondary-300">•</span>
                            <span className="text-sm text-secondary-400">{record.templateType}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                      {record.summary}
                    </p>
                    
                    {record.nextSessionPlan && (
                      <div className="bg-background-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-secondary-500 mb-1">다음 회기 계획</p>
                        <p className="text-sm text-secondary-600 line-clamp-1">{record.nextSessionPlan}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-background-100">
                      <span className="text-xs text-secondary-400">
                        작성: {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs text-primary hover:text-primary-600 transition-colors">
                          편집
                        </button>
                        <button className="text-xs text-secondary-400 hover:text-secondary-600 transition-colors">
                          복사
                        </button>
                        <button className="text-xs text-error hover:text-error-600 transition-colors">
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-secondary-600 mb-2">기록이 없습니다</h3>
                <p className="text-secondary-400 mb-6">
                  검색 조건을 변경하거나 새로운 상담 기록을 작성해보세요.
                </p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  새 기록 작성하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 상세 보기 영역 */}
        {selectedRecord && selectedRecordDetail && (
          <div className="w-1/2 bg-white flex flex-col">
            <header className="px-6 py-4 border-b border-background-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getSessionTypeIcon(selectedRecordDetail.sessionType)}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-secondary">{selectedRecordDetail.clientName} 상담 기록</h2>
                    <p className="text-sm text-secondary-400">
                      {new Date(selectedRecordDetail.sessionDate).toLocaleDateString('ko-KR')} • {selectedRecordDetail.templateType}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-background-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="bg-background-50 rounded-lg p-4">
                <h3 className="font-medium text-secondary-700 mb-3">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary-500">상담 일시:</span>
                    <span className="ml-2 font-medium text-secondary-700">
                      {new Date(selectedRecordDetail.sessionDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-500">상담 시간:</span>
                    <span className="ml-2 font-medium text-secondary-700">{selectedRecordDetail.duration}분</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">상담 유형:</span>
                    <span className="ml-2 font-medium text-secondary-700">
                      {selectedRecordDetail.sessionType === 'video' ? '화상 상담' :
                       selectedRecordDetail.sessionType === 'chat' ? '채팅 상담' : '음성 상담'}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-500">상태:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRecordDetail.status)}`}>
                      {getStatusText(selectedRecordDetail.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 상담 요약 */}
              <div>
                <h3 className="font-medium text-secondary-700 mb-3">상담 내용 요약</h3>
                <div className="bg-white border border-background-200 rounded-lg p-4">
                  <p className="text-secondary-600 leading-relaxed">{selectedRecordDetail.summary}</p>
                </div>
              </div>
              
              {/* 다음 회기 계획 */}
              {selectedRecordDetail.nextSessionPlan && (
                <div>
                  <h3 className="font-medium text-secondary-700 mb-3">다음 회기 계획</h3>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-secondary-600 leading-relaxed">{selectedRecordDetail.nextSessionPlan}</p>
                  </div>
                </div>
              )}
              
              {/* 작성 정보 */}
              <div className="pt-4 border-t border-background-200">
                <div className="flex items-center justify-between text-xs text-secondary-400">
                  <span>작성: {new Date(selectedRecordDetail.createdAt).toLocaleString('ko-KR')}</span>
                  <span>수정: {new Date(selectedRecordDetail.updatedAt).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-background-200">
              <div className="flex justify-end space-x-3">
                <button className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-background-300 transition-colors">
                  PDF 출력
                </button>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  편집하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordHistoryPage;
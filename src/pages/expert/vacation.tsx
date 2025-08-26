import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick_leave' | 'personal' | 'training';
  reason: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  affectedClients?: number;
  rescheduledSessions?: number;
}

interface WeeklySchedule {
  [key: string]: {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
    breakTimes: { start: string; end: string; }[];
  };
}

const VacationPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'history'>('calendar');
  const [showNewVacationModal, setShowNewVacationModal] = useState(false);

  // 휴무 기간 샘플 데이터
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([
    {
      id: 'vacation_001',
      startDate: '2024-08-15',
      endDate: '2024-08-17',
      type: 'vacation',
      reason: '여름휴가',
      status: 'scheduled',
      createdAt: '2024-08-05T10:00:00',
      affectedClients: 3,
      rescheduledSessions: 5
    },
    {
      id: 'vacation_002',
      startDate: '2024-08-20',
      endDate: '2024-08-20',
      type: 'personal',
      reason: '개인 사정',
      status: 'scheduled',
      createdAt: '2024-08-10T14:30:00',
      affectedClients: 2,
      rescheduledSessions: 2
    },
    {
      id: 'vacation_003',
      startDate: '2024-07-10',
      endDate: '2024-07-12',
      type: 'training',
      reason: '전문 교육 참석',
      status: 'completed',
      createdAt: '2024-07-01T09:00:00',
      affectedClients: 4,
      rescheduledSessions: 6
    }
  ]);

  // 주간 스케줄 샘플 데이터
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: {
      isAvailable: true,
      startTime: '09:00',
      endTime: '18:00',
      breakTimes: [{ start: '12:00', end: '13:00' }]
    },
    tuesday: {
      isAvailable: true,
      startTime: '09:00',
      endTime: '18:00',
      breakTimes: [{ start: '12:00', end: '13:00' }]
    },
    wednesday: {
      isAvailable: true,
      startTime: '09:00',
      endTime: '17:00',
      breakTimes: [{ start: '12:00', end: '13:00' }]
    },
    thursday: {
      isAvailable: true,
      startTime: '09:00',
      endTime: '18:00',
      breakTimes: [{ start: '12:00', end: '13:00' }]
    },
    friday: {
      isAvailable: true,
      startTime: '09:00',
      endTime: '16:00',
      breakTimes: [{ start: '12:00', end: '13:00' }]
    },
    saturday: {
      isAvailable: false,
      startTime: '',
      endTime: '',
      breakTimes: []
    },
    sunday: {
      isAvailable: false,
      startTime: '',
      endTime: '',
      breakTimes: []
    }
  });

  // 새 휴무 등록 폼 상태
  const [newVacation, setNewVacation] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation' as VacationPeriod['type'],
    reason: ''
  });

  const dayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일'
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-accent text-white';
      case 'sick_leave': return 'bg-error text-white';
      case 'personal': return 'bg-primary text-white';
      case 'training': return 'bg-secondary-400 text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation': return '휴가';
      case 'sick_leave': return '병가';
      case 'personal': return '개인사유';
      case 'training': return '교육/연수';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary-100 text-primary-700';
      case 'active': return 'bg-accent-100 text-accent-700';
      case 'completed': return 'bg-background-200 text-secondary-600';
      case 'cancelled': return 'bg-error-100 text-error-700';
      default: return 'bg-background-200 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예정';
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      });
    }
    
    return `${start.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })} ~ ${end.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleAddVacation = async () => {
    if (!newVacation.startDate || !newVacation.endDate || !newVacation.reason.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (new Date(newVacation.startDate) > new Date(newVacation.endDate)) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }

    const vacation: VacationPeriod = {
      id: `vacation_${Date.now()}`,
      startDate: newVacation.startDate,
      endDate: newVacation.endDate,
      type: newVacation.type,
      reason: newVacation.reason,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      affectedClients: Math.floor(Math.random() * 5) + 1,
      rescheduledSessions: Math.floor(Math.random() * 8) + 1
    };

    setVacationPeriods(prev => [vacation, ...prev]);
    setNewVacation({ startDate: '', endDate: '', type: 'vacation', reason: '' });
    setShowNewVacationModal(false);
    
    alert('휴무가 등록되었습니다. 영향받는 내담자들에게 자동으로 안내 메시지가 발송됩니다.');
  };

  const handleCancelVacation = async (vacationId: string) => {
    if (confirm('휴무를 취소하시겠습니까? 관련된 일정 변경사항도 함께 취소됩니다.')) {
      setVacationPeriods(prev => prev.map(v => 
        v.id === vacationId ? { ...v, status: 'cancelled' as const } : v
      ));
    }
  };

  const handleUpdateSchedule = async () => {
    if (confirm('주간 스케줄을 업데이트하시겠습니까?')) {
      console.log('주간 스케줄 업데이트:', weeklySchedule);
      alert('주간 스케줄이 업데이트되었습니다.');
    }
  };

  const renderCalendarTab = () => (
    <div className="space-y-6">
      {/* 새 휴무 등록 버튼 */}
      <div className="bg-white rounded-custom shadow-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-h4 font-semibold text-secondary">휴무 관리</h3>
            <p className="text-caption text-secondary-400 mt-1">
              휴무 기간을 설정하고 관리할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowNewVacationModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>새 휴무 등록</span>
          </button>
        </div>
      </div>

      {/* 휴무 목록 */}
      <div className="bg-white rounded-custom shadow-soft">
        <div className="p-6 border-b border-background-200">
          <h3 className="text-h4 font-semibold text-secondary">휴무 목록</h3>
        </div>
        
        <div className="p-6">
          {vacationPeriods.length > 0 ? (
            <div className="space-y-4">
              {vacationPeriods.map((vacation) => (
                <div key={vacation.id} className="border border-background-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getTypeColor(vacation.type)}`}>
                        {getTypeText(vacation.type)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(vacation.status)}`}>
                        {getStatusText(vacation.status)}
                      </span>
                    </div>
                    <div className="text-caption text-secondary-400">
                      {calculateDuration(vacation.startDate, vacation.endDate)}일간
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-body font-semibold text-secondary mb-1">
                      {formatDateRange(vacation.startDate, vacation.endDate)}
                    </div>
                    <div className="text-body text-secondary-700">
                      {vacation.reason}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-caption text-secondary-600">
                    <div>
                      <span className="text-secondary-400">영향받는 내담자:</span> {vacation.affectedClients}명
                    </div>
                    <div>
                      <span className="text-secondary-400">변경된 세션:</span> {vacation.rescheduledSessions}회
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-secondary-400">
                      등록일: {new Date(vacation.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    
                    <div className="flex space-x-2">
                      {vacation.status === 'scheduled' && (
                        <>
                          <button className="bg-background-200 text-secondary-600 px-3 py-1 rounded text-xs hover:bg-background-300 transition-colors">
                            수정
                          </button>
                          <button
                            onClick={() => handleCancelVacation(vacation.id)}
                            className="bg-error-50 text-error px-3 py-1 rounded text-xs hover:bg-error-100 transition-colors"
                          >
                            취소
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => router.push(`/expert/dashboard/schedule?date=${vacation.startDate}`)}
                        className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-600 transition-colors"
                      >
                        일정 보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏖️</span>
              <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                등록된 휴무가 없습니다
              </h3>
              <p className="text-caption text-secondary-400">
                새 휴무를 등록하여 일정을 관리해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 새 휴무 등록 모달 */}
      {showNewVacationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-md w-full p-6">
            <h3 className="text-h4 font-semibold text-secondary mb-4">새 휴무 등록</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">시작일</label>
                  <input
                    type="date"
                    value={newVacation.startDate}
                    onChange={(e) => setNewVacation(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                  />
                </div>
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">종료일</label>
                  <input
                    type="date"
                    value={newVacation.endDate}
                    onChange={(e) => setNewVacation(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newVacation.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-caption text-secondary-400 block mb-1">휴무 유형</label>
                <select
                  value={newVacation.type}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, type: e.target.value as VacationPeriod['type'] }))}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300"
                >
                  <option value="vacation">휴가</option>
                  <option value="sick_leave">병가</option>
                  <option value="personal">개인사유</option>
                  <option value="training">교육/연수</option>
                </select>
              </div>
              
              <div>
                <label className="text-caption text-secondary-400 block mb-1">사유</label>
                <textarea
                  value={newVacation.reason}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="휴무 사유를 입력하세요"
                  rows={3}
                  className="w-full border border-background-300 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-primary-300 resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewVacationModal(false)}
                className="flex-1 bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddVacation}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleTab = () => (
    <div className="bg-white rounded-custom shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-semibold text-secondary">주간 기본 스케줄</h3>
        <button
          onClick={handleUpdateSchedule}
          className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
        >
          스케줄 저장
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(dayNames).map(([day, dayName]) => (
          <div key={day} className="border border-background-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={weeklySchedule[day].isAvailable}
                  onChange={(e) => setWeeklySchedule(prev => ({
                    ...prev,
                    [day]: { ...prev[day], isAvailable: e.target.checked }
                  }))}
                  className="w-4 h-4"
                />
                <span className="text-body font-medium text-secondary">{dayName}</span>
              </div>
              
              <span className={`px-2 py-1 rounded text-xs ${
                weeklySchedule[day].isAvailable 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'bg-background-200 text-secondary-500'
              }`}>
                {weeklySchedule[day].isAvailable ? '근무일' : '휴무일'}
              </span>
            </div>
            
            {weeklySchedule[day].isAvailable && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={weeklySchedule[day].startTime}
                    onChange={(e) => setWeeklySchedule(prev => ({
                      ...prev,
                      [day]: { ...prev[day], startTime: e.target.value }
                    }))}
                    className="w-full border border-background-300 rounded px-2 py-1 text-caption focus:outline-none focus:border-primary-300"
                  />
                </div>
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={weeklySchedule[day].endTime}
                    onChange={(e) => setWeeklySchedule(prev => ({
                      ...prev,
                      [day]: { ...prev[day], endTime: e.target.value }
                    }))}
                    className="w-full border border-background-300 rounded px-2 py-1 text-caption focus:outline-none focus:border-primary-300"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-background-50 rounded-lg">
        <h4 className="text-body font-medium text-secondary mb-2">📝 안내사항</h4>
        <ul className="text-caption text-secondary-600 space-y-1">
          <li>• 주간 기본 스케줄은 정기적인 상담 가능 시간을 의미합니다.</li>
          <li>• 임시 휴무는 &apos;휴무 관리&apos; 탭에서 별도로 설정할 수 있습니다.</li>
          <li>• 스케줄 변경 시 기존 예약된 상담에는 영향을 주지 않습니다.</li>
        </ul>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="bg-white rounded-custom shadow-soft">
      <div className="p-6 border-b border-background-200">
        <h3 className="text-h4 font-semibold text-secondary">휴무 이력</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {vacationPeriods
            .filter(v => v.status === 'completed' || v.status === 'cancelled')
            .map((vacation) => (
            <div key={vacation.id} className="flex items-center justify-between p-3 border border-background-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(vacation.type)}`}>
                  {getTypeText(vacation.type)}
                </span>
                <div>
                  <div className="text-body text-secondary-700">
                    {formatDateRange(vacation.startDate, vacation.endDate)} ({calculateDuration(vacation.startDate, vacation.endDate)}일)
                  </div>
                  <div className="text-caption text-secondary-500">{vacation.reason}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(vacation.status)}`}>
                  {getStatusText(vacation.status)}
                </span>
                <div className="text-caption text-secondary-400">
                  {new Date(vacation.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          ))}
          
          {vacationPeriods.filter(v => v.status === 'completed' || v.status === 'cancelled').length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📅</span>
              <p className="text-secondary-400 text-caption">과거 휴무 이력이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
                <span className="mr-3 text-2xl">🏖️</span>
                휴무 설정
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                휴무 기간을 설정하고 주간 스케줄을 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">
                    {vacationPeriods.filter(v => v.status === 'scheduled').length}
                  </div>
                  <div className="text-xs text-secondary-400">예정된 휴무</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-primary">
                    {Object.values(weeklySchedule).filter(s => s.isAvailable).length}
                  </div>
                  <div className="text-xs text-secondary-400">근무일</div>
                </div>
              </div>

              {/* 프로필 */}
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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* 탭 메뉴 */}
            <div className="bg-white rounded-custom shadow-soft mb-6">
              <div className="flex border-b border-background-200">
                {[
                  { key: 'calendar', label: '휴무 관리', icon: '📅' },
                  { key: 'schedule', label: '주간 스케줄', icon: '📋' },
                  { key: 'history', label: '휴무 이력', icon: '📚' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 px-6 py-4 text-caption font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-primary border-b-2 border-primary bg-primary-25'
                        : 'text-secondary-600 hover:text-primary hover:bg-background-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div>
              {activeTab === 'calendar' && renderCalendarTab()}
              {activeTab === 'schedule' && renderScheduleTab()}
              {activeTab === 'history' && renderHistoryTab()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VacationPage;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface ActiveVoiceSession {
  id: string;
  clientName: string;
  clientId: string;
  startTime: string;
  duration: number;
  status: 'connecting' | 'active' | 'on-hold' | 'ended';
  callQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recordingEnabled: boolean;
}

interface UpcomingVoiceSession {
  id: string;
  clientName: string;
  clientId: string;
  scheduledTime: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  phoneNumber?: string;
}

interface VoiceCallLog {
  id: string;
  clientName: string;
  clientId: string;
  callTime: string;
  duration: number;
  status: 'completed' | 'missed' | 'cancelled';
  recordingUrl?: string;
}

const VoiceCounselingPage: React.FC = () => {
  const router = useRouter();
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [callVolume, setCallVolume] = useState(80);

  // 활성 음성 세션 샘플 데이터
  const activeSession: ActiveVoiceSession | null = {
    id: 'voice_001',
    clientName: '한**',
    clientId: 'client_008',
    startTime: '2024-08-11T11:00:00',
    duration: 90,
    status: 'active',
    callQuality: 'excellent',
    recordingEnabled: true
  };

  // 예정된 음성 상담 샘플 데이터
  const upcomingSessions: UpcomingVoiceSession[] = [
    {
      id: 'voice_002',
      clientName: '윤**',
      clientId: 'client_009',
      scheduledTime: '2024-08-11T14:00:00',
      duration: 45,
      priority: 'medium',
      phoneNumber: '010-5555-6666'
    },
    {
      id: 'voice_003',
      clientName: '서**',
      clientId: 'client_011',
      scheduledTime: '2024-08-11T16:00:00',
      duration: 60,
      priority: 'low',
      phoneNumber: '010-9999-0000'
    },
    {
      id: 'voice_004',
      clientName: '조**',
      clientId: 'client_010',
      scheduledTime: '2024-08-12T10:00:00',
      duration: 60,
      priority: 'high',
      phoneNumber: '010-7777-8888'
    }
  ];

  // 통화 기록 샘플 데이터
  const callLogs: VoiceCallLog[] = [
    {
      id: 'log_001',
      clientName: '이**',
      clientId: 'client_001',
      callTime: '2024-08-10T09:00:00',
      duration: 55,
      status: 'completed',
      recordingUrl: 'https://recordings.expertlink.com/voice_001.mp3'
    },
    {
      id: 'log_002',
      clientName: '김**',
      clientId: 'client_003',
      callTime: '2024-08-09T14:00:00',
      duration: 65,
      status: 'completed',
      recordingUrl: 'https://recordings.expertlink.com/voice_002.mp3'
    },
    {
      id: 'log_003',
      clientName: '정**',
      clientId: 'client_007',
      callTime: '2024-08-09T10:30:00',
      duration: 0,
      status: 'missed'
    }
  ];

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const getTimeUntilSession = (scheduledTime: string) => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diffMinutes = Math.floor((scheduled.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return '시작 시간 지남';
    if (diffMinutes === 0) return '지금 시작';
    if (diffMinutes < 60) return `${diffMinutes}분 후`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}시간 ${minutes}분 후`;
  };

  const getCallQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-accent bg-accent-50';
      case 'good': return 'text-primary bg-primary-50';
      case 'fair': return 'text-secondary-600 bg-secondary-50';
      case 'poor': return 'text-error bg-error-50';
      default: return 'text-secondary-600 bg-secondary-50';
    }
  };

  const getCallQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return '매우 좋음';
      case 'good': return '좋음';
      case 'fair': return '보통';
      case 'poor': return '나쁨';
      default: return quality;
    }
  };

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
      case 'completed': return 'text-accent bg-accent-50';
      case 'missed': return 'text-error bg-error-50';
      case 'cancelled': return 'text-secondary-400 bg-secondary-50';
      default: return 'text-secondary-600 bg-secondary-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'missed': return '부재중';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const handleStartCall = (phoneNumber?: string) => {
    // 음성 통화 시작 로직
    console.log('음성 통화 시작:', phoneNumber);
  };

  const handleEndCall = async () => {
    if (confirm('현재 진행 중인 음성 상담을 종료하시겠습니까?')) {
      console.log('음성 상담 종료');
      router.push(`/expert/records/write?sessionId=${activeSession?.id}`);
    }
  };

  const handleHoldCall = () => {
    // 통화 대기 로직
    console.log('통화 대기');
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const formatCallTime = (callTime: string) => {
    const date = new Date(callTime);
    return {
      date: date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
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
                <span className="mr-3 text-2xl">🎧</span>
                음성 상담실
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                음성 통화를 통한 실시간 상담을 진행할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeSession && (
                <div className="flex items-center space-x-3 bg-background-100 px-4 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-caption font-medium text-secondary">{activeSession.clientName}님과 통화 중</div>
                    <div className="text-xs text-secondary-400">{getSessionDuration(activeSession.startTime)} 경과</div>
                  </div>
                </div>
              )}

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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 현재 진행 중인 통화 */}
          {activeSession && (
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3 font-semibold text-secondary flex items-center">
                  <span className="mr-2">📞</span>
                  진행 중인 통화
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-caption font-medium ${getCallQualityColor(activeSession.callQuality)}`}>
                    {getCallQualityText(activeSession.callQuality)}
                  </span>
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-caption font-medium animate-pulse">
                    통화 중
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">내담자</label>
                    <div className="text-h4 font-semibold text-secondary-700">
                      {activeSession.clientName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">통화 시간</label>
                    <div className="text-h4 font-mono font-bold text-primary">
                      {getSessionDuration(activeSession.startTime)}
                    </div>
                  </div>

                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">예정 시간</label>
                    <div className="text-body text-secondary-700">
                      {activeSession.duration}분
                    </div>
                  </div>

                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">녹음 상태</label>
                    <span className={`px-2 py-1 rounded text-caption ${
                      activeSession.recordingEnabled 
                        ? 'bg-error-50 text-error' 
                        : 'bg-secondary-50 text-secondary-500'
                    }`}>
                      {activeSession.recordingEnabled ? '🔴 녹음 중' : '⭕ 녹음 안함'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 음성 제어 */}
                  <div>
                    <label className="text-caption text-secondary-400 block mb-2">음성 설정</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-caption">마이크</span>
                        <button
                          onClick={() => setMicEnabled(!micEnabled)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-caption font-medium transition-colors ${
                            micEnabled 
                              ? 'bg-primary text-white hover:bg-primary-600' 
                              : 'bg-error text-white hover:bg-error-600'
                          }`}
                        >
                          <span>{micEnabled ? '🎤' : '🔇'}</span>
                          <span>{micEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-caption">스피커</span>
                        <button
                          onClick={() => setSpeakerEnabled(!speakerEnabled)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-caption font-medium transition-colors ${
                            speakerEnabled 
                              ? 'bg-primary text-white hover:bg-primary-600' 
                              : 'bg-background-300 text-secondary-600 hover:bg-background-400'
                          }`}
                        >
                          <span>{speakerEnabled ? '🔊' : '🔇'}</span>
                          <span>{speakerEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-caption">볼륨</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={callVolume}
                            onChange={(e) => setCallVolume(parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-caption text-secondary-600 min-w-[3rem]">{callVolume}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 통화 제어 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleHoldCall}
                      className="flex-1 bg-secondary-100 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-200 transition-colors"
                    >
                      대기
                    </button>
                    <button
                      onClick={() => setRecordingEnabled(!recordingEnabled)}
                      className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors ${
                        recordingEnabled 
                          ? 'bg-error text-white hover:bg-error-600' 
                          : 'bg-background-300 text-secondary-600 hover:bg-background-400'
                      }`}
                    >
                      {recordingEnabled ? '녹음 중지' : '녹음 시작'}
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                    >
                      통화 종료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 예정된 음성 상담 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <h2 className="text-h3 font-semibold text-secondary mb-4 flex items-center">
                <span className="mr-2">📅</span>
                예정된 음성 상담
              </h2>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border border-background-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-body font-semibold text-secondary-700">
                              {session.clientName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(session.priority)}`}>
                              {getPriorityText(session.priority)}
                            </span>
                          </div>
                          
                          <div className="text-caption text-secondary-600 space-y-1">
                            <div>예정: {new Date(session.scheduledTime).toLocaleString('ko-KR')}</div>
                            <div>시간: {session.duration}분</div>
                            {session.phoneNumber && (
                              <div>연락처: {session.phoneNumber}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-caption text-right">
                          <div className={`font-medium ${
                            getTimeUntilSession(session.scheduledTime).includes('분 후') && 
                            parseInt(getTimeUntilSession(session.scheduledTime)) <= 5 
                              ? 'text-error' 
                              : 'text-primary'
                          }`}>
                            {getTimeUntilSession(session.scheduledTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStartCall(session.phoneNumber)}
                          className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                        >
                          통화 시작
                        </button>
                        <button
                          onClick={() => router.push(`/expert/clients/profile?id=${session.clientId}`)}
                          className="bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                        >
                          정보
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📞</span>
                  <p className="text-secondary-400 text-caption">예정된 음성 상담이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 최근 통화 기록 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <h2 className="text-h3 font-semibold text-secondary mb-4 flex items-center">
                <span className="mr-2">📋</span>
                최근 통화 기록
              </h2>

              <div className="space-y-3">
                {callLogs.map((log) => {
                  const { date, time } = formatCallTime(log.callTime);
                  return (
                    <div key={log.id} className="border border-background-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-body font-medium text-secondary-700">
                          {log.clientName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusText(log.status)}
                        </span>
                      </div>
                      
                      <div className="text-caption text-secondary-600 space-y-1">
                        <div className="flex justify-between">
                          <span>날짜: {date} {time}</span>
                          <span>시간: {formatDuration(log.duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/expert/clients/profile?id=${log.clientId}`)}
                            className="bg-background-100 text-secondary-600 px-2 py-1 rounded text-xs hover:bg-background-200 transition-colors"
                          >
                            내담자 정보
                          </button>
                          <button
                            onClick={() => router.push(`/expert/records/history?clientId=${log.clientId}`)}
                            className="bg-background-100 text-secondary-600 px-2 py-1 rounded text-xs hover:bg-background-200 transition-colors"
                          >
                            상담 기록
                          </button>
                        </div>
                        
                        {log.recordingUrl && (
                          <button
                            onClick={() => window.open(log.recordingUrl, '_blank')}
                            className="bg-accent-50 text-accent-600 px-2 py-1 rounded text-xs hover:bg-accent-100 transition-colors"
                          >
                            녹음 파일
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 빠른 작업 */}
          <div className="bg-white rounded-custom shadow-soft p-6">
            <h2 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              빠른 작업
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/expert/schedule/new')}
                className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📞</span>
                <span className="text-caption font-medium text-primary group-hover:text-primary-600">새 상담 예약</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/clients/list')}
                className="flex flex-col items-center p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">👥</span>
                <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">내담자 목록</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/records/write')}
                className="flex flex-col items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📝</span>
                <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">상담 기록</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/dashboard/schedule')}
                className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📋</span>
                <span className="text-caption font-medium text-secondary-500 group-hover:text-secondary-600">오늘 일정</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoiceCounselingPage;
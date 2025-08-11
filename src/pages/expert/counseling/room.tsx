import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'expert' | 'client';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface SessionInfo {
  clientName: string;
  sessionType: 'video' | 'chat' | 'voice';
  startTime: Date;
  duration: number;
  status: 'waiting' | 'active' | 'paused' | 'ended';
}

const CounselingRoomPage: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    clientName: '김민수',
    sessionType: 'video',
    startTime: new Date(),
    duration: 0,
    status: 'waiting'
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'client',
      content: '안녕하세요, 선생님. 오늘 상담 잘 부탁드립니다.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: '2',
      sender: 'expert',
      content: '안녕하세요. 오늘도 만나게 되어 반갑습니다. 지난 시간 이후 어떻게 지내셨나요?',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 세션 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionInfo.status === 'active') {
      interval = setInterval(() => {
        setSessionInfo(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionInfo.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'expert',
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleStartSession = () => {
    setSessionInfo(prev => ({ ...prev, status: 'active' }));
  };

  const handleEndSession = () => {
    setSessionInfo(prev => ({ ...prev, status: 'ended' }));
    // 상담 종료 후 기록 페이지로 이동하거나 모달 표시
    alert('상담이 종료되었습니다. 상담 기록을 작성해주세요.');
  };

  return (
    <div className="h-screen bg-background-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-soft px-6 py-4 border-b border-background-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {sessionInfo.clientName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-secondary">{sessionInfo.clientName} 님과의 상담</h1>
              <div className="flex items-center space-x-4 text-sm text-secondary-400">
                <span className="flex items-center space-x-1">
                  <span>
                    {sessionInfo.sessionType === 'video' ? '🎥' : 
                     sessionInfo.sessionType === 'chat' ? '💭' : '🎧'}
                  </span>
                  <span>
                    {sessionInfo.sessionType === 'video' ? '화상 상담' : 
                     sessionInfo.sessionType === 'chat' ? '채팅 상담' : '음성 상담'}
                  </span>
                </span>
                <span>
                  상담 시간: {formatTime(sessionInfo.duration)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sessionInfo.status === 'active' ? 'bg-accent text-white' :
                  sessionInfo.status === 'waiting' ? 'bg-primary-100 text-primary-600' :
                  'bg-background-400 text-secondary-600'
                }`}>
                  {sessionInfo.status === 'active' ? '상담 중' :
                   sessionInfo.status === 'waiting' ? '대기 중' : '종료'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${
                showNotes ? 'bg-primary text-white' : 'bg-background-100 text-secondary-600 hover:bg-background-200'
              }`}
              title="상담 메모"
            >
              📝
            </button>
            <button className="bg-background-100 text-secondary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-background-200 transition-colors">
              녹화하기
            </button>
            <button 
              onClick={handleEndSession}
              className="bg-error text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-error-600 transition-colors"
            >
              상담 종료
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 메인 상담 영역 */}
        <div className={`${showNotes ? 'w-2/3' : 'w-full'} flex flex-col`}>
          {/* 비디오/음성 영역 */}
          {(sessionInfo.sessionType === 'video' || sessionInfo.sessionType === 'voice') && (
            <div className="bg-secondary-900 relative" style={{ height: '60%' }}>
              {sessionInfo.sessionType === 'video' ? (
                <div className="w-full h-full flex">
                  {/* 내담자 화면 (메인) */}
                  <div className="flex-1 relative bg-secondary-800 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-4xl font-bold mb-4 mx-auto">
                        {sessionInfo.clientName[0]}
                      </div>
                      <p className="text-lg">{sessionInfo.clientName} 님</p>
                      <p className="text-sm text-secondary-300 mt-2">
                        {sessionInfo.status === 'waiting' ? '연결 대기 중...' : '연결됨'}
                      </p>
                    </div>
                  </div>
                  
                  {/* 상담사 화면 (작은 창) */}
                  <div className="absolute top-4 right-4 w-48 h-36 bg-secondary-700 rounded-lg border-2 border-secondary-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-lg font-bold mb-2 mx-auto">
                        김
                      </div>
                      <p className="text-sm">김상담사</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary-800">
                  <div className="text-white text-center">
                    <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-6xl mb-6 mx-auto">
                      🎧
                    </div>
                    <p className="text-xl mb-2">음성 상담 진행 중</p>
                    <p className="text-secondary-300">{sessionInfo.clientName} 님과 연결됨</p>
                  </div>
                </div>
              )}
              
              {/* 상담 컨트롤 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black bg-opacity-50 rounded-full px-6 py-3 flex items-center space-x-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-error text-white' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                    title={isMuted ? '음소거 해제' : '음소거'}
                  >
                    {isMuted ? '🔇' : '🎤'}
                  </button>
                  
                  {sessionInfo.sessionType === 'video' && (
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-3 rounded-full transition-colors ${
                        !isVideoOn ? 'bg-error text-white' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                      title={isVideoOn ? '비디오 끄기' : '비디오 켜기'}
                    >
                      {isVideoOn ? '📹' : '📷'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording ? 'bg-error text-white animate-pulse' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                    title={isRecording ? '녹화 중지' : '녹화 시작'}
                  >
                    ⚫
                  </button>
                  
                  {sessionInfo.status === 'waiting' ? (
                    <button
                      onClick={handleStartSession}
                      className="bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent-600 transition-colors"
                    >
                      상담 시작
                    </button>
                  ) : (
                    <button
                      onClick={handleEndSession}
                      className="bg-error text-white px-6 py-3 rounded-full font-medium hover:bg-error-600 transition-colors"
                    >
                      상담 종료
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 채팅 영역 */}
          <div className={`flex flex-col ${sessionInfo.sessionType === 'chat' ? 'h-full' : 'h-2/5'} bg-white border-t border-background-200`}>
            <div className="px-4 py-3 bg-background-50 border-b border-background-200">
              <h3 className="font-medium text-secondary-700">채팅</h3>
            </div>
            
            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'expert' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'expert'
                      ? 'bg-primary text-white'
                      : 'bg-background-100 text-secondary-700'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'expert' ? 'text-primary-100' : 'text-secondary-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* 메시지 입력 */}
            <div className="p-4 border-t border-background-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors">
                  📎
                </button>
                <button
                  onClick={handleSendMessage}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상담 메모 사이드바 */}
        {showNotes && (
          <div className="w-1/3 bg-white border-l border-background-200 flex flex-col">
            <div className="px-4 py-3 bg-background-50 border-b border-background-200">
              <h3 className="font-medium text-secondary-700">상담 메모</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="상담 중 중요한 내용을 메모하세요..."
                className="w-full h-full resize-none border border-background-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="p-4 border-t border-background-200">
              <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-600 transition-colors">
                메모 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselingRoomPage;
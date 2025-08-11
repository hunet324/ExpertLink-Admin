import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface ChatMessage {
  id: string;
  sender: 'expert' | 'client';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
}

interface ActiveChatSession {
  id: string;
  clientName: string;
  clientId: string;
  startTime: string;
  status: 'active' | 'idle' | 'ended';
  lastActivity: string;
}

interface ChatRequest {
  id: string;
  clientName: string;
  clientId: string;
  requestTime: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
}

const ChatCounselingPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // 활성 채팅 세션 샘플 데이터
  const activeSession: ActiveChatSession | null = {
    id: 'chat_001',
    clientName: '박**',
    clientId: 'client_002',
    startTime: '2024-08-11T10:30:00',
    status: 'active',
    lastActivity: '2024-08-11T11:45:00'
  };

  // 채팅 메시지 샘플 데이터
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'client',
      content: '안녕하세요, 상담사님. 오늘 상담 시간에 맞춰서 연락드렸습니다.',
      timestamp: '2024-08-11T10:30:00',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      sender: 'expert',
      content: '안녕하세요! 박**님, 오늘 상담에 참여해주셔서 감사합니다. 편안하게 대화하실 수 있도록 도와드리겠습니다. 오늘 어떤 이야기를 나누고 싶으신가요?',
      timestamp: '2024-08-11T10:32:00',
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      sender: 'client',
      content: '요즘 직장에서 스트레스를 많이 받고 있어서요. 상사와의 관계도 좋지 않고, 업무량도 너무 많아서 힘들어하고 있습니다.',
      timestamp: '2024-08-11T10:35:00',
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      sender: 'expert',
      content: '직장에서의 스트레스는 정말 힘드시겠어요. 상사와의 관계 문제와 과도한 업무량... 두 가지 모두 많은 분들이 겪는 어려움이지만, 그렇다고 해서 가볍게 넘길 일은 아니에요. 이런 상황이 언제부터 시작되었는지 말씀해주실 수 있나요?',
      timestamp: '2024-08-11T10:37:00',
      type: 'text',
      status: 'read'
    },
    {
      id: '5',
      sender: 'client',
      content: '한 3개월 전쯤부터인 것 같아요. 팀에 새로운 상사가 오시면서 분위기가 많이 바뀌었거든요.',
      timestamp: '2024-08-11T10:40:00',
      type: 'text',
      status: 'read'
    }
  ]);

  // 채팅 요청 샘플 데이터
  const chatRequests: ChatRequest[] = [
    {
      id: 'req_001',
      clientName: '한**',
      clientId: 'client_008',
      requestTime: '2024-08-11T11:20:00',
      priority: 'medium',
      message: '오후에 채팅 상담 가능할까요? 대인관계 문제로 상담받고 싶습니다.'
    },
    {
      id: 'req_002',
      clientName: '윤**',
      clientId: 'client_009',
      requestTime: '2024-08-11T11:50:00',
      priority: 'high',
      message: '급하게 상담이 필요합니다. 지금 채팅으로 상담 받을 수 있나요?'
    }
  ];

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  const getRequestTime = (requestTime: string) => {
    const request = new Date(requestTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - request.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}시간 전`;
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

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'expert',
      content: currentMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // 메시지 전송 후 스크롤
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleEndSession = async () => {
    if (confirm('현재 진행 중인 채팅 상담을 종료하시겠습니까?')) {
      console.log('채팅 세션 종료');
      router.push(`/expert/records/write?sessionId=${activeSession?.id}`);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    console.log('채팅 요청 승인:', requestId);
    // 새 채팅 세션 시작
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
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
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">💭</span>
                채팅 상담실
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                실시간 텍스트 메시지를 통한 상담을 진행할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeSession && (
                <div className="flex items-center space-x-3 bg-background-100 px-4 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-caption font-medium text-secondary">{activeSession.clientName}님과 상담 중</div>
                    <div className="text-xs text-secondary-400">{getSessionDuration(activeSession.startTime)} 경과</div>
                  </div>
                </div>
              )}

              {/* 알림 및 프로필 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chatRequests.length}
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
            {/* 채팅 영역 */}
            <div className="flex-1 bg-white rounded-custom shadow-soft flex flex-col">
              {activeSession ? (
                <>
                  {/* 채팅 헤더 */}
                  <div className="p-4 border-b border-background-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">박</span>
                      </div>
                      <div>
                        <h3 className="text-body font-semibold text-secondary">{activeSession.clientName}</h3>
                        <p className="text-caption text-accent">온라인</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/expert/clients/profile?id=${activeSession.clientId}`)}
                        className="bg-background-100 text-secondary-600 px-3 py-2 rounded-lg text-caption hover:bg-background-200 transition-colors"
                      >
                        프로필 보기
                      </button>
                      <button
                        onClick={handleEndSession}
                        className="bg-error text-white px-3 py-2 rounded-lg text-caption hover:bg-error-600 transition-colors"
                      >
                        상담 종료
                      </button>
                    </div>
                  </div>

                  {/* 메시지 영역 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'expert' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md space-y-1 ${
                          message.sender === 'expert' ? 'items-end' : 'items-start'
                        }`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              message.sender === 'expert'
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-background-100 text-secondary-700 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-body leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className={`text-xs text-secondary-400 flex ${
                            message.sender === 'expert' ? 'justify-end space-x-1' : 'justify-start'
                          }`}>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.sender === 'expert' && message.status && (
                              <span className={`${
                                message.status === 'read' ? 'text-accent' : 'text-secondary-400'
                              }`}>
                                {message.status === 'read' ? '읽음' : '전송됨'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-background-100 rounded-2xl px-4 py-2 rounded-bl-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 메시지 입력 영역 */}
                  <div className="p-4 border-t border-background-200">
                    <div className="flex items-end space-x-3">
                      <button
                        onClick={handleFileUpload}
                        className="p-2 text-secondary-400 hover:text-primary transition-colors"
                      >
                        <span className="text-xl">📎</span>
                      </button>
                      
                      <div className="flex-1">
                        <textarea
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                          rows={1}
                          className="w-full p-3 border border-background-300 rounded-lg resize-none focus:outline-none focus:border-primary-300 text-body"
                        />
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim()}
                        className={`px-4 py-3 rounded-lg text-caption font-medium transition-colors ${
                          currentMessage.trim()
                            ? 'bg-primary text-white hover:bg-primary-600'
                            : 'bg-background-300 text-secondary-400 cursor-not-allowed'
                        }`}
                      >
                        전송
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">💬</span>
                    <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                      진행 중인 채팅 상담이 없습니다
                    </h3>
                    <p className="text-caption text-secondary-400">
                      새로운 채팅 요청을 승인하거나 예정된 상담을 시작해보세요.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 사이드 패널 */}
            <div className="w-80 space-y-6">
              {/* 채팅 요청 */}
              <div className="bg-white rounded-custom shadow-soft p-4">
                <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                  <span className="mr-2">🔔</span>
                  채팅 요청
                  {chatRequests.length > 0 && (
                    <span className="bg-error text-white text-xs px-2 py-1 rounded-full ml-2">
                      {chatRequests.length}
                    </span>
                  )}
                </h3>

                {chatRequests.length > 0 ? (
                  <div className="space-y-3">
                    {chatRequests.map((request) => (
                      <div key={request.id} className="border border-background-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-body font-medium text-secondary">{request.clientName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                            {getPriorityText(request.priority)}
                          </span>
                        </div>
                        
                        <p className="text-caption text-secondary-600 mb-3 line-clamp-2">
                          {request.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary-400">
                            {getRequestTime(request.requestTime)}
                          </span>
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-600 transition-colors"
                          >
                            승인
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📫</span>
                    <p className="text-secondary-400 text-caption">새로운 채팅 요청이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* 빠른 작업 */}
              <div className="bg-white rounded-custom shadow-soft p-4">
                <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  빠른 작업
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/expert/clients/list')}
                    className="w-full flex items-center space-x-3 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-caption font-medium text-primary group-hover:text-primary-600">내담자 목록</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/expert/records/write')}
                    className="w-full flex items-center space-x-3 p-3 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">📝</span>
                    <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">상담 기록</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/expert/dashboard/schedule')}
                    className="w-full flex items-center space-x-3 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">📅</span>
                    <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">오늘 일정</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatCounselingPage;
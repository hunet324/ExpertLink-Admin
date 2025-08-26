import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface Notification {
  id: string;
  type: 'new_request' | 'schedule_reminder' | 'system' | 'payment' | 'feedback' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionText?: string;
  clientId?: string;
  clientName?: string;
}

type NotificationFilter = 'all' | 'unread' | 'new_request' | 'schedule_reminder' | 'system' | 'payment';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // 알림 샘플 데이터
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif_001',
      type: 'new_request',
      title: '새로운 상담 요청',
      message: '정**님이 화상 상담을 요청했습니다. 8월 12일 15:00 희망',
      timestamp: '2024-08-11T10:30:00',
      isRead: false,
      priority: 'high',
      actionUrl: '/expert/dashboard/requests',
      actionText: '요청 확인',
      clientId: 'client_007',
      clientName: '정**'
    },
    {
      id: 'notif_002',
      type: 'schedule_reminder',
      title: '상담 일정 알림',
      message: '30분 후 박**님과 채팅 상담이 예정되어 있습니다.',
      timestamp: '2024-08-11T10:00:00',
      isRead: false,
      priority: 'high',
      actionUrl: '/expert/counseling/chat',
      actionText: '상담실 입장',
      clientId: 'client_002',
      clientName: '박**'
    },
    {
      id: 'notif_003',
      type: 'feedback',
      title: '피드백 요청',
      message: '김**님의 MMPI-2 검사 결과에 대한 피드백 작성이 필요합니다.',
      timestamp: '2024-08-11T09:15:00',
      isRead: true,
      priority: 'medium',
      actionUrl: '/expert/assessment/feedback',
      actionText: '피드백 작성',
      clientId: 'client_003',
      clientName: '김**'
    },
    {
      id: 'notif_004',
      type: 'message',
      title: '내담자 메시지',
      message: '이**님이 상담 후기를 남겨주셨습니다.',
      timestamp: '2024-08-11T08:45:00',
      isRead: false,
      priority: 'medium',
      actionUrl: '/expert/records/history',
      actionText: '후기 확인',
      clientId: 'client_001',
      clientName: '이**'
    },
    {
      id: 'notif_005',
      type: 'payment',
      title: '수익 정산 완료',
      message: '7월 상담료 정산이 완료되었습니다. 총 1,200,000원이 입금되었습니다.',
      timestamp: '2024-08-10T15:30:00',
      isRead: true,
      priority: 'low',
      actionUrl: '/expert/earnings',
      actionText: '내역 확인'
    },
    {
      id: 'notif_006',
      type: 'system',
      title: '시스템 업데이트',
      message: '새로운 기능이 추가되었습니다. 화상 상담 중 화면 공유 기능을 이용해보세요.',
      timestamp: '2024-08-10T12:00:00',
      isRead: true,
      priority: 'low',
      actionUrl: '/expert/counseling/video',
      actionText: '기능 확인'
    },
    {
      id: 'notif_007',
      type: 'schedule_reminder',
      title: '일정 변경 알림',
      message: '한**님이 8월 13일 11:00 음성 상담 일정을 8월 14일 14:00로 변경 요청했습니다.',
      timestamp: '2024-08-10T11:20:00',
      isRead: false,
      priority: 'medium',
      actionUrl: '/expert/dashboard/requests',
      actionText: '승인/거절',
      clientId: 'client_008',
      clientName: '한**'
    },
    {
      id: 'notif_008',
      type: 'new_request',
      title: '긴급 상담 요청',
      message: '윤**님이 긴급 상담을 요청했습니다. 즉시 응답이 필요합니다.',
      timestamp: '2024-08-09T16:45:00',
      isRead: true,
      priority: 'high',
      actionUrl: '/expert/dashboard/requests',
      actionText: '긴급 응답',
      clientId: 'client_009',
      clientName: '윤**'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_request': return '📝';
      case 'schedule_reminder': return '⏰';
      case 'system': return '🔔';
      case 'payment': return '💰';
      case 'feedback': return '📋';
      case 'message': return '💬';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_request': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'schedule_reminder': return 'bg-error-100 text-error-700 border-error-200';
      case 'system': return 'bg-secondary-100 text-secondary-700 border-secondary-200';
      case 'payment': return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'feedback': return 'bg-logo-point/20 text-logo-point border-logo-point/30';
      case 'message': return 'bg-background-200 text-secondary-600 border-background-300';
      default: return 'bg-background-200 text-secondary-600 border-background-300';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new_request': return '상담 요청';
      case 'schedule_reminder': return '일정 알림';
      case 'system': return '시스템';
      case 'payment': return '정산';
      case 'feedback': return '피드백';
      case 'message': return '메시지';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-error bg-error-25';
      case 'medium': return 'border-l-primary bg-primary-25';
      case 'low': return 'border-l-secondary-300 bg-background-25';
      default: return 'border-l-secondary-300 bg-background-25';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getFilterCount = (filterType: NotificationFilter) => {
    if (filterType === 'all') return notifications.length;
    if (filterType === 'unread') return unreadCount;
    return notifications.filter(n => n.type === filterType).length;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      // 읽음 처리
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    if (confirm('모든 알림을 읽음 처리하시겠습니까?')) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm('이 알림을 삭제하시겠습니까?')) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    const currentNotificationIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === currentNotificationIds.length ? [] : currentNotificationIds
    );
  };

  const handleBatchDelete = () => {
    if (selectedNotifications.length === 0) return;
    
    if (confirm(`선택한 ${selectedNotifications.length}개의 알림을 삭제하시겠습니까?`)) {
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
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
                <span className="mr-3 text-2xl">🔔</span>
                알림
                {unreadCount > 0 && (
                  <span className="ml-3 bg-error text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                새로운 소식과 중요한 알림을 확인하세요.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 일괄 작업 버튼 */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBatchDelete}
                    className="bg-error text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                  >
                    선택 삭제 ({selectedNotifications.length})
                  </button>
                </div>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  모두 읽음 처리
                </button>
              )}

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
          {/* 필터 탭 */}
          <div className="mb-6">
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all' as NotificationFilter, label: '전체' },
                  { key: 'unread' as NotificationFilter, label: '읽지 않음' },
                  { key: 'new_request' as NotificationFilter, label: '상담 요청' },
                  { key: 'schedule_reminder' as NotificationFilter, label: '일정 알림' },
                  { key: 'feedback' as NotificationFilter, label: '피드백' },
                  { key: 'payment' as NotificationFilter, label: '정산' },
                  { key: 'system' as NotificationFilter, label: '시스템' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      filter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {getFilterCount(tab.key) > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        filter === tab.key
                          ? 'bg-white text-primary'
                          : 'bg-background-200 text-secondary-500'
                      }`}>
                        {getFilterCount(tab.key)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              <>
                {/* 전체 선택 체크박스 */}
                <div className="bg-white rounded-custom shadow-soft p-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-caption text-secondary-600">
                    전체 선택 ({selectedNotifications.length}/{filteredNotifications.length})
                  </span>
                </div>

                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-custom shadow-soft border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'ring-2 ring-primary-100' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* 선택 체크박스 */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="mt-1 w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-500 focus:ring-2"
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* 알림 아이콘 */}
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        </div>

                        {/* 알림 내용 */}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className={`text-body font-semibold ${
                                notification.isRead ? 'text-secondary-600' : 'text-secondary'
                              }`}>
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                                {getTypeText(notification.type)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-caption text-secondary-400">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className={`text-body leading-relaxed mb-3 ${
                            notification.isRead ? 'text-secondary-500' : 'text-secondary-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {notification.clientName && (
                            <div className="mb-3">
                              <span className="bg-background-100 text-secondary-600 px-2 py-1 rounded text-caption">
                                👤 {notification.clientName}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            {notification.actionUrl && (
                              <button className="bg-primary text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors">
                                {notification.actionText || '확인'}
                              </button>
                            )}
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption hover:bg-background-300 transition-colors"
                              >
                                읽음 처리
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-error hover:text-error-600 text-caption transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">🔔</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400">
                  {filter === 'all' 
                    ? '새로운 알림이 도착하면 여기에 표시됩니다.' 
                    : '다른 필터를 선택하여 알림을 확인해보세요.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
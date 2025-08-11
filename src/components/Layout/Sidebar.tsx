import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number | string;
  children?: MenuItem[];
}

interface SidebarProps {
  userType: 'expert' | 'admin';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userType, isCollapsed = false, onToggleCollapse }) => {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);

  // 전문가용 메뉴
  const expertMenus: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: '🏠',
      path: '/expert/dashboard',
      children: [
        { id: 'today-schedule', label: '오늘 일정', icon: '📅', path: '/expert/dashboard/schedule' },
        { id: 'new-requests', label: '신규 요청', icon: '🔔', path: '/expert/dashboard/requests', badge: 3 }
      ]
    },
    {
      id: 'clients',
      label: '내담자 관리',
      icon: '👥',
      path: '/expert/clients',
      children: [
        { id: 'client-list', label: '내담자 리스트', icon: '📋', path: '/expert/clients/list' },
        { id: 'client-profile', label: '내담자 프로필', icon: '👤', path: '/expert/clients/profile' },
        { id: 'calendar', label: '일정 캘린더', icon: '🗓️', path: '/expert/clients/calendar' }
      ]
    },
    {
      id: 'counseling',
      label: '상담실',
      icon: '💬',
      path: '/expert/counseling',
      children: [
        { id: 'video-call', label: '화상 상담', icon: '🎥', path: '/expert/counseling/video' },
        { id: 'chat', label: '채팅 상담', icon: '💭', path: '/expert/counseling/chat' },
        { id: 'voice-call', label: '음성 상담', icon: '🎧', path: '/expert/counseling/voice' }
      ]
    },
    {
      id: 'records',
      label: '상담 기록',
      icon: '📝',
      path: '/expert/records',
      children: [
        { id: 'write-record', label: '상담 기록 작성', icon: '✍️', path: '/expert/records/write' },
        { id: 'record-history', label: '상담 이력', icon: '📚', path: '/expert/records/history' }
      ]
    },
    {
      id: 'assessment',
      label: '검사 피드백',
      icon: '📊',
      path: '/expert/assessment',
      children: [
        { id: 'test-results', label: '검사 결과 열람', icon: '📈', path: '/expert/assessment/results' },
        { id: 'feedback', label: '피드백 작성', icon: '📋', path: '/expert/assessment/feedback' }
      ]
    },
    {
      id: 'profile',
      label: '프로필 관리',
      icon: '⚙️',
      path: '/expert/profile'
    },
    {
      id: 'notifications',
      label: '알림',
      icon: '🔔',
      path: '/expert/notifications',
      badge: 5
    },
    {
      id: 'vacation',
      label: '휴무 설정',
      icon: '🏖️',
      path: '/expert/vacation'
    }
  ];

  // 관리자용 메뉴
  const adminMenus: MenuItem[] = [
    {
      id: 'approval',
      label: '승인 관리',
      icon: '✅',
      path: '/admin/approval',
      children: [
        { id: 'user-approval', label: '사용자 승인', icon: '👤', path: '/admin/approval/users', badge: 12 },
        { id: 'expert-approval', label: '전문가 승인', icon: '👨‍⚕️', path: '/admin/approval/experts', badge: 3 }
      ]
    },
    {
      id: 'cms',
      label: 'CMS 관리',
      icon: '⚙️',
      path: '/admin/cms',
      children: [
        { id: 'survey-editor', label: '설문 문항 편집', icon: '📝', path: '/admin/cms/survey' },
        { id: 'logic-editor', label: '분기 로직 편집', icon: '🔀', path: '/admin/cms/logic' }
      ]
    },
    {
      id: 'partnership',
      label: '제휴 관리',
      icon: '🤝',
      path: '/admin/partnership',
      children: [
        { id: 'hospital-manage', label: '병원 등록/수정', icon: '🏥', path: '/admin/partnership/hospitals' },
        { id: 'test-items', label: '검사 항목 등록/수정', icon: '🧪', path: '/admin/partnership/tests' }
      ]
    },
    {
      id: 'statistics',
      label: '통계 관리',
      icon: '📊',
      path: '/admin/statistics',
      children: [
        { id: 'payment-history', label: '결제 내역', icon: '💳', path: '/admin/statistics/payments' },
        { id: 'revenue-stats', label: '매출 통계', icon: '💰', path: '/admin/statistics/revenue' }
      ]
    },
    {
      id: 'system',
      label: '시스템',
      icon: '🖥️',
      path: '/admin/system',
      children: [
        { id: 'operation-log', label: '운영 로그', icon: '📋', path: '/admin/system/logs' },
        { id: 'user-management', label: '전체 사용자 목록', icon: '👥', path: '/admin/system/users' },
        { id: 'expert-management', label: '상담사 목록', icon: '👨‍⚕️', path: '/admin/system/experts' },
        { id: 'notification-settings', label: '알림 템플릿 관리', icon: '🔔', path: '/admin/system/notifications' },
        { id: 'log-management', label: '사용자 활동 로그', icon: '📊', path: '/admin/system/activity-logs' },
        { id: 'settings', label: '운영 기본 설정', icon: '⚙️', path: '/admin/system/settings' },
        { id: 'permissions', label: '관리자 권한 설정', icon: '🔐', path: '/admin/system/permissions' },
        { id: 'password-change', label: '비밀번호 변경', icon: '🔑', path: '/admin/system/password' }
      ]
    }
  ];

  const menus = userType === 'expert' ? expertMenus : adminMenus;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = async (menu: MenuItem) => {
    if (menu.children) {
      // 대시보드 메뉴인 경우 페이지 이동을 우선 처리
      if (menu.id === 'dashboard') {
        await router.push(menu.path);
      }
      // 토글은 페이지 이동 후 처리
      toggleMenu(menu.id);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);

  return (
    <div className={`bg-secondary text-white h-screen transition-all duration-smooth ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col shadow-large`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-secondary-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-h3 font-bold text-white">ExpertLink</h1>
              <p className="text-caption text-secondary-200 mt-1">
                {userType === 'expert' ? '전문가 대시보드' : '관리자 패널'}
              </p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-secondary-600 transition-colors"
            aria-label="사이드바 토글"
          >
            <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
          </button>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menus.map((menu) => (
            <li key={menu.id}>
              {/* 메인 메뉴 */}
              <div>
                {menu.children ? (
                  <button
                    onClick={() => handleMenuClick(menu)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left
                              transition-all duration-smooth hover:bg-secondary-600 group ${
                                isActive(menu.path) ? 'bg-secondary-600 text-white' : 'text-secondary-200'
                              }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg flex-shrink-0">{menu.icon}</span>
                      {!isCollapsed && (
                        <span className="text-caption font-medium">{menu.label}</span>
                      )}
                    </div>
                    {!isCollapsed && menu.children && (
                      <span className={`text-xs transition-transform duration-smooth ${
                        isMenuExpanded(menu.id) ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </span>
                    )}
                    {menu.badge && (
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {menu.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={menu.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg
                              transition-all duration-smooth hover:bg-secondary-600 group ${
                                isActive(menu.path) ? 'bg-secondary-600 text-white' : 'text-secondary-200'
                              }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg flex-shrink-0">{menu.icon}</span>
                      {!isCollapsed && (
                        <span className="text-caption font-medium">{menu.label}</span>
                      )}
                    </div>
                    {menu.badge && (
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {menu.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* 서브 메뉴 */}
              {menu.children && isMenuExpanded(menu.id) && !isCollapsed && (
                <ul className="ml-6 mt-2 space-y-1 border-l border-secondary-600 pl-4">
                  {menu.children.map((subMenu) => (
                    <li key={subMenu.id}>
                      <Link
                        href={subMenu.path}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-caption
                                  transition-all duration-smooth hover:bg-secondary-600 ${
                                    isActive(subMenu.path) ? 'bg-secondary-600 text-white' : 'text-secondary-300'
                                  }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{subMenu.icon}</span>
                          <span>{subMenu.label}</span>
                        </div>
                        {subMenu.badge && (
                          <span className="bg-accent text-white text-xs px-2 py-1 rounded-full min-w-[16px] text-center">
                            {subMenu.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 프로필 */}
      <div className="p-4 border-t border-secondary-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">김</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption font-medium text-white truncate">김상담사</p>
              <p className="text-xs text-secondary-300 truncate">
                {userType === 'expert' ? '임상심리사' : '시스템 관리자'}
              </p>
            </div>
            <button className="p-1 hover:bg-secondary-600 rounded transition-colors">
              <span className="text-secondary-300">⋯</span>
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-bold">김</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
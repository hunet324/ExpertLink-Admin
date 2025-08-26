import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStore } from '@/store/useStore';
import { useSidebar } from '@/contexts/SidebarContext';
import { UserType } from '@/types/user';
import { canAccessMenu, hasMinPermissionLevel, isAdmin } from '@/utils/permissions';
import PermissionGuard from '@/components/PermissionGuard';
import AdminLevelBadge from '@/components/AdminLevelBadge';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number | string;
  children?: MenuItem[];
  // 권한 관련 필드
  minLevel?: UserType;
  adminOnly?: boolean;
  centerManagerOnly?: boolean;
  superAdminOnly?: boolean;
  requiresCenter?: boolean;
}

interface SidebarProps {
  userType: UserType | null;
}

const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const { isCollapsed, toggleSidebar, toggleMenu, openSingleMenu, expandedMenus, isMenuExpanded, setExpandedMenus, isHydrated } = useSidebar();
  const router = useRouter();
  const { logout, isLoading, pendingExpertsCount } = useStore();

  // 현재 경로를 기반으로 메뉴 자동 확장 (hydration 완료 후, 페이지 이동 시에만)
  useEffect(() => {
    // hydration이 완료되지 않았거나 userType이 없으면 아무것도 하지 않음
    if (!isHydrated || !userType) return;
    
    const currentPath = router.pathname;
    console.log('페이지 이동 감지:', currentPath);
    
    // 관리자 메뉴와 전문가 메뉴에 대한 기본 정의 (간단화)
    const basicMenuPaths: { [key: string]: string[] } = {
      '/admin/centers': ['centers'],
      '/admin/experts': ['experts'],
      '/admin/cms': ['cms'],
      '/admin/statistics': ['statistics'],
      '/admin/system': ['system'],
      '/admin/super-admin': ['super-admin'],
      '/expert/dashboard': ['dashboard'],
      '/expert/clients': ['clients'],
      '/expert/counseling': ['counseling'],
      '/expert/assessment': ['assessment']
    };
    
    // 현재 경로에 맞는 부모 메뉴 찾기
    let parentMenuIds: string[] = [];
    for (const [path, menuIds] of Object.entries(basicMenuPaths)) {
      if (currentPath.startsWith(path)) {
        parentMenuIds = menuIds;
        break;
      }
    }
    
    // 페이지 이동 시에만 메뉴 상태 변경
    if (parentMenuIds.length > 0) {
      const targetMenuId = parentMenuIds[0];
      console.log(`페이지 이동으로 인한 메뉴 ${targetMenuId} 자동 확장`);
      
      // 약간의 지연을 두어 사용자의 수동 조작과 구분
      const timeoutId = setTimeout(() => {
        openSingleMenu(targetMenuId);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [router.pathname, userType, isHydrated]);

  // userType이 null인 경우 기본값 처리
  if (!userType) {
    return (
      <div className={`bg-secondary text-white h-screen transition-all duration-smooth ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col shadow-large`}>
        <div className="p-4 border-b border-secondary-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-h3 font-bold text-white">ExpertLink</h1>
                <p className="text-caption text-secondary-200">로딩 중...</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-secondary-600 transition-colors"
            >
              <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-secondary-200 text-sm">사용자 정보 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

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

  // 관리자용 메뉴 (권한 체계 통일)
  const adminMenus: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: '🏠',
      path: '/admin/dashboard',
      minLevel: 'staff' // 🎯 통일: adminOnly → minLevel
    },
    {
      id: 'centers',
      label: '센터 관리',
      icon: '🏢',
      path: '/admin/centers',
      minLevel: 'center_manager', // 🎯 통일: centerManagerOnly → minLevel
      children: [
        { id: 'center-list', label: '센터 목록', icon: '📋', path: '/admin/centers/list', minLevel: 'center_manager' },
        { id: 'center-create', label: '센터 등록', icon: '➕', path: '/admin/centers/create', minLevel: 'super_admin' } // 🎯 통일: superAdminOnly → minLevel
      ]
    },
    {
      id: 'experts',
      label: '전문가 관리',
      icon: '👨‍⚕️',
      path: '/admin/experts',
      minLevel: 'center_manager', // 🎯 통일
      children: [
        { id: 'expert-list', label: '전문가 목록', icon: '📋', path: '/admin/experts/list', minLevel: 'center_manager' },
        { id: 'expert-approval', label: '전문가 승인', icon: '✅', path: '/admin/approval/experts', badge: pendingExpertsCount > 0 ? pendingExpertsCount : undefined, minLevel: 'staff' },
        { id: 'vacation-management', label: '휴가 관리', icon: '🏖️', path: '/admin/experts/vacation', minLevel: 'center_manager' },
        { id: 'schedule-management', label: '스케줄 관리', icon: '📅', path: '/admin/experts/schedule', minLevel: 'center_manager' },
        { id: 'working-hours', label: '근무시간 모니터링', icon: '⏰', path: '/admin/experts/working-hours', minLevel: 'center_manager' }
      ]
    },
    {
      id: 'cms',
      label: 'CMS 관리',
      icon: '⚙️',
      path: '/admin/cms',
      minLevel: 'staff', // 🎯 통일: adminOnly → minLevel
      children: [
        { id: 'survey-editor', label: '설문 문항 편집', icon: '📝', path: '/admin/cms/questions', minLevel: 'staff' },
        { id: 'logic-editor', label: '분기 로직 편집', icon: '🔀', path: '/admin/cms/logic', minLevel: 'staff' }
      ]
    },
    {
      id: 'statistics',
      label: '통계 관리',
      icon: '📊',
      path: '/admin/statistics',
      minLevel: 'staff', // 🎯 통일: adminOnly → minLevel
      children: [
        { id: 'payment-history', label: '결제 내역', icon: '💳', path: '/admin/statistics/payments', minLevel: 'center_manager' }, // 🎯 통일
        { id: 'revenue-stats', label: '매출 통계', icon: '💰', path: '/admin/statistics/revenue', minLevel: 'center_manager' } // 🎯 통일
      ]
    },
    {
      id: 'system',
      label: '시스템',
      icon: '🖥️',
      path: '/admin/system',
      minLevel: 'staff', // 🎯 통일: adminOnly → minLevel
      children: [
        { id: 'operation-log', label: '운영 로그', icon: '📋', path: '/admin/system/logs', minLevel: 'staff' }, // 🎯 통일
        { id: 'user-management', label: '전체 사용자 목록', icon: '👥', path: '/admin/system/users', minLevel: 'center_manager' }, // 🎯 통일
        { id: 'expert-management', label: '상담사 목록', icon: '👨‍⚕️', path: '/admin/system/experts', minLevel: 'center_manager' }, // 🎯 통일
        { id: 'notification-settings', label: '알림 템플릿 관리', icon: '🔔', path: '/admin/system/notifications', minLevel: 'regional_manager' },
        { id: 'log-management', label: '사용자 활동 로그', icon: '📊', path: '/admin/system/activity-logs', minLevel: 'regional_manager' },
        { id: 'settings', label: '운영 기본 설정', icon: '⚙️', path: '/admin/system/settings', minLevel: 'super_admin' }, // 🎯 통일
        { id: 'admin-permissions', label: '관리자 권한 설정', icon: '🔐', path: '/admin/system/permissions', minLevel: 'super_admin' }, // 🎯 통일
        { id: 'password-change', label: '비밀번호 변경', icon: '🔑', path: '/admin/system/password', minLevel: 'staff' } // 🎯 통일
      ]
    },
    // 🎯 수퍼관리자 전용 기능 (3단계 확장)
    {
      id: 'super-admin',
      label: '최고 관리자',
      icon: '👑',
      path: '/admin/super-admin',
      minLevel: 'super_admin',
      children: [
        { id: 'global-dashboard', label: '전체 시스템 현황', icon: '🌐', path: '/admin/super-admin/global-dashboard', minLevel: 'super_admin' },
        { id: 'admin-accounts', label: '관리자 계정 관리', icon: '👤', path: '/admin/super-admin/admin-accounts', minLevel: 'super_admin' },
        { id: 'global-settings', label: '글로벌 시스템 설정', icon: '🔧', path: '/admin/super-admin/global-settings', minLevel: 'super_admin' },
        { id: 'security-policy', label: '보안 정책 관리', icon: '🔒', path: '/admin/super-admin/security-policy', minLevel: 'super_admin' },
        { id: 'system-monitoring', label: '시스템 모니터링', icon: '📈', path: '/admin/super-admin/system-monitoring', minLevel: 'super_admin' },
        { id: 'backup-restore', label: '백업 및 복원', icon: '💾', path: '/admin/super-admin/backup-restore', minLevel: 'super_admin' },
        { id: 'audit-trails', label: '감사 추적', icon: '🔍', path: '/admin/super-admin/audit-trails', minLevel: 'super_admin' }
      ]
    }
  ];


  // 권한에 따른 메뉴 필터링 (통일된 권한 체계 사용)
  const filterMenusByPermission = (menus: MenuItem[], userType: UserType): MenuItem[] => {
    return menus.filter(menu => {
      // 🎯 수퍼관리자 우선 처리 - 모든 메뉴에 접근 가능
      if (userType === ('super_admin' as UserType)) {
        // 서브메뉴만 필터링하고 부모는 항상 유지
        if (menu.children) {
          menu.children = filterMenusByPermission(menu.children, userType);
        }
        return true;
      }
      
      // 🎯 통일된 권한 체크 - minLevel만 사용
      if (menu.minLevel && !hasMinPermissionLevel(userType, menu.minLevel)) {
        return false;
      }
      
      // 🎯 레거시 속성 지원 (하위 호환성)
      if (menu.adminOnly && !isAdmin(userType)) return false;
      if (menu.centerManagerOnly && !hasMinPermissionLevel(userType, 'center_manager')) return false;
      if (menu.superAdminOnly && (!userType || userType !== ('super_admin' as UserType))) return false;
      
      // 서브메뉴 필터링
      if (menu.children) {
        menu.children = filterMenusByPermission(menu.children, userType);
        
        // 🎯 부모 메뉴 접근 권한 체크 (통일된 방식)
        const hasParentAccess = !menu.minLevel || hasMinPermissionLevel(userType, menu.minLevel);
        
        // 🎯 레거시 권한도 체크
        const hasLegacyAccess = (
          (menu.adminOnly && isAdmin(userType)) ||
          (menu.centerManagerOnly && hasMinPermissionLevel(userType, 'center_manager')) ||
          (menu.superAdminOnly && userType === ('super_admin' as UserType))
        );
        
        // 부모 메뉴에 접근 권한이 있으면 서브메뉴가 없어도 유지
        if (menu.children.length === 0 && !hasParentAccess && !hasLegacyAccess) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 메뉴 선택 및 폴백 처리
  let menus: MenuItem[] = [];
  
  if (userType === 'expert') {
    menus = expertMenus;
  } else {
    menus = filterMenusByPermission(adminMenus, userType);
    
    // 🎯 디버깅 로그 (통일된 권한 체계)
    console.log('메뉴 필터링 결과:', {
      userType,
      originalMenuCount: adminMenus.length,
      filteredMenuCount: menus.length,
      menuIds: menus.map(m => m.id),
      permissionLevels: {
        hasStaffLevel: hasMinPermissionLevel(userType, 'staff'),
        hasCenterManagerLevel: hasMinPermissionLevel(userType, 'center_manager'),
        hasRegionalManagerLevel: hasMinPermissionLevel(userType, 'regional_manager'),
        isSuperAdmin: userType === ('super_admin' as UserType)
      }
    });
    
    // 🎯 수퍼관리자 안전장치: 메뉴가 비어있으면 기본 메뉴라도 제공
    if (menus.length === 0 && userType === ('super_admin' as UserType)) {
      console.warn('수퍼관리자 메뉴가 비어있음, 기본 메뉴 제공');
      menus = [
        {
          id: 'dashboard',
          label: '대시보드',
          icon: '🏠',
          path: '/admin/dashboard'
        },
        {
          id: 'centers',
          label: '센터 관리',
          icon: '🏢',
          path: '/admin/centers/list'
        },
        {
          id: 'system',
          label: '시스템 관리',
          icon: '🖥️',
          path: '/admin/system',
          children: [
            { id: 'users', label: '사용자 관리', icon: '👥', path: '/admin/system/users' },
            { id: 'settings', label: '설정', icon: '⚙️', path: '/admin/system/settings' }
          ]
        }
      ];
    }
  }

  // toggleMenu는 이제 컨텍스트에서 가져옴

  const handleMenuClick = async (menu: MenuItem) => {
    if (menu.children) {
      // 대시보드 메뉴인 경우 페이지 이동을 우선 처리
      if (menu.id === 'dashboard') {
        await router.push(menu.path);
      }
      
      // 사용자가 직접 클릭할 때는 단순 토글 (다른 메뉴 닫지 않음)
      toggleMenu(menu.id);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  // isMenuExpanded는 이제 컨텍스트에서 가져옴

  const handleLogout = async () => {
    if (isLoading) return; // 중복 클릭 방지
    
    try {
      console.log('로그아웃 시작');
      await logout();
      console.log('로그아웃 성공, 로그인 페이지로 이동');
      // 강제 리다이렉트로 루터 간섭 방지
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화하고 로그인 페이지로 이동
      window.location.href = '/login';
    }
  };

  return (
    <div className={`bg-secondary text-white h-screen transition-all duration-smooth ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col shadow-large`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-secondary-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-h3 font-bold text-white">ExpertLink</h1>
                {isAdmin(userType) && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
              <p className="text-caption text-secondary-200">
                {userType === 'expert' ? '전문가 대시보드' : '관리자 패널'}
              </p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
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
                        isHydrated && isMenuExpanded(menu.id) ? 'rotate-90' : ''
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

              {/* 서브 메뉴 (hydration 완료 후에만 렌더링) */}
              {menu.children && isHydrated && isMenuExpanded(menu.id) && !isCollapsed && (
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
                        <div className="flex items-center">
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

      {/* 하단 로그아웃 */}
      <div className="p-4 border-t border-secondary-700">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-3 py-3 rounded-lg text-white
                    transition-all duration-smooth border ${
                      isLoading 
                        ? 'opacity-50 cursor-not-allowed bg-secondary-600 border-secondary-500' 
                        : 'hover:bg-secondary-600 bg-secondary-700 border-secondary-500 hover:border-error-400'
                    }`}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-lg">🚪</span>
              <span className="text-caption font-medium">
                {isLoading ? '로그아웃 중...' : '로그아웃'}
              </span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-lg">🚪</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
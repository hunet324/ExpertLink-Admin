// 모바일 반응형 네비게이션 컴포넌트

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStore } from '@/store/useStore';
import { UserType } from '@/types/user';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { hasMinPermissionLevel, isAdmin } from '@/utils/permissions';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number | string;
  children?: MenuItem[];
  minLevel?: UserType;
  adminOnly?: boolean;
  centerManagerOnly?: boolean;
  superAdminOnly?: boolean;
}

interface MobileNavigationProps {
  userType: UserType;
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ userType, isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout, isLoading } = useStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);

  // 권한에 따른 메뉴 필터링
  const filterMenusByPermission = (menus: MenuItem[]): MenuItem[] => {
    return menus.filter(menu => {
      if (userType === ('super_admin' as any)) {
        if (menu.children) {
          menu.children = filterMenusByPermission(menu.children);
        }
        return true;
      }
      
      if (menu.minLevel && !hasMinPermissionLevel(userType, menu.minLevel)) {
        return false;
      }
      
      if (menu.adminOnly && !isAdmin(userType)) return false;
      if (menu.centerManagerOnly && !hasMinPermissionLevel(userType, 'center_manager')) return false;
      if (menu.superAdminOnly && userType !== ('super_admin' as any)) return false;
      
      if (menu.children) {
        menu.children = filterMenusByPermission(menu.children);
      }
      
      return true;
    });
  };

  // 관리자용 메뉴 (간소화된 버전)
  const adminMenus: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: '🏠',
      path: '/admin/dashboard',
      minLevel: 'staff'
    },
    {
      id: 'centers',
      label: '센터 관리',
      icon: '🏢',
      path: '/admin/centers',
      minLevel: 'center_manager',
      children: [
        { id: 'center-list', label: '센터 목록', icon: '📋', path: '/admin/centers/list', minLevel: 'center_manager' },
        { id: 'center-experts', label: '센터 전문가', icon: '👨‍⚕️', path: '/admin/centers/experts', minLevel: 'center_manager' }
      ]
    },
    {
      id: 'experts',
      label: '전문가 관리',
      icon: '👨‍⚕️',
      path: '/admin/experts',
      minLevel: 'center_manager',
      children: [
        { id: 'expert-list', label: '전문가 목록', icon: '📋', path: '/admin/experts/list', minLevel: 'center_manager' },
        { id: 'vacation-management', label: '휴가 관리', icon: '🏖️', path: '/admin/experts/vacation', minLevel: 'center_manager' }
      ]
    },
    {
      id: 'approval',
      label: '승인 관리',
      icon: '✅',
      path: '/admin/approval',
      minLevel: 'staff'
    },
    {
      id: 'super-admin',
      label: '최고 관리자',
      icon: '👑',
      path: '/admin/super-admin',
      minLevel: 'super_admin',
      children: [
        { id: 'global-dashboard', label: '전체 시스템 현황', icon: '🌐', path: '/admin/super-admin/global-dashboard', minLevel: 'super_admin' },
        { id: 'admin-accounts', label: '관리자 계정 관리', icon: '👤', path: '/admin/super-admin/admin-accounts', minLevel: 'super_admin' }
      ]
    }
  ];

  const filteredMenus = filterMenusByPermission(adminMenus);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (menu: MenuItem) => {
    if (menu.children) {
      toggleMenu(menu.id);
    } else {
      router.push(menu.path);
      onClose();
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;
    
    try {
      await logout();
      onClose();
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* 모바일 사이드바 */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-lg font-bold text-gray-900">ExpertLink</h1>
                <AdminLevelBadge userType={userType} size="sm" />
              </div>
              <p className="text-sm text-gray-600">
                {userType === 'expert' ? '전문가 대시보드' : '관리자 패널'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="메뉴 닫기"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || '관'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || '관리자'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredMenus.map((menu) => (
              <li key={menu.id}>
                {/* 메인 메뉴 */}
                <button
                  onClick={() => handleMenuClick(menu)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                    isActive(menu.path) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{menu.icon}</span>
                    <span className="font-medium">{menu.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {menu.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {menu.badge}
                      </span>
                    )}
                    {menu.children && (
                      <span className={`text-xs transition-transform duration-200 ${
                        expandedMenus.includes(menu.id) ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </span>
                    )}
                  </div>
                </button>

                {/* 서브 메뉴 */}
                {menu.children && expandedMenus.includes(menu.id) && (
                  <ul className="ml-6 mt-2 space-y-1 border-l border-gray-200 pl-4">
                    {menu.children.map((subMenu) => (
                      <li key={subMenu.id}>
                        <Link
                          href={subMenu.path}
                          onClick={onClose}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            isActive(subMenu.path) 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">{subMenu.icon}</span>
                          <span className="text-sm">{subMenu.label}</span>
                          {subMenu.badge && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">
              {isLoading ? '로그아웃 중...' : '로그아웃'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
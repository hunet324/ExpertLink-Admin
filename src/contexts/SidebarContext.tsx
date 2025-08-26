import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  expandedMenus: string[];
  toggleMenu: (menuId: string) => void;
  openSingleMenu: (menuId: string) => void;
  setExpandedMenus: (menuIds: string[]) => void;
  isMenuExpanded: (menuId: string) => boolean;
  isHydrated: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // SSR 호환을 위해 초기값을 하드코딩하고, useEffect에서 localStorage 로드
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedMenus, setExpandedMenusState] = useState<string[]>(['dashboard']);
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트에서만 localStorage 값 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 사이드바 접힘 상태 로드
      const savedCollapsed = localStorage.getItem('sidebar-collapsed');
      if (savedCollapsed) {
        setIsCollapsed(JSON.parse(savedCollapsed));
      }

      // 확장된 메뉴 목록 로드
      const savedExpandedMenus = localStorage.getItem('sidebar-expanded-menus');
      if (savedExpandedMenus) {
        setExpandedMenusState(JSON.parse(savedExpandedMenus));
      }

      setIsHydrated(true);
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Hydration 완료 후에만 localStorage에 저장
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    // Hydration 완료 후에만 localStorage에 저장
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  };

  const toggleMenu = (menuId: string) => {
    const newExpandedMenus = expandedMenus.includes(menuId)
      ? expandedMenus.filter(id => id !== menuId)
      : [...expandedMenus, menuId];
    
    setExpandedMenusState(newExpandedMenus);
    
    // Hydration 완료 후에만 localStorage에 저장
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-menus', JSON.stringify(newExpandedMenus));
    }
  };

  // 하나의 메뉴만 열고 나머지는 모두 닫기
  const openSingleMenu = (menuId: string) => {
    const newExpandedMenus = [menuId];
    
    setExpandedMenusState(newExpandedMenus);
    
    // Hydration 완료 후에만 localStorage에 저장
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-menus', JSON.stringify(newExpandedMenus));
    }
  };

  const setExpandedMenus = (menuIds: string[]) => {
    setExpandedMenusState(menuIds);
    // Hydration 완료 후에만 localStorage에 저장
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-menus', JSON.stringify(menuIds));
    }
  };

  const isMenuExpanded = (menuId: string) => {
    return expandedMenus.includes(menuId);
  };

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      expandedMenus,
      toggleMenu,
      openSingleMenu,
      setExpandedMenus,
      isMenuExpanded,
      isHydrated
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
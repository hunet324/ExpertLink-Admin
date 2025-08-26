// 관리자 페이지용 공통 레이아웃 컴포넌트

import React from 'react';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import Sidebar from './Sidebar';
import ResponsiveHeader from './ResponsiveHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useStore();
  
  const userType = getUserType(user);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <Sidebar userType={userType} />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        {userType && (
          <ResponsiveHeader
            userType={userType}
          />
        )}

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
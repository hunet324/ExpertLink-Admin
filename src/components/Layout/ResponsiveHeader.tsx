// 반응형 헤더 컴포넌트

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStore } from '@/store/useStore';
import { UserType } from '@/types/user';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import MobileNavigation from '@/components/Navigation/MobileNavigation';

interface ResponsiveHeaderProps {
  userType: UserType;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ 
  userType, 
  title, 
  subtitle, 
  actions 
}) => {
  const router = useRouter();
  const { user } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDefaultTitle = () => {
    switch (userType) {
      case 'super_admin': return '🌐 최고 관리자 대시보드';
      case 'regional_manager': return '🏗️ 지역 관리자 대시보드';
      case 'center_manager': return '🏢 센터 관리자 대시보드';
      case 'staff': return '📊 관리자 대시보드';
      case 'expert': return '👨‍⚕️ 전문가 대시보드';
      default: return '📊 관리자 대시보드';
    }
  };

  const getDefaultSubtitle = () => {
    switch (userType) {
      case 'super_admin': return '전체 시스템 통합 관리 및 모니터링';
      case 'regional_manager': return '지역별 센터 및 성과 관리';
      case 'center_manager': return '센터 운영 및 전문가 관리';
      case 'staff': return '일일 업무 및 승인 관리';
      case 'expert': return '상담 및 내담자 관리';
      default: return 'ExpertLink 플랫폼 관리';
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 왼쪽: 로고 및 모바일 메뉴 버튼 */}
            <div className="flex items-center gap-4">
              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="메뉴 열기"
              >
                <span className="text-xl">☰</span>
              </button>

              {/* 로고 및 타이틀 */}
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="text-2xl">🔗</div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900">ExpertLink</h1>
                  <div className="flex items-center gap-2">
                    <AdminLevelBadge userType={userType} size="xs" />
                  </div>
                </div>
              </Link>
            </div>

            {/* 가운데: 페이지 제목 (데스크톱에서만) */}
            <div className="hidden lg:block flex-1 max-w-lg mx-8">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {title || getDefaultTitle()}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {subtitle || getDefaultSubtitle()}
                </p>
              )}
            </div>

            {/* 오른쪽: 액션 버튼들 및 사용자 정보 */}
            <div className="flex items-center gap-3">
              {/* 시스템 상태 표시 */}
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">정상</span>
              </div>

              {/* 액션 버튼들 */}
              {actions && (
                <div className="hidden md:flex items-center gap-2">
                  {actions}
                </div>
              )}

              {/* 사용자 메뉴 */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || '관'}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || '관리자'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일에서 페이지 제목 */}
        <div className="lg:hidden px-4 sm:px-6 pb-3">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {title || getDefaultTitle()}
          </h2>
          <p className="text-sm text-gray-600 truncate">
            {subtitle || getDefaultSubtitle()}
          </p>
        </div>

        {/* 모바일에서 액션 버튼들 */}
        {actions && (
          <div className="md:hidden px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {actions}
            </div>
          </div>
        )}
      </header>

      {/* 모바일 네비게이션 */}
      <MobileNavigation
        userType={userType}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default ResponsiveHeader;
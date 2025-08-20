// 페이지 수준 접근 제어를 위한 HOC (Higher-Order Component)

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/store/useStore';
import { UserType } from '@/types/user';
import { hasMinPermissionLevel, isAdmin, canAccessMenu } from '@/utils/permissions';

interface WithPermissionOptions {
  minLevel?: UserType;
  adminOnly?: boolean;
  centerManagerOnly?: boolean;
  superAdminOnly?: boolean;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

// 로딩 컴포넌트
const LoadingComponent: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">권한을 확인하는 중...</p>
    </div>
  </div>
);

// 접근 거부 컴포넌트
const AccessDeniedComponent: React.FC<{ redirectTo?: string }> = ({ redirectTo }) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
        <p className="text-gray-600 mb-6">
          이 페이지에 접근할 수 있는 권한이 없습니다.<br />
          관리자에게 문의하세요.
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};

/**
 * 페이지 수준 권한 제어를 위한 HOC
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionOptions = {}
) {
  const {
    minLevel,
    adminOnly = false,
    centerManagerOnly = false,
    superAdminOnly = false,
    redirectTo = '/admin/dashboard',
    fallbackComponent: FallbackComponent = AccessDeniedComponent
  } = options;

  const WithPermissionComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, getCurrentUser } = useStore();
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    // 사용자 정보 및 권한 확인
    useEffect(() => {
      const checkPermission = async () => {
        try {
          // 인증되지 않은 경우 로그인 페이지로 리다이렉트
          if (!isAuthenticated) {
            router.replace('/login');
            return;
          }

          // 사용자 정보가 없으면 가져오기
          if (!user) {
            await getCurrentUser();
            return; // useEffect가 다시 실행됨
          }

          const userType = user.user_type || user.userType;
          if (!userType) {
            console.error('사용자 타입 정보가 없습니다.');
            setHasPermission(false);
            setIsCheckingPermission(false);
            return;
          }

          // 권한 체크
          let permitted = true;

          // 최소 권한 레벨 체크
          if (minLevel) {
            permitted = permitted && hasMinPermissionLevel(userType, minLevel);
          }

          // 관리자 전용 체크
          if (adminOnly) {
            permitted = permitted && isAdmin(userType);
          }

          // 센터장 이상 전용 체크
          if (centerManagerOnly) {
            permitted = permitted && hasMinPermissionLevel(userType, 'center_manager');
          }

          // 최고 관리자 전용 체크
          if (superAdminOnly) {
            permitted = permitted && userType === 'super_admin';
          }

          // 현재 경로에 대한 메뉴 접근 권한 체크
          if (permitted) {
            permitted = canAccessMenu(userType, router.pathname);
          }

          setHasPermission(permitted);
          setIsCheckingPermission(false);

          // 권한이 없으면 리다이렉트
          if (!permitted) {
            console.warn(`접근 권한 없음: ${router.pathname}, 사용자 타입: ${userType}`);
            // 즉시 리다이렉트하지 않고 컴포넌트에서 처리
          }
        } catch (error) {
          console.error('권한 확인 중 오류:', error);
          setHasPermission(false);
          setIsCheckingPermission(false);
        }
      };

      checkPermission();
    }, [user, isAuthenticated, router, getCurrentUser]);

    // 로딩 중
    if (isLoading || isCheckingPermission) {
      return <LoadingComponent />;
    }

    // 권한 없음
    if (!hasPermission) {
      return <FallbackComponent redirectTo={redirectTo} />;
    }

    // 권한 있음 - 원래 컴포넌트 렌더링
    return <WrappedComponent {...props} />;
  };

  // 컴포넌트 이름 설정 (디버깅용)
  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPermissionComponent;
}

// 편의를 위한 래퍼 함수들
export const withAdminOnly = <P extends object>(
  Component: React.ComponentType<P>
) => withPermission(Component, { adminOnly: true });

export const withCenterManagerOnly = <P extends object>(
  Component: React.ComponentType<P>
) => withPermission(Component, { centerManagerOnly: true });

export const withSuperAdminOnly = <P extends object>(
  Component: React.ComponentType<P>
) => withPermission(Component, { superAdminOnly: true });

export const withMinLevel = <P extends object>(
  Component: React.ComponentType<P>,
  minLevel: UserType
) => withPermission(Component, { minLevel });

export default withPermission;
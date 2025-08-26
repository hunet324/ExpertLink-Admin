import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { SidebarProvider } from '@/contexts/SidebarContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { getCurrentUser, isAuthenticated } = useStore();

  useEffect(() => {
    // 토큰이 있으면 사용자 정보 자동 로드
    const initializeAuth = async () => {
      if (isAuthenticated) {
        try {
          console.log('앱 초기화: 토큰이 있어 사용자 정보 로드 시도');
          await getCurrentUser();
        } catch (error) {
          console.warn('앱 초기화: 사용자 정보 로드 실패 (토큰이 만료되었을 수 있음)');
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, getCurrentUser]);

  return (
    <SidebarProvider>
      <Component {...pageProps} />
    </SidebarProvider>
  );
}
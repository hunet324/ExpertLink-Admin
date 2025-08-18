import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { LoginFormData } from '@/types/auth';
import { ApiError } from '@/types/auth';
import { authService } from '@/services/auth';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useStore();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string>('');

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && user) {
      const userType = user.userType;
      if (userType) {
        const redirectPath = authService.getUserTypeRedirectPath(userType);
        console.log('useEffect에서 리다이렉트:', redirectPath, '사용자:', userType);
        router.replace(redirectPath);
      } else if (user.email === 'admin@example.com') {
        console.log('useEffect: 관리자 이메일로 추정');
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 입력 시 에러 메시지 초기화
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 기본 유효성 검사
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 로그인 API 호출
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      // 로그인 후 토큰 상태 확인
      const currentState = useStore.getState();
      console.log('로그인 후 상태:', {
        isAuthenticated: currentState.isAuthenticated,
        hasUser: !!currentState.user,
        hasAccessToken: !!currentState.accessToken,
        localStorageToken: !!localStorage.getItem('expertlink_access_token'),
        userType: currentState.user?.userType
      });

      // 로그인 성공 시 사용자 타입에 따라 리다이렉트
      const currentUser = currentState.user;
      if (currentUser) {
        const userType = currentUser.userType;
        console.log('사용자 정보:', {
          user: currentUser,
          userType: currentUser.userType,
          finalUserType: userType
        });
        
        if (userType) {
          const redirectPath = authService.getUserTypeRedirectPath(userType);
          console.log('리다이렉트 경로:', redirectPath, '사용자 타입:', userType);
          
          // 현재 페이지가 로그인 페이지인 경우만 리다이렉트
          if (router.pathname === '/login') {
            router.replace(redirectPath); // push 대신 replace 사용
          }
        } else {
          console.warn('사용자 타입이 누락됨. API 응답을 확인하세요:', currentUser);
          // 임시로 관리자 대시보드로 이동 (이메일이 admin@example.com인 경우)
          if (currentUser.email === 'admin@example.com') {
            console.log('관리자 이메일로 추정, 관리자 대시보드로 이동');
            router.replace('/admin/dashboard');
          } else {
            router.replace('/');
          }
        }
      } else {
        console.warn('사용자 정보가 없습니다:', currentUser);
      }
      
    } catch (err) {
      // API 에러 처리
      const apiError = err as ApiError;
      
      if (apiError.statusCode === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (apiError.statusCode === 0) {
        setError('네트워크 연결을 확인해주세요.');
      } else if (typeof apiError.message === 'string') {
        setError(apiError.message);
      } else if (Array.isArray(apiError.message)) {
        setError(apiError.message[0]);
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* 로고 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-logo-main font-bold mb-4">
            ExpertLink
          </h1>
          <p className="text-h3 text-secondary-400 font-normal">
            심리상담 전문가 플랫폼
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-custom shadow-large p-12">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-error mr-2">⚠️</span>
                <span className="text-error text-body">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-body font-medium text-secondary-600 mb-3">
                아이디 (이메일)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-5 py-4 border border-background-300 rounded-custom text-body 
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                          placeholder:text-background-500 bg-background-50"
                placeholder="이메일 주소를 입력하세요"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-body font-medium text-secondary-600 mb-3">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-5 py-4 border border-background-300 rounded-custom text-body
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                          placeholder:text-background-500 bg-background-50"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {/* 로그인 유지 & 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary border-background-300 rounded focus:ring-2 focus:ring-primary"
                />
                <span className="ml-3 text-body text-secondary-500">로그인 상태 유지</span>
              </label>
              <Link href="/forgot-password" className="text-body text-primary hover:text-primary-600 transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary text-white py-4 px-6 rounded-custom text-body font-semibold
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                        transition-all duration-smooth ${
                          isLoading 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:bg-primary-600 transform hover:scale-[1.01]'
                        }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 하단 안내 */}
          <div className="mt-8 text-center">
            <p className="text-body text-secondary-400 mb-6">
              ExpertLink 계정으로 로그인하여 서비스를 이용하세요
            </p>
            
            {/* 회원가입 링크 */}
            <div className="border-t border-background-200 pt-6">
              <p className="text-body text-secondary-500 mb-4">
                아직 계정이 없으신가요?
              </p>
              <Link 
                href="/register" 
                className="inline-block w-full bg-secondary-100 text-secondary-700 py-4 px-6 rounded-custom text-body font-semibold
                          hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 
                          transition-all duration-smooth transform hover:scale-[1.01]"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 지원 */}
        <div className="mt-8 text-center">
          <p className="text-caption text-secondary-300">
            로그인에 문제가 있으시나요?{' '}
            <Link href="/support" className="text-primary hover:text-primary-600 transition-colors">
              기술지원 요청
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
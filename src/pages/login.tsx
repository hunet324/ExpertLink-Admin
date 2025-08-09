import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 아무 값이나 입력되어 있으면 로그인 성공으로 처리
    if (formData.email && formData.password) {
      setIsLoading(true);
      
      // 로딩 효과를 위한 약간의 지연
      setTimeout(() => {
        // 홈(대시보드)으로 이동
        router.push('/expert/dashboard');
      }, 800);
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
                placeholder="admin@expertlink.com"
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
                placeholder="••••••••"
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
            <p className="text-body text-secondary-400">
              관리자 계정으로 로그인하여 시스템을 이용하세요
            </p>
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
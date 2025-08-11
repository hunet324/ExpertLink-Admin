import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Custom404: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const suggestedPages = [
    {
      title: '대시보드',
      description: '전문가 대시보드로 이동',
      path: '/expert/dashboard',
      icon: '🏠'
    },
    {
      title: '오늘 일정',
      description: '오늘의 상담 일정 확인',
      path: '/expert/dashboard/schedule',
      icon: '📅'
    },
    {
      title: '내담자 관리',
      description: '내담자 목록 및 프로필 관리',
      path: '/expert/clients/list',
      icon: '👥'
    },
    {
      title: '상담실',
      description: '화상/채팅/음성 상담실',
      path: '/expert/counseling/video',
      icon: '💬'
    }
  ];

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 일러스트 */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-background-300 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl animate-bounce">🔍</span>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        <div className="mb-8">
          <h1 className="text-h2 font-bold text-secondary mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-body text-secondary-500 leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br />
            URL을 다시 확인해주시거나 아래 제안된 페이지로 이동해보세요.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleGoBack}
            className="bg-primary text-white px-6 py-3 rounded-lg text-body font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>이전 페이지로</span>
          </button>
          
          <Link
            href="/expert/dashboard"
            className="bg-accent text-white px-6 py-3 rounded-lg text-body font-medium hover:bg-accent-600 transition-colors flex items-center space-x-2"
          >
            <span>🏠</span>
            <span>대시보드로</span>
          </Link>
        </div>

        {/* 추천 페이지 */}
        <div className="bg-white rounded-custom shadow-soft p-6">
          <h2 className="text-h4 font-semibold text-secondary mb-6 flex items-center justify-center">
            <span className="mr-2">💡</span>
            이런 페이지는 어떠세요?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestedPages.map((page, index) => (
              <Link
                key={index}
                href={page.path}
                className="group p-4 border border-background-200 rounded-lg hover:border-primary-300 hover:bg-primary-25 transition-all duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform">
                    {page.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-body font-medium text-secondary group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-caption text-secondary-400 mt-1 group-hover:text-secondary-500 transition-colors">
                      {page.description}
                    </p>
                  </div>
                  <div className="text-secondary-300 group-hover:text-primary transition-colors">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-8 p-4 bg-background-100 rounded-lg">
          <p className="text-caption text-secondary-500">
            <span className="font-medium">도움이 필요하신가요?</span><br />
            기술 지원팀에 문의하시거나 사용자 가이드를 확인해보세요.
          </p>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <button className="text-primary hover:text-primary-600 text-caption font-medium transition-colors">
              📞 지원팀 문의
            </button>
            <span className="text-background-400">|</span>
            <button className="text-primary hover:text-primary-600 text-caption font-medium transition-colors">
              📚 사용자 가이드
            </button>
          </div>
        </div>

        {/* 브랜드 로고 */}
        <div className="mt-8 pt-6 border-t border-background-200">
          <div className="flex items-center justify-center space-x-2 text-secondary-400">
            <span className="text-logo-point text-xl">🔗</span>
            <span className="text-body font-semibold text-logo-main">ExpertLink</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
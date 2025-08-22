import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/store/useStore';

const Home: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, user } = useStore();

    useEffect(() => {
        // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        // 인증된 사용자는 사용자 타입에 따라 적절한 대시보드로 리다이렉트
        if (user) {
            const userType = user.userType || user.user_type;
            
            switch (userType) {
                case 'expert':
                    router.replace('/expert/dashboard');
                    break;
                case 'center_manager':
                case 'regional_manager':
                case 'super_admin':
                    router.replace('/admin/dashboard');
                    break;
                case 'general':
                default:
                    // 일반 사용자용 대시보드가 있다면 여기에 추가
                    router.replace('/login');
                    break;
            }
        }
    }, [isAuthenticated, user, router]);

    // 리다이렉트 중에는 로딩 화면 표시
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">ExpertLink로 이동 중...</p>
            </div>
        </div>
    );
};

export default Home;
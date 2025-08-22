// 수퍼관리자 전체 시스템 현황 대시보드

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface GlobalSystemStats {
  totalUsers: number;
  totalExperts: number;
  totalCenters: number;
  totalRegions: number;
  activeUsers: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
}

interface CenterStats {
  id: number;
  name: string;
  region: string;
  userCount: number;
  expertCount: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface RegionalStats {
  region: string;
  centerCount: number;
  totalUsers: number;
  totalExperts: number;
  performance: number;
}

const GlobalDashboardPage: React.FC = () => {
  const { user } = useStore();
  
  const [globalStats, setGlobalStats] = useState<GlobalSystemStats>({
    totalUsers: 0,
    totalExperts: 0,
    totalCenters: 0,
    totalRegions: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 'healthy',
    uptime: '99.9%'
  });
  
  const [centerStats, setCenterStats] = useState<CenterStats[]>([]);
  const [regionalStats, setRegionalStats] = useState<RegionalStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const userType = getUserType(user);

  // 전체 시스템 통계 조회
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        
        // Mock 데이터 (실제로는 API 호출)
        const mockGlobalStats: GlobalSystemStats = {
          totalUsers: 2847,
          totalExperts: 156,
          totalCenters: 12,
          totalRegions: 4,
          activeUsers: 1234,
          pendingApprovals: 8,
          systemHealth: 'healthy',
          uptime: '99.97%'
        };

        const mockCenterStats: CenterStats[] = [
          { id: 1, name: '강남센터', region: '서울', userCount: 245, expertCount: 18, status: 'active' },
          { id: 2, name: '부산센터', region: '부산', userCount: 189, expertCount: 12, status: 'active' },
          { id: 3, name: '대구센터', region: '대구', userCount: 167, expertCount: 15, status: 'maintenance' },
          { id: 4, name: '인천센터', region: '인천', userCount: 134, expertCount: 9, status: 'active' }
        ];

        const mockRegionalStats: RegionalStats[] = [
          { region: '서울', centerCount: 4, totalUsers: 892, totalExperts: 45, performance: 98.2 },
          { region: '부산', centerCount: 3, totalUsers: 567, totalExperts: 32, performance: 96.8 },
          { region: '대구', centerCount: 3, totalUsers: 456, totalExperts: 28, performance: 94.5 },
          { region: '인천', centerCount: 2, totalUsers: 321, totalExperts: 19, performance: 97.1 }
        ];

        setGlobalStats(mockGlobalStats);
        setCenterStats(mockCenterStats);
        setRegionalStats(mockRegionalStats);
        setError('');
      } catch (err: any) {
        console.error('전체 시스템 통계 조회 실패:', err);
        setError(err.message || '시스템 통계를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'healthy': return '정상';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '운영중';
      case 'inactive': return '비활성';
      case 'maintenance': return '점검중';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">전체 시스템 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin/dashboard"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 관리자 대시보드
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">🌐 전체 시스템 현황</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">수퍼관리자 전용 글로벌 시스템 모니터링</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/admin/super-admin/admin-accounts"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                관리자 계정
              </Link>
              <Link
                href="/admin/super-admin/system-monitoring"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                시스템 모니터링
              </Link>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 글로벌 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 사용자</p>
                <p className="text-2xl font-semibold text-gray-900">{globalStats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 전문가</p>
                <p className="text-2xl font-semibold text-gray-900">{globalStats.totalExperts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🏢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 센터</p>
                <p className="text-2xl font-semibold text-gray-900">{globalStats.totalCenters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getHealthColor(globalStats.systemHealth)}`}>
                  <span className="text-sm">💗</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">시스템 상태</p>
                <p className="text-2xl font-semibold text-gray-900">{getHealthText(globalStats.systemHealth)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 지역별 통계 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">지역별 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    센터 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 전문가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    성과 지수
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regionalStats.map((region) => (
                  <tr key={region.region} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{region.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.centerCount}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.totalUsers.toLocaleString()}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.totalExperts}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        region.performance >= 98 ? 'bg-green-100 text-green-800' :
                        region.performance >= 95 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {region.performance}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 센터별 현황 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">센터별 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    센터명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전문가 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {centerStats.map((center) => (
                  <tr key={center.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{center.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {center.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {center.userCount.toLocaleString()}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {center.expertCount}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(center.status)
                      }`}>
                        {getStatusText(center.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/centers/${center.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세
                        </Link>
                        <Link
                          href={`/admin/centers/${center.id}/experts`}
                          className="text-green-600 hover:text-green-900"
                        >
                          전문가
                        </Link>
                        <Link
                          href={`/admin/centers/${center.id}/staff`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          직원
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(GlobalDashboardPage);
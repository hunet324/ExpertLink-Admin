// 센터 목록 관리 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Center } from '@/types/user';
import { centerService } from '@/services/center';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import CenterSelector from '@/components/CenterSelector';

const CenterListPage: React.FC = () => {
  const { user } = useStore();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);

  const userType = user?.user_type || user?.userType;
  const isSuperAdmin = userType === 'super_admin';

  // 센터 목록 조회
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const centerList = await centerService.getManagedCenters();
        setCenters(centerList);
        setError('');
      } catch (err: any) {
        console.error('센터 목록 조회 실패:', err);
        setError(err.message || '센터 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">센터 목록을 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">센터 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">관리 가능한 센터 목록</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            {isSuperAdmin && (
              <Link
                href="/admin/centers/create"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + 새 센터 등록
              </Link>
            )}
          </div>
        </div>

        {/* 센터 선택 필터 */}
        {centers.length > 1 && userType && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">센터 필터</h2>
            <div className="max-w-md">
              <CenterSelector
                userType={userType}
                currentCenterId={selectedCenterId}
                onCenterChange={setSelectedCenterId}
                showAllOption={true}
                placeholder="모든 센터"
              />
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 센터 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              센터 목록 ({centers.length}개)
            </h2>
          </div>

          {centers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 센터가 없습니다</h3>
              <p className="text-gray-600">새로운 센터를 등록해보세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {centers
                .filter(center => !selectedCenterId || center.id === selectedCenterId)
                .map((center) => (
                <div key={center.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {center.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ID: {center.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        {center.address && (
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">주소:</span>
                            <span>{center.address}</span>
                          </div>
                        )}
                        {center.phone && (
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">전화:</span>
                            <span>{center.phone}</span>
                          </div>
                        )}
                        {center.manager_id && (
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">센터장:</span>
                            <span>ID {center.manager_id}</span>
                          </div>
                        )}
                        {center.created_at && (
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">등록일:</span>
                            <span>{new Date(center.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/admin/centers/${center.id}/staff`}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        직원 관리
                      </Link>
                      <Link
                        href={`/admin/centers/${center.id}/experts`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        전문가 관리
                      </Link>
                      {isSuperAdmin && (
                        <Link
                          href={`/admin/centers/${center.id}/edit`}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          수정
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 센터 수</p>
                <p className="text-2xl font-semibold text-gray-900">{centers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">활성 센터</p>
                <p className="text-2xl font-semibold text-gray-900">{centers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">관리 권한</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userType === 'super_admin' ? '전체' : '제한적'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(CenterListPage);
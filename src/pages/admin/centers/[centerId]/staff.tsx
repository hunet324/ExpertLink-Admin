// 센터별 직원 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService, CenterStaffResponse } from '@/services/center';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getAdminLevelText, getPermissionLevelColor } from '@/utils/permissions';

const CenterStaffPage: React.FC = () => {
  const router = useRouter();
  const { centerId } = router.query;
  const { user } = useStore();
  
  const [staff, setStaff] = useState<CenterStaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [centerName, setCenterName] = useState<string>('');

  const userType = user?.user_type || user?.userType;
  const currentCenterId = user?.center_id || user?.centerId;

  // 센터별 직원 목록 조회
  useEffect(() => {
    const fetchStaff = async () => {
      if (!centerId || Array.isArray(centerId)) return;

      try {
        setLoading(true);
        const staffList = await centerService.getCenterStaff(parseInt(centerId));
        setStaff(staffList);
        
        // 센터 이름은 첫 번째 직원의 정보에서 추출하거나 별도 API로 조회
        setCenterName(`센터 ${centerId}`);
        setError('');
      } catch (err: any) {
        console.error('직원 목록 조회 실패:', err);
        setError(err.message || '직원 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [centerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">직원 목록을 불러오는 중...</p>
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
                  href="/admin/centers/list"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 센터 목록
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {centerName} 직원 관리
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">센터 직원 목록 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/centers/${centerId}/experts`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                전문가 관리
              </Link>
              {userType === 'super_admin' && (
                <Link
                  href={`/admin/hierarchy/staff?centerId=${centerId}`}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  계층 관리
                </Link>
              )}
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

        {/* 직원 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              직원 목록 ({staff.length}명)
            </h2>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 직원이 없습니다</h3>
              <p className="text-gray-600">이 센터에는 아직 등록된 직원이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      직원 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      직급
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상급자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getPermissionLevelColor(member.user_type as any)
                        }`}>
                          {getAdminLevelText(member.user_type as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.supervisor_id ? (
                          <span>ID: {member.supervisor_id}</span>
                        ) : (
                          <span className="text-gray-400">없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/hierarchy/user/${member.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            상세
                          </Link>
                          {(userType === 'super_admin' || 
                            (userType === 'center_manager' && member.user_type === 'staff')) && (
                            <Link
                              href={`/admin/hierarchy/user/${member.id}/edit`}
                              className="text-green-600 hover:text-green-900"
                            >
                              수정
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 직원</p>
                <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">👑</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">센터장</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {staff.filter(s => s.user_type === 'center_manager').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">👤</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">직원</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {staff.filter(s => s.user_type === 'staff').length}
                </p>
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
                <p className="text-sm font-medium text-gray-500">센터 ID</p>
                <p className="text-2xl font-semibold text-gray-900">{centerId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(CenterStaffPage);
// 계층적 직원 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { User } from '@/types/user';
import { hierarchyService } from '@/services/hierarchy';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getAdminLevelText, getPermissionLevelColor } from '@/utils/permissions';

const HierarchyStaffPage: React.FC = () => {
  const router = useRouter();
  const { centerId } = router.query;
  const { user } = useStore();
  
  const [manageableStaff, setManageableStaff] = useState<User[]>([]);
  const [viewableStaff, setViewableStaff] = useState<User[]>([]);
  const [mySubordinates, setMySubordinates] = useState<User[]>([]);
  const [mySupervisor, setMySupervisor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manageable' | 'viewable' | 'subordinates' | 'supervisor'>('manageable');

  const userType = user?.user_type || user?.userType;

  // 계층적 직원 정보 조회
  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 데이터 조회
        const [manageable, viewable, subordinates, supervisor] = await Promise.allSettled([
          hierarchyService.getManageableStaff(),
          hierarchyService.getViewableStaff(),
          hierarchyService.getMySubordinates(false),
          hierarchyService.getMySupervisor()
        ]);

        if (manageable.status === 'fulfilled') {
          setManageableStaff(manageable.value);
        }
        if (viewable.status === 'fulfilled') {
          setViewableStaff(viewable.value);
        }
        if (subordinates.status === 'fulfilled') {
          setMySubordinates(subordinates.value);
        }
        if (supervisor.status === 'fulfilled') {
          setMySupervisor(supervisor.value);
        }

        setError('');
      } catch (err: any) {
        console.error('계층 데이터 조회 실패:', err);
        setError(err.message || '계층 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchyData();
  }, [centerId]);

  const tabs = [
    { id: 'manageable', label: '관리 가능', count: manageableStaff.length },
    { id: 'viewable', label: '조회 가능', count: viewableStaff.length },
    { id: 'subordinates', label: '내 하급자', count: mySubordinates.length },
    { id: 'supervisor', label: '내 상급자', count: mySupervisor ? 1 : 0 }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'manageable': return manageableStaff;
      case 'viewable': return viewableStaff;
      case 'subordinates': return mySubordinates;
      case 'supervisor': return mySupervisor ? [mySupervisor] : [];
      default: return [];
    }
  };

  const canManageUser = (targetUser: User) => {
    return activeTab === 'manageable' || activeTab === 'subordinates';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">계층 정보를 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">계층적 직원 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">권한 계층에 따른 직원 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/admin/hierarchy/tree"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                조직도 보기
              </Link>
              <Link
                href="/admin/hierarchy/permissions"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                권한 테스트
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

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 직원 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label} ({getCurrentData().length}명)
            </h2>
          </div>

          {getCurrentData().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'supervisor' ? '👑' : '👥'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'supervisor' ? '상급자가 없습니다' : '직원이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'supervisor' 
                  ? '현재 최상위 관리자이거나 상급자가 설정되지 않았습니다.'
                  : '해당 카테고리에 직원이 없습니다.'
                }
              </p>
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
                      센터
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상급자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentData().map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.name?.charAt(0) || '?'}
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
                          getPermissionLevelColor((member.user_type || member.userType) as any)
                        }`}>
                          {getAdminLevelText((member.user_type || member.userType) as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.center_name || member.centerName || `센터 ${member.center_id || member.centerId || '?'}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.supervisor_id || member.supervisorId ? (
                          <span>ID: {member.supervisor_id || member.supervisorId}</span>
                        ) : (
                          <span className="text-gray-400">없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/hierarchy/user/${member.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            상세
                          </Link>
                          <Link
                            href={`/admin/hierarchy/relationship/${member.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            관계
                          </Link>
                          {canManageUser(member) && (
                            <Link
                              href={`/admin/hierarchy/user/${member.id}/edit`}
                              className="text-purple-600 hover:text-purple-900"
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
          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tab.id === 'manageable' ? 'bg-blue-100' :
                    tab.id === 'viewable' ? 'bg-green-100' :
                    tab.id === 'subordinates' ? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    <span className={`text-sm ${
                      tab.id === 'manageable' ? 'text-blue-600' :
                      tab.id === 'viewable' ? 'text-green-600' :
                      tab.id === 'subordinates' ? 'text-yellow-600' : 'text-purple-600'
                    }`}>
                      {tab.id === 'manageable' ? '✏️' :
                       tab.id === 'viewable' ? '👁️' :
                       tab.id === 'subordinates' ? '👥' : '👑'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{tab.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{tab.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(HierarchyStaffPage);
// 전문가 근무시간 모니터링 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService, CenterExpertResponse, WorkingHoursResponse } from '@/services/center';
import { withCenterManagerOnly } from '@/components/withPermission';
import { getUserType } from '@/utils/permissions';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import CenterSelector from '@/components/CenterSelector';

const ExpertWorkingHoursPage: React.FC = () => {
  const router = useRouter();
  const { centerId: queryCenterId, expertId: queryExpertId } = router.query;
  const { user } = useStore();
  
  const [experts, setExperts] = useState<CenterExpertResponse[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(
    queryCenterId ? parseInt(queryCenterId as string) : null
  );
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(
    queryExpertId ? parseInt(queryExpertId as string) : null
  );
  const [workingHours, setWorkingHours] = useState<WorkingHoursResponse[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    endDate: new Date().toISOString().split('T')[0] // 오늘
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const userType = getUserType(user);

  // 센터별 전문가 목록 조회
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        let expertList: CenterExpertResponse[] = [];
        
        console.log('전문가 조회 시작 - selectedCenterId:', selectedCenterId);
        
        if (selectedCenterId) {
          // 특정 센터의 전문가 조회
          console.log('특정 센터의 전문가 조회:', selectedCenterId);
          expertList = await centerService.getCenterExperts(selectedCenterId);
        } else {
          // 전체 센터의 전문가 조회 (전체 선택 시)
          console.log('전체 센터의 전문가 조회');
          expertList = await centerService.getAllManagedExperts();
        }
        
        console.log('조회된 전문가 목록:', expertList);
        setExperts(expertList);
        setError('');
        
        // 첫 번째 전문가 자동 선택 (기존 선택이 없을 때만)
        if (expertList.length > 0 && !selectedExpertId) {
          setSelectedExpertId(expertList[0].id);
        }
        
        // 기존 선택된 전문가가 새 목록에 없으면 초기화
        if (selectedExpertId && !expertList.find(e => e.id === selectedExpertId)) {
          setSelectedExpertId(expertList.length > 0 ? expertList[0].id : null);
        }
      } catch (err: any) {
        console.error('전문가 목록 조회 실패:', err);
        setError(err.message || '전문가 목록을 불러올 수 없습니다.');
        setExperts([]);
      }
    };

    fetchExperts();
  }, [selectedCenterId]);

  // 근무시간 조회
  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!selectedExpertId || !dateRange.startDate || !dateRange.endDate) return;

      try {
        setLoading(true);
        const hours = await centerService.getExpertWorkingHours(
          selectedExpertId,
          dateRange.startDate,
          dateRange.endDate
        );
        
        setWorkingHours(hours);
        setError('');
      } catch (err: any) {
        console.error('근무시간 조회 실패:', err);
        setError(err.message || '근무시간 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [selectedExpertId, dateRange]);

  // 통계 계산
  const statistics = {
    totalDays: workingHours.length,
    totalHours: workingHours.reduce((sum, record) => sum + record.totalHours, 0),
    averageHours: workingHours.length > 0 ? workingHours.reduce((sum, record) => sum + record.totalHours, 0) / workingHours.length : 0,
    overtimeDays: workingHours.filter(record => record.totalHours > 8).length
  };

  const selectedExpert = experts.find(e => e.id === selectedExpertId);

  if (!userType) {
    return <div>권한 정보를 불러오는 중...</div>;
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">전문가 근무시간 모니터링</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">전문가 근무시간 조회 및 분석</p>
                <AdminLevelBadge userType={userType} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* 필터 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">조회 조건</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 센터 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">센터</label>
              <CenterSelector
                userType={userType}
                currentCenterId={selectedCenterId ?? undefined}
                onCenterChange={setSelectedCenterId}
                placeholder="센터를 선택하세요"
                showAllOption={true}
              />
            </div>

            {/* 전문가 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전문가</label>
              <select
                value={selectedExpertId || ''}
                onChange={(e) => setSelectedExpertId(parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={experts.length === 0}
              >
                <option value="">전문가를 선택하세요</option>
                {experts.map(expert => (
                  <option key={expert.id} value={expert.id}>
                    {expert.name}{expert.centerName ? ` (${expert.centerName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 선택된 전문가 정보 */}
        {selectedExpert && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-300 flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {selectedExpert.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedExpert.name}</h3>
                <p className="text-gray-600">{selectedExpert.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedExpert.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 정보 */}
        {selectedExpertId && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">근무일수</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalDays}일</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">⏰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">총 근무시간</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalHours.toFixed(1)}시간</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">평균 근무시간</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.averageHours.toFixed(1)}시간</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">🔥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">초과근무일</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.overtimeDays}일</p>
                </div>
              </div>
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

        {/* 근무시간 목록 */}
        {selectedExpertId && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                근무시간 기록 ({workingHours.length}일)
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">근무시간 정보를 불러오는 중...</p>
              </div>
            ) : workingHours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">근무 기록이 없습니다</h3>
                <p className="text-gray-600">선택한 기간에 근무 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        출근시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        퇴근시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        휴게시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        총 근무시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workingHours.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('ko-KR', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.startTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.breakTime ? `${record.breakTime}분` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.totalHours.toFixed(1)}시간
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.totalHours > 8 
                              ? 'bg-red-100 text-red-800' 
                              : record.totalHours >= 7 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.totalHours > 8 ? '초과근무' : 
                             record.totalHours >= 7 ? '정상근무' : '부족'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ExpertWorkingHoursPage);
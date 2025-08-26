// 전문가 스케줄 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService } from '@/services/center';
import { adminService, ScheduleData, ScheduleStats } from '@/services/admin';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import CenterSelector from '@/components/CenterSelector';
import { getUserType } from '@/utils/permissions';

// Use ScheduleData from admin service instead

const ExpertSchedulePage: React.FC = () => {
  const router = useRouter();
  const { user } = useStore();
  
  const [scheduleData, setScheduleData] = useState<ScheduleStats | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // 필터링
  const [selectedExpert, setSelectedExpert] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [experts, setExperts] = useState<any[]>([]);

  const userType = getUserType(user);

  // 오늘 날짜부터 한달 뒤까지 기본 설정
  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setDateRange({
      start: today.toISOString().split('T')[0],
      end: nextMonth.toISOString().split('T')[0]
    });
  }, []);

  // 센터별 전문가 목록 조회
  useEffect(() => {
    const fetchExperts = async () => {
      if (!selectedCenterId) return;

      try {
        const expertList = await centerService.getCenterExperts(selectedCenterId);
        setExperts(expertList);
      } catch (error) {
        console.error('전문가 목록 조회 실패:', error);
      }
    };

    fetchExperts();
  }, [selectedCenterId]);

  // 스케줄 데이터 조회 (실제 API 연동)
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedCenterId && selectedCenterId !== undefined) return;

      setLoading(true);
      setError('');

      try {
        const data = await adminService.getAllSchedules(selectedCenterId || undefined);
        setScheduleData(data);
      } catch (error: any) {
        console.error('스케줄 조회 실패:', error);
        setError(error.message || '스케줄 조회에 실패했습니다.');
        setScheduleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedCenterId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '예약 가능';
      case 'booked': return '예약됨';
      case 'completed': return '완료';
      case 'cancelled': return '취소됨';
      default: return '알 수 없음';
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM 형태로 변환
  };

  // 일정 취소 기능
  const handleCancelSchedule = async (scheduleId: number) => {
    if (!confirm('정말로 이 일정을 취소하시겠습니까?')) {
      return;
    }

    try {
      await adminService.cancelSchedule(scheduleId);
      alert('일정이 성공적으로 취소되었습니다.');
      // 데이터 다시 로드
      const data = await adminService.getAllSchedules(selectedCenterId || undefined);
      setScheduleData(data);
    } catch (error: any) {
      console.error('일정 취소 실패:', error);
      alert(error.message || '일정 취소에 실패했습니다.');
    }
  };

  // 필터링된 스케줄
  const filteredSchedules = scheduleData?.schedules?.filter(schedule => {
    const expertMatch = selectedExpert === 'all' || schedule.expert?.id?.toString() === selectedExpert;
    const statusMatch = selectedStatus === 'all' || schedule.status === selectedStatus;
    const dateMatch = (!dateRange.start || schedule.schedule_date >= dateRange.start) &&
                     (!dateRange.end || schedule.schedule_date <= dateRange.end);
    return expertMatch && statusMatch && dateMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">전문가 스케줄 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">전문가별 상담 일정 조회 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* 센터 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">센터 선택</h2>
          <div className="max-w-md">
            {userType && (
              <CenterSelector
                userType={userType}
                currentCenterId={selectedCenterId ?? undefined}
                onCenterChange={setSelectedCenterId}
                placeholder="센터를 선택하세요"
              />
            )}
          </div>
        </div>

        {selectedCenterId && (
          <>
            {/* 필터링 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">검색 필터</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전문가
                  </label>
                  <select
                    value={selectedExpert}
                    onChange={(e) => setSelectedExpert(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">전체</option>
                    {experts.map(expert => (
                      <option key={expert.id} value={expert.id}>
                        {expert.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="available">예약 가능</option>
                    <option value="booked">예약됨</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 스케줄 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  스케줄 목록 ({filteredSchedules.length}건)
                </h2>
              </div>

              {error ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">데이터 로드 실패</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError('');
                      const fetchSchedules = async () => {
                        setLoading(true);
                        try {
                          const data = await adminService.getAllSchedules(selectedCenterId || undefined);
                          setScheduleData(data);
                        } catch (error: any) {
                          setError(error.message || '스케줄 조회에 실패했습니다.');
                        } finally {
                          setLoading(false);
                        }
                      };
                      fetchSchedules();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">스케줄을 불러오는 중...</p>
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">스케줄이 없습니다</h3>
                  <p className="text-gray-600">선택한 조건에 맞는 스케줄이 없습니다.</p>
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
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          전문가
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          내용
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          내담자
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
                      {filteredSchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(schedule.schedule_date).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(schedule.schedule_date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.expert?.name || '-'}
                            </div>
                            {schedule.expert?.center && (
                              <div className="text-xs text-gray-500">
                                {schedule.expert.center.name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {schedule.title || '-'}
                            </div>
                            {schedule.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {schedule.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {schedule.client?.name || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusColor(schedule.status)
                            }`}>
                              {getStatusText(schedule.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/experts/${schedule.expert?.id}/schedule/${schedule.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                상세
                              </Link>
                              {(schedule.status === 'booked' || schedule.status === 'available') && (
                                <button 
                                  onClick={() => handleCancelSchedule(schedule.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  취소
                                </button>
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

            {/* 통계 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">총 일정</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduleData?.totalSchedules || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">예약 가능</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduleData?.availableSchedules || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">예약됨</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduleData?.bookedSchedules || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 text-sm">✔️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">완료됨</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduleData?.completedSchedules || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-sm">❌</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">취소됨</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduleData?.cancelledSchedules || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ExpertSchedulePage);
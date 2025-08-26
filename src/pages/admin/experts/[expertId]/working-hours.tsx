// 전문가별 근무시간(일정) 관리 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { centerService } from '@/services/center';
import { userService } from '@/services/user';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface WorkingHoursData {
  expertId: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  totalHours: number;
  totalMinutes: number;
  scheduleCount: number;
  schedules: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
  }[];
  breakTime: number;
}

interface Expert {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  status: string;
  centerName?: string;
  specialties?: string[];
}

const ExpertWorkingHoursPage: React.FC = () => {
  const router = useRouter();
  const { expertId } = router.query;
  const { user } = useStore();
  
  const [expert, setExpert] = useState<Expert | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 필터링 및 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const userType = getUserType(user);

  // 전문가 정보 조회
  useEffect(() => {
    const fetchExpert = async () => {
      if (!expertId || Array.isArray(expertId)) return;

      try {
        const expertResponse = await userService.getUserById(parseInt(expertId));
        setExpert(expertResponse);
      } catch (err: any) {
        console.error('전문가 정보 조회 실패:', err);
        // 전문가 정보 조회 실패해도 근무시간은 조회할 수 있도록 함
      }
    };

    fetchExpert();
  }, [expertId]);

  // 근무시간 데이터 조회
  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!expertId || Array.isArray(expertId) || !dateRange.start || !dateRange.end) return;

      try {
        setLoading(true);
        setError('');
        
        const workingHoursData = await centerService.getExpertWorkingHours(
          parseInt(expertId),
          dateRange.start,
          dateRange.end
        );
        
        setWorkingHours(workingHoursData);
      } catch (err: any) {
        console.error('근무시간 조회 실패:', err);
        setError(err.message || '근무시간 데이터를 불러올 수 없습니다.');
        setWorkingHours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [expertId, dateRange.start, dateRange.end]);

  // 날짜 범위 기본값 설정 (이번 달)
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    });
  }, []);

  // 페이지네이션
  const totalPages = Math.ceil(workingHours.length / itemsPerPage);
  const paginatedWorkingHours = workingHours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">근무시간 정보를 불러오는 중...</p>
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
                <button
                  onClick={() => router.back()}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 뒤로가기
                </button>
                <Link
                  href="/admin/experts/working-hours"
                  className="text-gray-500 hover:text-gray-600 text-sm"
                >
                  전체 스케줄 관리
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {expert?.name} 근무시간 관리
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">전문가 스케줄 조회 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
                {expert?.centerName && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {expert.centerName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 전문가 정보 */}
          {expert && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{expert.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{expert.phone || '미설정'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">전문분야</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {expert.specialties && expert.specialties.length > 0 ? (
                      expert.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">미설정</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 날짜 범위 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
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
                종료 날짜
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  const now = new Date();
                  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setDateRange({
                    start: startOfMonth.toISOString().split('T')[0],
                    end: endOfMonth.toISOString().split('T')[0]
                  });
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                이번 달로 초기화
              </button>
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

        {/* 스케줄 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                근무시간 목록 ({workingHours.length}일)
              </h2>
              <div className="text-sm text-gray-500">
                {currentPage} / {totalPages} 페이지
              </div>
            </div>
          </div>

          {paginatedWorkingHours.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">근무시간 데이터가 없습니다</h3>
              <p className="text-gray-600">선택한 기간에 등록된 스케줄이 없습니다.</p>
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
                      근무시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      총 근무시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      스케줄 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상세 스케줄
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedWorkingHours.map((workingDay, index) => (
                    <tr key={`${workingDay.expertId}-${workingDay.date}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(workingDay.date).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(workingDay.date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {workingDay.startTime && workingDay.endTime 
                            ? `${formatTime(workingDay.startTime)} - ${formatTime(workingDay.endTime)}`
                            : '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {workingDay.totalHours.toFixed(1)}시간
                        </div>
                        <div className="text-xs text-gray-500">
                          ({workingDay.totalMinutes}분)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {workingDay.scheduleCount}개
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {workingDay.schedules.map((schedule, idx) => (
                            <div key={schedule.id} className="text-xs">
                              <span className="text-gray-600">
                                {formatTime(schedule.startTime)}-{formatTime(schedule.endTime)}
                              </span>
                              <span className="ml-2 text-gray-700">
                                {schedule.title || '제목 없음'}
                              </span>
                              <span className={`ml-2 px-1 py-0.5 text-xs rounded ${
                                getStatusColor(schedule.status)
                              }`}>
                                {getStatusText(schedule.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                이전
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                다음
              </button>
            </nav>
          </div>
        )}

        {/* 통계 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 근무일</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workingHours.length}일
                </p>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {workingHours.reduce((total, day) => total + day.totalHours, 0).toFixed(1)}시간
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 스케줄</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workingHours.reduce((total, day) => total + day.scheduleCount, 0)}개
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">평균 일일 근무시간</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workingHours.length > 0 
                    ? (workingHours.reduce((total, day) => total + day.totalHours, 0) / workingHours.length).toFixed(1)
                    : 0
                  }시간
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ExpertWorkingHoursPage);
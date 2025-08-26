// 전문가 스케줄 상세 페이지

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { adminService, ScheduleData } from '@/services/admin';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

const ScheduleDetailPage: React.FC = () => {
  const router = useRouter();
  const { expertId, scheduleId } = router.query;
  const { user } = useStore();
  
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const userType = getUserType(user);

  // 스케줄 상세 조회
  useEffect(() => {
    const fetchScheduleDetail = async () => {
      if (!scheduleId) return;

      setLoading(true);
      setError('');

      try {
        // 전체 스케줄에서 해당 스케줄을 찾기 (임시 구현)
        const allSchedules = await adminService.getAllSchedules();
        const foundSchedule = allSchedules.schedules.find(s => s.id === parseInt(scheduleId as string));
        
        if (!foundSchedule) {
          setError('스케줄을 찾을 수 없습니다.');
          return;
        }

        setSchedule(foundSchedule);
      } catch (error: any) {
        console.error('스케줄 상세 조회 실패:', error);
        setError(error.message || '스케줄 상세 조회에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetail();
  }, [scheduleId]);

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

  const handleCancelSchedule = async () => {
    if (!schedule || !confirm('정말로 이 일정을 취소하시겠습니까?')) {
      return;
    }

    try {
      await adminService.cancelSchedule(schedule.id);
      alert('일정이 성공적으로 취소되었습니다.');
      
      // 데이터 새로고침
      const allSchedules = await adminService.getAllSchedules();
      const updatedSchedule = allSchedules.schedules.find(s => s.id === schedule.id);
      if (updatedSchedule) {
        setSchedule(updatedSchedule);
      }
    } catch (error: any) {
      console.error('일정 취소 실패:', error);
      alert(error.message || '일정 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">스케줄 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">스케줄을 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-4">{error || '요청한 스케줄이 존재하지 않습니다.'}</p>
            <Link
              href="/admin/experts/schedule"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              스케줄 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">스케줄 상세</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">상담 일정 상세 정보</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/experts/schedule"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                목록으로
              </Link>
              {(schedule.status === 'booked' || schedule.status === 'available') && (
                <button
                  onClick={handleCancelSchedule}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  일정 취소
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 스케줄 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">일정 ID</label>
              <div className="text-gray-900">#{schedule.id}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                getStatusColor(schedule.status)
              }`}>
                {getStatusText(schedule.status)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">일정 제목</label>
              <div className="text-gray-900">{schedule.title}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <div className="text-gray-900">
                {new Date(schedule.schedule_date).toLocaleDateString('ko-KR')}
                <span className="text-sm text-gray-500 ml-2">
                  ({new Date(schedule.schedule_date).toLocaleDateString('ko-KR', { weekday: 'long' })})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
              <div className="text-gray-900">
                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">소요 시간</label>
              <div className="text-gray-900">
                {(() => {
                  const start = new Date(`2000-01-01T${schedule.start_time}`);
                  const end = new Date(`2000-01-01T${schedule.end_time}`);
                  const diffMs = end.getTime() - start.getTime();
                  const diffMins = Math.floor(diffMs / (1000 * 60));
                  const hours = Math.floor(diffMins / 60);
                  const minutes = diffMins % 60;
                  
                  if (hours > 0) {
                    return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}`;
                  } else {
                    return `${minutes}분`;
                  }
                })()}
              </div>
            </div>
          </div>

          {schedule.notes && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
              <div className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                {schedule.notes}
              </div>
            </div>
          )}
        </div>

        {/* 전문가 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">전문가 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전문가명</label>
              <div className="text-gray-900">{schedule.expert?.name || '-'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">소속 센터</label>
              <div className="text-gray-900">{schedule.expert?.center?.name || '-'}</div>
            </div>

            <div className="md:col-span-2">
              <Link
                href={`/admin/experts/${schedule.expert?.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                전문가 프로필 보기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 내담자 정보 */}
        {schedule.client && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">내담자 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내담자명</label>
                <div className="text-gray-900">{schedule.client.name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내담자 ID</label>
                <div className="text-gray-900">#{schedule.client.id}</div>
              </div>
            </div>
          </div>
        )}

        {!schedule.client && schedule.status === 'available' && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">예약 가능한 일정</h3>
                <p className="text-sm text-blue-700 mt-1">
                  아직 예약되지 않은 일정입니다. 고객이 예약하면 내담자 정보가 표시됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 일정 이력 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">일정 이력</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">일정 생성</div>
                <div className="text-sm text-gray-500">
                  {new Date(schedule.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>

            {schedule.updated_at !== schedule.created_at && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">일정 수정</div>
                  <div className="text-sm text-gray-500">
                    {new Date(schedule.updated_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
            )}

            {schedule.status === 'cancelled' && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">일정 취소</div>
                  <div className="text-sm text-gray-500">관리자에 의해 취소됨</div>
                </div>
              </div>
            )}

            {schedule.status === 'completed' && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">상담 완료</div>
                  <div className="text-sm text-gray-500">상담이 완료되었습니다</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ScheduleDetailPage);
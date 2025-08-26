import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { userService } from '@/services/user';
import { centerService } from '@/services/center';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import Link from 'next/link';

interface ExpertProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userType?: string;
  user_type?: string;
  status: string;
  profileImage?: string;
  bio?: string;
  centerId?: number;
  center_id?: number;
  centerName?: string;
  specialties?: string[];
  isVerified?: boolean;
  yearsExperience?: number;
  hourlyRate?: number;
  licenseType?: string;
  licenseNumber?: string;
  signupDate?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

const ExpertProfilePage: React.FC = () => {
  const router = useRouter();
  const { expertId } = router.query;
  const { user } = useStore();
  const userType = getUserType(user);

  const [expert, setExpert] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!expertId || Array.isArray(expertId)) return;
    fetchExpertProfile();
  }, [expertId]);

  const fetchExpertProfile = async () => {
    if (!expertId || Array.isArray(expertId)) return;

    try {
      setLoading(true);
      setError('');
      
      const expertData = await userService.getUserById(parseInt(expertId));
      
      // 센터 정보 조회
      let centerName = '';
      if (expertData.centerId) {
        try {
          const centerInfo = await centerService.getCenterById(expertData.centerId);
          centerName = centerInfo.name;
        } catch (err) {
          console.error('센터 정보 조회 실패:', err);
        }
      }

      setExpert({
        ...expertData,
        centerName
      });
    } catch (error: any) {
      console.error('전문가 프로필 조회 실패:', error);
      setError(error.message || '전문가 프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'withdrawn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '승인대기';
      case 'withdrawn': return '탈퇴';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error || '전문가 정보를 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Link href="/admin" className="hover:text-gray-700">관리자</Link>
                  <span>›</span>
                  <Link href="/admin/experts" className="hover:text-gray-700">전문가 관리</Link>
                  <span>›</span>
                  <span className="text-gray-900">전문가 프로필</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {expert.name} 전문가 프로필
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">전문가 상세 정보 및 관리</p>
                  {userType && <AdminLevelBadge userType={userType} size="sm" />}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/experts/${expert.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  정보 수정
                </Link>
                <Link
                  href={`/admin/experts/${expert.id}/vacation`}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  휴가 관리
                </Link>
                <Link
                  href={`/admin/experts/${expert.id}/working-hours`}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  근무시간
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* 기본 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* 프로필 이미지 */}
                <div className="flex-shrink-0">
                  {expert.profileImage ? (
                    <img
                      src={expert.profileImage}
                      alt={expert.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">👤</span>
                    </div>
                  )}
                </div>

                {/* 기본 정보 */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <p className="text-gray-900">{expert.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <p className="text-gray-900">{expert.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <p className="text-gray-900">{expert.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expert.status)}`}>
                      {getStatusText(expert.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">소속 센터</label>
                    <p className="text-gray-900">{expert.centerName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">인증 상태</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expert.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {expert.isVerified ? '인증완료' : '인증대기'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 자기소개 */}
              {expert.bio && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{expert.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 전문 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">전문 정보</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">경력 (년)</label>
                  <p className="text-gray-900">{expert.yearsExperience}년</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간당 상담료</label>
                  <p className="text-gray-900">{expert.hourlyRate?.toLocaleString()}원</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자격증 종류</label>
                  <p className="text-gray-900">{expert.licenseType || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자격증 번호</label>
                  <p className="text-gray-900">{expert.licenseNumber || '-'}</p>
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">전문 분야</label>
                <div className="flex flex-wrap gap-2">
                  {expert.specialties && expert.specialties.length > 0 ? (
                    expert.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">등록된 전문 분야가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 시스템 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">시스템 정보</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                  <p className="text-gray-900">{expert.signupDate ? new Date(expert.signupDate).toLocaleDateString() : '정보 없음'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                  <p className="text-gray-900">{expert.createdAt || expert.created_at ? new Date(expert.createdAt || expert.created_at!).toLocaleDateString() : '정보 없음'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최종 수정일</label>
                  <p className="text-gray-900">{expert.updatedAt || expert.updated_at ? new Date(expert.updatedAt || expert.updated_at!).toLocaleDateString() : '정보 없음'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID</label>
                  <p className="text-gray-900">#{expert.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default withAdminOnly(ExpertProfilePage);
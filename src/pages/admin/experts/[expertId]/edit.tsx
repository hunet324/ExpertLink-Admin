import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { withAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { userService } from '@/services/user';
import { centerService } from '@/services/center';
import { expertService } from '@/services/expert';
import { adminService } from '@/services/admin';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import Link from 'next/link';

interface ExpertEditData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  bio?: string;
  centerId?: number;
  specialties?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  licenseType?: string;
  licenseNumber?: string;
}

interface Center {
  id: number;
  name: string;
}

const ExpertEditPage: React.FC = () => {
  const router = useRouter();
  const { expertId } = router.query;
  const { user } = useStore();
  const userType = getUserType(user);

  const [expert, setExpert] = useState<ExpertEditData | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    bio: '',
    centerId: '',
    specialties: [] as string[],
    yearsExperience: 0,
    hourlyRate: 0,
    licenseType: '',
    licenseNumber: ''
  });

  // 전문 분야 입력
  const [newSpecialty, setNewSpecialty] = useState('');

  const fetchData = useCallback(async () => {
    if (!expertId || Array.isArray(expertId)) return;

    try {
      setLoading(true);
      setError('');
      
      // 전문가 정보와 센터 목록 병렬 조회
      const [expertData, centerList] = await Promise.all([
        userService.getUserById(parseInt(expertId)),
        centerService.getManagedCenters().catch(() => ({ centers: [] }))
      ]);

      console.log('🔍 Raw expert data from API:', JSON.stringify(expertData, null, 2));
      
      setExpert(expertData);
      setCenters(Array.isArray(centerList) ? centerList : centerList.centers || []);

      // 폼 데이터 초기화
      const formDataInit = {
        name: expertData.name || '',
        email: expertData.email || '',
        phone: expertData.phone || '',
        status: expertData.status || 'active',
        bio: (expertData as any).bio || '',
        centerId: (expertData.centerId || (expertData as any).centerId)?.toString() || '',
        specialties: (expertData as any).specialties || [],
        yearsExperience: (expertData as any).yearsExperience || 0,
        hourlyRate: (expertData as any).hourlyRate || 0,
        licenseType: (expertData as any).licenseType || '',
        licenseNumber: (expertData as any).licenseNumber || ''
      };

      console.log('🔍 Form data initialized with:', {
        bio: formDataInit.bio,
        specialties: formDataInit.specialties,
        yearsExperience: formDataInit.yearsExperience,
        hourlyRate: formDataInit.hourlyRate,
        licenseType: formDataInit.licenseType,
        licenseNumber: formDataInit.licenseNumber
      });

      setFormData(formDataInit);
    } catch (error: any) {
      console.error('데이터 조회 실패:', error);
      setError(error.message || '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    if (!expertId || Array.isArray(expertId)) return;
    fetchData();
  }, [expertId, fetchData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expertId || Array.isArray(expertId)) return;

    try {
      setSaving(true);
      setError('');

      // 통합 API로 모든 정보를 한 번에 업데이트
      const comprehensiveUpdateData = {
        // 기본 사용자 정보
        name: formData.name,
        phone: formData.phone,
        status: formData.status,
        centerId: formData.centerId ? parseInt(formData.centerId) : undefined,
        
        // 전문가 프로필 정보
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        yearsExperience: formData.yearsExperience,
        hourlyRate: formData.hourlyRate,
        specialization: formData.specialties,
        introduction: formData.bio
      };

      console.log('🔍 통합 API 업데이트 데이터:', JSON.stringify(comprehensiveUpdateData, null, 2));
      
      await adminService.updateExpertProfile(parseInt(expertId), comprehensiveUpdateData);
      console.log('✅ 통합 API로 전문가 정보 업데이트 성공');
      
      alert('전문가 정보가 성공적으로 수정되었습니다.');
      router.push(`/admin/experts/${expertId}/profile`);
    } catch (error: any) {
      console.error('전문가 정보 수정 실패:', error);
      setError(error.message || '전문가 정보 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !expert) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/admin" className="hover:text-gray-700">관리자</Link>
                <span>›</span>
                <Link href="/admin/experts" className="hover:text-gray-700">전문가 관리</Link>
                <span>›</span>
                <Link href={`/admin/experts/${expertId}/profile`} className="hover:text-gray-700">전문가 프로필</Link>
                <span>›</span>
                <span className="text-gray-900">정보 수정</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {expert?.name} 전문가 정보 수정
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">전문가 상세 정보 수정</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/experts/${expertId}/profile`}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                취소
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="pending">승인대기</option>
                    <option value="withdrawn">탈퇴</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">소속 센터</label>
                  <select
                    value={formData.centerId}
                    onChange={(e) => handleInputChange('centerId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">센터 선택</option>
                    {centers.map(center => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="전문가 소개를 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* 전문 정보 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">전문 정보</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">경력 (년)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간당 상담료 (원)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자격증 종류</label>
                  <input
                    type="text"
                    value={formData.licenseType}
                    onChange={(e) => handleInputChange('licenseType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 정신건강임상심리사"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자격증 번호</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 전문 분야 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전문 분야</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="전문 분야를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/admin/experts/${expertId}/profile`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAdminOnly(ExpertEditPage);
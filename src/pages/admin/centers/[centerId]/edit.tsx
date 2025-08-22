// 🏢 센터 수정 페이지 - 프리미엄 UI/UX 디자인

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import { centerService } from '@/services/center';
import { userService } from '@/services/user';
import { UserType, Center } from '@/types/user';

interface FormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  managerId: string;
  parentCenterId: string;
  isActive: boolean;
}

interface ValidationErrors {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  managerId?: string;
}

interface Manager {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
}

interface ParentCenter {
  id: number;
  name: string;
  code?: string;
}

const EditCenterPage: React.FC = () => {
  const router = useRouter();
  const { centerId } = router.query;
  const { user } = useStore();
  
  // 폼 데이터
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    managerId: '',
    parentCenterId: '',
    isActive: true,
  });

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [step, setStep] = useState(1);
  const [originalCenter, setOriginalCenter] = useState<Center | null>(null);

  // 옵션 데이터
  const [managers, setManagers] = useState<Manager[]>([]);
  const [parentCenters, setParentCenters] = useState<ParentCenter[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingParentCenters, setLoadingParentCenters] = useState(false);

  // 코드 검증
  const [codeCheck, setCodeCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'unavailable';
    message: string;
  }>({ status: 'idle', message: '' });

  // 센터 정보 로드
  useEffect(() => {
    const loadCenterData = async () => {
      if (!centerId || Array.isArray(centerId)) return;

      try {
        setLoading(true);
        const center = await centerService.getCenterById(parseInt(centerId));
        setOriginalCenter(center);
        
        // 폼 데이터 채우기
        setFormData({
          name: center.name || '',
          code: center.code || '',
          address: center.address || '',
          phone: center.phone || '',
          managerId: center.managerId?.toString() || '',
          parentCenterId: center.parentCenterId?.toString() || '',
          isActive: center.isActive ?? true,
        });

        setErrors({});
      } catch (error: any) {
        console.error('센터 정보 로드 실패:', error);
        alert('센터 정보를 불러올 수 없습니다.');
        router.push('/admin/centers/list');
      } finally {
        setLoading(false);
      }
    };

    loadCenterData();
  }, [centerId, router]);

  // 센터장 목록 로드
  useEffect(() => {
    const loadManagers = async () => {
      try {
        setLoadingManagers(true);
        
        // 모든 center_manager 타입 사용자 조회
        const response = await userService.getAllUsers({
          user_type: 'center_manager' as UserType,
          limit: 100
        });
        
        // 현재 센터의 관리자이거나 아직 센터를 관리하지 않는 사용자만 필터링
        const availableManagers = response.users
          .filter(user => 
            !user.center_id || 
            (originalCenter && user.id === originalCenter.managerId)
          )
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type
          }));
        
        setManagers(availableManagers);
      } catch (error) {
        console.error('센터장 목록 로드 실패:', error);
      } finally {
        setLoadingManagers(false);
      }
    };

    // originalCenter가 로드된 후에 센터장 목록 로드
    if (originalCenter !== null) {
      loadManagers();
    }
  }, [originalCenter]);

  // 상위 센터 목록 로드
  useEffect(() => {
    const loadParentCenters = async () => {
      try {
        setLoadingParentCenters(true);
        const centerList = await centerService.getManagedCenters();
        // 현재 센터는 상위 센터 목록에서 제외
        const filteredCenters = centerList.filter(center => 
          center.id !== parseInt(centerId as string)
        );
        setParentCenters(filteredCenters);
      } catch (error) {
        console.error('상위 센터 목록 로드 실패:', error);
      } finally {
        setLoadingParentCenters(false);
      }
    };

    if (centerId && !Array.isArray(centerId)) {
      loadParentCenters();
    }
  }, [centerId]);

  // 코드 중복 검사
  const checkCenterCode = async (code: string) => {
    if (!code || code === originalCenter?.code) {
      setCodeCheck({ status: 'idle', message: '' });
      return;
    }

    try {
      setCodeCheck({ status: 'checking', message: '코드 확인 중...' });
      const result = await centerService.checkCenterCode(code);
      
      if (result.available) {
        setCodeCheck({ status: 'available', message: '사용 가능한 코드입니다.' });
      } else {
        setCodeCheck({ status: 'unavailable', message: result.message || '사용할 수 없는 코드입니다.' });
      }
    } catch (error) {
      setCodeCheck({ status: 'unavailable', message: '코드 확인 중 오류가 발생했습니다.' });
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '센터명을 입력해주세요.';
    }

    if (!formData.code.trim()) {
      newErrors.code = '센터 코드를 입력해주세요.';
    } else if (!/^[A-Z]{2,4}[0-9]{3,4}$/.test(formData.code)) {
      newErrors.code = '센터 코드는 영문 대문자 2-4자 + 숫자 3-4자 형식이어야 합니다.';
    } else if (formData.code !== originalCenter?.code && codeCheck.status !== 'available') {
      newErrors.code = '센터 코드 중복 확인이 필요합니다.';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('입력 정보를 확인해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const updateData = {
        name: formData.name,
        code: formData.code,
        address: formData.address,
        phone: formData.phone,
        managerId: formData.managerId ? parseInt(formData.managerId) : undefined,
        parentCenterId: formData.parentCenterId ? parseInt(formData.parentCenterId) : undefined,
        isActive: formData.isActive,
      };

      await centerService.updateCenter(parseInt(centerId as string), updateData);
      
      alert('센터 정보가 성공적으로 수정되었습니다.');
      router.push('/admin/centers/list');
    } catch (error: any) {
      console.error('센터 수정 실패:', error);
      alert(error.message || '센터 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 다음 단계로
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.code.trim()) {
        alert('센터명과 코드를 입력해주세요.');
        return;
      }
      if (formData.code !== originalCenter?.code && codeCheck.status !== 'available') {
        alert('센터 코드 중복 확인이 필요합니다.');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.address.trim() || !formData.phone.trim()) {
        alert('주소와 전화번호를 입력해주세요.');
        return;
      }
    }

    setStep(step + 1);
  };

  // 이전 단계로
  const handlePrevStep = () => {
    setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">센터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">🏢 센터 정보 수정</h1>
              <p className="text-gray-600">센터 정보를 수정합니다.</p>
            </div>
            <Link
              href="/admin/centers/list"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {stepNumber === 1 && '기본 정보'}
                  {stepNumber === 2 && '위치 및 연락처'}
                  {stepNumber === 3 && '관리자 및 설정'}
                </span>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 센터명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    센터명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 강남 심리상담센터"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* 센터 코드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    센터 코드 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => {
                        const upperCode = e.target.value.toUpperCase();
                        setFormData({ ...formData, code: upperCode });
                        checkCenterCode(upperCode);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.code ? 'border-red-500' : 
                        codeCheck.status === 'available' ? 'border-green-500' :
                        codeCheck.status === 'unavailable' ? 'border-red-500' :
                        'border-gray-300'
                      }`}
                      placeholder="예: GANG001"
                      maxLength={8}
                    />
                    {codeCheck.status === 'checking' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  {codeCheck.message && (
                    <p className={`text-sm mt-1 ${
                      codeCheck.status === 'available' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {codeCheck.message}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    영문 대문자 2-4자 + 숫자 3-4자 (예: GANG001, SEOUL1234)
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 위치 및 연락처 */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">위치 및 연락처</h2>
              
              <div className="space-y-6">
                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 02-1234-5678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 관리자 및 설정 */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">관리자 및 설정</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 센터장 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    센터장
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingManagers}
                  >
                    <option value="">센터장을 선택하세요</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                  {loadingManagers && <p className="text-gray-500 text-sm mt-1">센터장 목록 로딩 중...</p>}
                </div>

                {/* 상위 센터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상위 센터
                  </label>
                  <select
                    value={formData.parentCenterId}
                    onChange={(e) => setFormData({ ...formData, parentCenterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingParentCenters}
                  >
                    <option value="">상위 센터를 선택하세요</option>
                    {parentCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name} ({center.code})
                      </option>
                    ))}
                  </select>
                  {loadingParentCenters && <p className="text-gray-500 text-sm mt-1">센터 목록 로딩 중...</p>}
                </div>
              </div>

              {/* 활성 상태 */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">센터 활성화</span>
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  비활성화하면 센터가 시스템에서 숨겨집니다.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  )}
                  {submitting ? '수정 중...' : '센터 수정'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(EditCenterPage);
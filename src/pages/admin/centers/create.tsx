// 🏢 센터 등록 페이지 - 프리미엄 UI/UX 디자인

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import { centerService } from '@/services/center';
import { userService } from '@/services/user';
import { UserType } from '@/types/user';

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
  code: string;
}

const CreateCenterPage: React.FC = () => {
  const router = useRouter();
  const { user } = useStore();
  
  // 폼 데이터
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    managerId: '',
    parentCenterId: '',
    isActive: true
  });

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(1); // 다단계 폼
  const [showSuccess, setShowSuccess] = useState(false);

  // 데이터 상태
  const [managers, setManagers] = useState<Manager[]>([]);
  const [parentCenters, setParentCenters] = useState<ParentCenter[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);
  
  // 코드 중복 검사 상태
  const [codeCheckLoading, setCodeCheckLoading] = useState(false);
  const [codeCheckDebounce, setCodeCheckDebounce] = useState<NodeJS.Timeout | null>(null);

  // 센터장 목록 조회
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        const response = await userService.getAvailableManagers();
        setManagers(response);
      } catch (error) {
        console.error('센터장 목록 조회 실패:', error);
        // API 실패 시 빈 배열 사용
        setManagers([]);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  // 컴포넌트 언마운트 시 디바운스 정리
  useEffect(() => {
    return () => {
      if (codeCheckDebounce) {
        clearTimeout(codeCheckDebounce);
      }
    };
  }, [codeCheckDebounce]);

  // 상위 센터 목록 조회
  useEffect(() => {
    const fetchParentCenters = async () => {
      try {
        setLoadingCenters(true);
        const response = await centerService.getManagedCenters();
        setParentCenters(response.map(center => ({
          id: center.id,
          name: center.name,
          code: center.code || ''
        })));
      } catch (error) {
        console.error('상위 센터 목록 조회 실패:', error);
      } finally {
        setLoadingCenters(false);
      }
    };

    fetchParentCenters();
  }, []);

  // 폼 입력 처리
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 실시간 유효성 검증
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // 필드 블러 처리
  const handleFieldBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // 센터 코드 중복 검사
  const checkCodeAvailability = async (code: string) => {
    if (!code || !/^[A-Z]{2,4}[0-9]{3,4}$/.test(code)) {
      return;
    }

    try {
      setCodeCheckLoading(true);
      const result = await centerService.checkCenterCode(code);
      
      if (!result.available) {
        setErrors(prev => ({ 
          ...prev, 
          code: result.message || '이미 사용 중인 센터 코드입니다.' 
        }));
      } else {
        setErrors(prev => ({ ...prev, code: '' }));
      }
    } catch (error) {
      console.error('센터 코드 검사 실패:', error);
    } finally {
      setCodeCheckLoading(false);
    }
  };

  // 개별 필드 유효성 검증
  const validateField = (field: keyof FormData, value: string | boolean) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          error = '센터명은 최소 2자 이상 입력해주세요.';
        } else if (typeof value === 'string' && value.length > 50) {
          error = '센터명은 50자를 초과할 수 없습니다.';
        }
        break;
      
      case 'code':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          error = '센터 코드는 필수입니다.';
        } else if (!/^[A-Z]{2,4}[0-9]{3,4}$/.test(value.toString())) {
          error = '센터 코드 형식: 영문 대문자 2-4자 + 숫자 3-4자 (예: SEL001)';
        } else {
          // 형식이 올바르면 중복 검사 실행 (디바운스 적용)
          if (codeCheckDebounce) {
            clearTimeout(codeCheckDebounce);
          }
          const timeout = setTimeout(() => {
            checkCodeAvailability(value.toString());
          }, 500); // 500ms 디바운스
          setCodeCheckDebounce(timeout);
        }
        break;
      
      case 'address':
        if (!value || (typeof value === 'string' && value.trim().length < 5)) {
          error = '주소는 최소 5자 이상 입력해주세요.';
        }
        break;
      
      case 'phone':
        if (!value || typeof value !== 'string') {
          error = '전화번호는 필수입니다.';
        } else if (!/^[0-9-+().\s]+$/.test(value)) {
          error = '올바른 전화번호 형식을 입력해주세요.';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  // 전체 폼 유효성 검증
  const validateForm = (): boolean => {
    const fields: (keyof FormData)[] = ['name', 'code', 'address', 'phone'];
    let isValid = true;

    fields.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });

    setTouched(Object.fromEntries(fields.map(field => [field, true])));
    return isValid;
  };

  // 다음 단계로
  const handleNext = () => {
    if (step === 1) {
      const basicFields = validateField('name', formData.name) && 
                          validateField('code', formData.code);
      if (basicFields) {
        setStep(2);
      }
    } else if (step === 2) {
      const contactFields = validateField('address', formData.address) && 
                           validateField('phone', formData.phone);
      if (contactFields) {
        setStep(3);
      }
    }
  };

  // 이전 단계로
  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        managerId: formData.managerId ? parseInt(formData.managerId) : undefined,
        parentCenterId: formData.parentCenterId ? parseInt(formData.parentCenterId) : undefined,
        isActive: formData.isActive
      };

      await centerService.createCenter(submitData);
      
      // 성공 애니메이션
      setShowSuccess(true);
      
      setTimeout(() => {
        router.push('/admin/centers/list');
      }, 2000);
      
    } catch (error: any) {
      console.error('센터 등록 실패:', error);
      
      // 상세한 에러 처리
      if (error.statusCode === 409) {
        // 중복 에러
        setErrors({ code: '이미 존재하는 센터 코드입니다.' });
        setStep(1); // 첫 번째 단계로 이동
      } else if (error.statusCode === 400) {
        // 유효성 검증 실패
        const validationErrors: ValidationErrors = {};
        if (error.message.includes('센터명')) {
          validationErrors.name = '유효하지 않은 센터명입니다.';
        }
        if (error.message.includes('코드')) {
          validationErrors.code = '유효하지 않은 센터 코드입니다.';
        }
        if (error.message.includes('주소')) {
          validationErrors.address = '유효하지 않은 주소입니다.';
        }
        if (error.message.includes('전화번호')) {
          validationErrors.phone = '유효하지 않은 전화번호입니다.';
        }
        if (error.message.includes('센터장')) {
          validationErrors.managerId = '유효하지 않은 센터장입니다.';
        }
        setErrors(validationErrors);
      } else if (error.statusCode === 403) {
        alert('센터를 등록할 권한이 없습니다.');
      } else if (error.statusCode === 0) {
        alert('네트워크 연결을 확인해주세요.');
      } else {
        alert(error.message || '센터 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 성공 모달
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center transform animate-pulse">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">센터 등록 완료! 🎉</h2>
          <p className="text-gray-600 mb-4">
            <span className="font-semibold text-blue-600">{formData.name}</span> 센터가<br/>
            성공적으로 등록되었습니다.
          </p>
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin/centers/list"
              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 센터 등록</h1>
              <p className="text-gray-600 mt-1">전문 상담 센터를 새롭게 개설합니다</p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step >= num 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > num ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{num}</span>
                    )}
                  </div>
                  {num < 3 && (
                    <div className={`w-12 h-0.5 transition-all duration-300 ${
                      step > num ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 단계별 제목 */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              {step === 1 && '📋 기본 정보'}
              {step === 2 && '📍 위치 및 연락처'}
              {step === 3 && '👥 관리자 및 설정'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {step === 1 && '센터의 기본 정보를 입력해주세요'}
              {step === 2 && '센터의 위치와 연락처를 입력해주세요'}
              {step === 3 && '센터 관리자와 추가 설정을 완료해주세요'}
            </p>
          </div>
        </div>

        {/* 메인 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Step 1: 기본 정보 */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                {/* 센터명 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    센터명
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                      placeholder="예: 강남 심리상담센터"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                      }`}
                      maxLength={50}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400">{formData.name.length}/50</span>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* 센터 코드 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    센터 코드
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      onBlur={() => handleFieldBlur('code')}
                      placeholder="예: SEL001, GN002"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none uppercase ${
                        errors.code 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                      }`}
                      maxLength={8}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {codeCheckLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded ${
                          formData.code.length > 0 && !errors.code 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {formData.code.length > 0 && !errors.code ? '✓ 사용가능' : 'ABC123'}
                        </span>
                      )}
                    </div>
                  </div>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.code}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    센터를 구분하는 고유 코드입니다. 영문 대문자와 숫자를 조합해주세요.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: 위치 및 연락처 */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                {/* 주소 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    센터 주소
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onBlur={() => handleFieldBlur('address')}
                    placeholder="예: 서울특별시 강남구 테헤란로 123, 센터빌딩 5층"
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none resize-none ${
                      errors.address 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                    }`}
                    maxLength={200}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    대표 전화번호
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      placeholder="예: 02-1234-5678, 010-1234-5678"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: 관리자 및 설정 */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                {/* 센터장 선택 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    센터장 지정
                    <span className="text-gray-500 text-xs ml-2">(선택사항)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.managerId}
                      onChange={(e) => handleInputChange('managerId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 appearance-none bg-white"
                      disabled={loadingManagers}
                    >
                      <option value="">센터장을 선택하세요 (나중에 지정 가능)</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} ({manager.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {loadingManagers ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* 상위 센터 선택 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    상위 센터
                    <span className="text-gray-500 text-xs ml-2">(선택사항)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.parentCenterId}
                      onChange={(e) => handleInputChange('parentCenterId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 appearance-none bg-white"
                      disabled={loadingCenters}
                    >
                      <option value="">독립 센터 (상위 센터 없음)</option>
                      {parentCenters.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name} ({center.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {loadingCenters ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* 활성 상태 */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        센터 활성 상태
                      </label>
                      <p className="text-xs text-gray-600">
                        활성화된 센터만 예약 및 상담 서비스를 제공할 수 있습니다.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleInputChange('isActive', !formData.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData.isActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-3 text-sm font-medium ${
                        formData.isActive ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formData.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 폼 액션 버튼 */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    이전
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/centers/list"
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  취소
                </Link>
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                  >
                    다음
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        등록 중...
                      </>
                    ) : (
                      <>
                        🏢 센터 등록 완료
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* 도움말 섹션 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            센터 등록 가이드
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">센터 코드</h4>
                <p className="text-gray-600">지역명(2-4자) + 순번(3-4자) 형식으로 작성</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">센터장</h4>
                <p className="text-gray-600">센터 개설 후에도 변경 가능합니다</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">상위 센터</h4>
                <p className="text-gray-600">지역별 계층 구조 관리에 활용됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(CreateCenterPage);
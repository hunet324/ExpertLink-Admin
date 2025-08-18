import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { RegisterFormData } from '@/types/auth';
import { UserType } from '@/types/user';
import { ApiError } from '@/types/auth';
import { authService } from '@/services/auth';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'expert',
    bio: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [error, setError] = useState<string>('');
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = authService.getUserTypeRedirectPath(user.userType);
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  // 비밀번호 확인 검증
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 입력 시 에러 메시지 초기화
    if (error) {
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      setError('이름은 2자 이상이어야 합니다.');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    
    if (!passwordMatch) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (!formData.agreeToTerms) {
      setError('이용약관에 동의해주세요.');
      return false;
    }
    
    if (!formData.agreeToPrivacy) {
      setError('개인정보처리방침에 동의해주세요.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const registerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
        userType: formData.userType
      };
      
      console.log('회원가입 데이터:', registerData);
      
      // 회원가입 API 호출 (승인 대기 상태로 계정 생성, 로그인하지 않음)
      await authService.register(registerData);

      // 회원가입 성공 상태 설정 (로그인은 하지 않음)
      setRegistrationSuccess(true);
      
    } catch (err) {
      // API 에러 처리
      const apiError = err as ApiError;
      
      if (apiError.statusCode === 409) {
        setError('이미 등록된 이메일입니다.');
      } else if (apiError.statusCode === 0) {
        setError('네트워크 연결을 확인해주세요.');
      } else if (typeof apiError.message === 'string') {
        setError(apiError.message);
      } else if (Array.isArray(apiError.message)) {
        setError(apiError.message[0]);
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 회원가입 성공 화면
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-12">
            <h1 className="text-h1 text-logo-main font-bold mb-4">
              ExpertLink
            </h1>
            <div className="bg-white rounded-custom shadow-large p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-success">✓</span>
                </div>
                <h2 className="text-h2 font-bold text-secondary-700 mb-4">
                  회원가입 신청이 완료되었습니다
                </h2>
                <p className="text-body text-secondary-500 mb-6">
                  전문가 계정 승인을 위해 관리자 검토가 진행됩니다.<br />
                  승인 완료 시 등록하신 이메일로 안내드리겠습니다.
                </p>
                <div className="bg-background-50 p-4 rounded-lg mb-6">
                  <p className="text-caption text-secondary-400">
                    • 승인까지 영업일 기준 1-3일 소요됩니다<br />
                    • 승인 결과는 이메일로 통보됩니다<br />
                    • 문의사항은 고객지원팀으로 연락해주세요
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-block w-full bg-primary text-white py-4 px-6 rounded-custom text-body font-semibold
                          hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                          transition-all duration-smooth transform hover:scale-[1.01]"
              >
                로그인 페이지로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* 로고 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-logo-main font-bold mb-4">
            ExpertLink
          </h1>
          <p className="text-h3 text-secondary-400 font-normal">
            심리상담 전문가 회원가입
          </p>
          <p className="text-body text-secondary-500 mt-2">
            전문가 계정 생성 후 관리자 승인을 거쳐 서비스를 이용하실 수 있습니다
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-custom shadow-large p-12">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-error mr-2">⚠️</span>
                <span className="text-error text-body">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="space-y-6">
              <h3 className="text-h3 font-semibold text-secondary-700 border-b border-background-200 pb-3">
                기본 정보
              </h3>
              
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-body font-medium text-secondary-600 mb-3">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border border-background-300 rounded-custom text-body 
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50"
                  placeholder="성명을 입력하세요 (2자 이상)"
                  minLength={2}
                  required
                />
              </div>

              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-body font-medium text-secondary-600 mb-3">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border border-background-300 rounded-custom text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50"
                  placeholder="이메일 주소를 입력하세요"
                  required
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="phone" className="block text-body font-medium text-secondary-600 mb-3">
                  전화번호
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border border-background-300 rounded-custom text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50"
                  placeholder="전화번호를 입력하세요 (선택사항)"
                />
              </div>

            </div>

            {/* 비밀번호 섹션 */}
            <div className="space-y-6">
              <h3 className="text-h3 font-semibold text-secondary-700 border-b border-background-200 pb-3">
                비밀번호 설정
              </h3>
              
              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-body font-medium text-secondary-600 mb-3">
                  비밀번호 *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border border-background-300 rounded-custom text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50"
                  placeholder="8자 이상의 비밀번호를 입력하세요"
                  required
                />
                <p className="mt-2 text-caption text-secondary-400">
                  8자 이상의 영문, 숫자, 특수문자를 조합하여 입력하세요
                </p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-body font-medium text-secondary-600 mb-3">
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 border rounded-custom text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50 ${
                              formData.confirmPassword && !passwordMatch 
                                ? 'border-error' 
                                : 'border-background-300'
                            }`}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
                {formData.confirmPassword && !passwordMatch && (
                  <p className="mt-2 text-caption text-error">
                    비밀번호가 일치하지 않습니다
                  </p>
                )}
                {formData.confirmPassword && passwordMatch && (
                  <p className="mt-2 text-caption text-success">
                    비밀번호가 일치합니다
                  </p>
                )}
              </div>
            </div>

            {/* 전문가 정보 섹션 */}
            <div className="space-y-6">
              <h3 className="text-h3 font-semibold text-secondary-700 border-b border-background-200 pb-3">
                전문가 정보
              </h3>
              
              {/* 자기소개 */}
              <div>
                <label htmlFor="bio" className="block text-body font-medium text-secondary-600 mb-3">
                  자기소개 (선택사항)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 border border-background-300 rounded-custom text-body
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                            placeholder:text-background-500 bg-background-50 resize-vertical"
                  placeholder="전문 분야, 경력, 상담 스타일 등을 소개해주세요"
                />
                <p className="mt-2 text-caption text-secondary-400">
                  심리상담 전문 분야, 학력, 경력사항, 상담 접근 방식 등을 자세히 작성해주세요<br />
                  <span className="text-primary">※ 이 정보는 승인 후 프로필 설정에서 추가 입력 가능합니다</span>
                </p>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-4 pt-6 border-t border-background-200">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary border-background-300 rounded focus:ring-2 focus:ring-primary mt-1"
                  required
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-body text-secondary-600">
                  <span className="text-error">*</span> 
                  <Link href="/terms" className="text-primary hover:text-primary-600 transition-colors underline">
                    이용약관
                  </Link>에 동의합니다
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary border-background-300 rounded focus:ring-2 focus:ring-primary mt-1"
                  required
                />
                <label htmlFor="agreeToPrivacy" className="ml-3 text-body text-secondary-600">
                  <span className="text-error">*</span> 
                  <Link href="/privacy" className="text-primary hover:text-primary-600 transition-colors underline">
                    개인정보처리방침
                  </Link>에 동의합니다
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting || !passwordMatch}
              className={`w-full bg-primary text-white py-4 px-6 rounded-custom text-body font-semibold
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                        transition-all duration-smooth ${
                          isSubmitting || !passwordMatch
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:bg-primary-600 transform hover:scale-[1.01]'
                        }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  회원가입 처리 중...
                </div>
              ) : (
                '전문가 회원가입 신청'
              )}
            </button>
          </form>

          {/* 하단 안내 */}
          <div className="mt-8 text-center border-t border-background-200 pt-6">
            <p className="text-body text-secondary-500 mb-4">
              이미 계정이 있으신가요?
            </p>
            <Link 
              href="/login" 
              className="inline-block w-full bg-secondary-100 text-secondary-700 py-4 px-6 rounded-custom text-body font-semibold
                        hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 
                        transition-all duration-smooth transform hover:scale-[1.01]"
            >
              로그인
            </Link>
          </div>
        </div>

        {/* 하단 지원 */}
        <div className="mt-8 text-center">
          <p className="text-caption text-secondary-300">
            회원가입에 문제가 있으시나요?{' '}
            <Link href="/support" className="text-primary hover:text-primary-600 transition-colors">
              기술지원 요청
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { useStore } from '@/store/useStore';
import passwordService, { PasswordInfo } from '@/services/passwordService';

interface PasswordRequirement {
  key: string;
  description: string;
  regex: RegExp;
  met: boolean;
}

const PasswordChangePage: React.FC = () => {
  const router = useRouter();
  const { user } = useStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordInfo, setPasswordInfo] = useState<PasswordInfo | null>(null);

  // 비밀번호 검증 및 강도 계산
  const passwordValidation = passwordService.validatePasswordStrength(newPassword);
  const isPasswordValid = passwordService.isPasswordValid(newPassword);
  const isFormValid = currentPassword && newPassword && confirmPassword && 
                     isPasswordValid && newPassword === confirmPassword;

  // 비밀번호 정보 로드
  const loadPasswordInfo = async () => {
    try {
      const info = await passwordService.getPasswordInfo();
      setPasswordInfo(info);
      setError(null);
    } catch (err: any) {
      console.error('비밀번호 정보 로드 실패:', err);
      setError('비밀번호 정보를 불러오는데 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 정보 로드
  useEffect(() => {
    if (user) {
      loadPasswordInfo();
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await passwordService.changePassword({
        currentPassword,
        newPassword
      });
      
      // 성공 처리
      alert(result.message);
      
      // 폼 초기화
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // 비밀번호 정보 새로고침
      await loadPasswordInfo();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 체크 및 로딩 상태
  if (!user) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (!passwordInfo) {
    return (
      <div className="flex h-screen bg-background-50">
        <Sidebar userType={user.userType || 'general'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType={user.userType || 'general'} 
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">🔑</span>
                비밀번호 변경
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 프로필 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{passwordInfo.name.charAt(0)}</span>
                </div>
                <span className="text-body text-secondary-600">{passwordInfo.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 현재 계정 정보 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <h2 className="text-h4 font-semibold text-secondary mb-4">계정 정보</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-secondary-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{passwordInfo.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-body font-medium text-secondary-700">{passwordInfo.name}</div>
                        <div className="text-caption text-secondary-500">{passwordInfo.email}</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-background-200 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-caption text-secondary-500">역할</span>
                        <span className="text-caption text-secondary-700">{passwordInfo.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-caption text-secondary-500">총 로그인</span>
                        <span className="text-caption text-secondary-700">{passwordInfo.loginCount}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-caption text-secondary-500">최종 로그인</span>
                        <span className="text-caption text-secondary-700">
                          {passwordInfo.lastLogin ? passwordService.formatDate(passwordInfo.lastLogin) : '없음'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 비밀번호 상태 */}
                <div className="bg-white rounded-custom shadow-soft p-6 mt-6">
                  <h3 className="text-h4 font-semibold text-secondary mb-4">비밀번호 상태</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-caption text-secondary-500 mb-1">최근 변경일</div>
                      <div className="text-body text-secondary-700">
                        {passwordService.formatDate(passwordInfo.lastPasswordChange)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-caption text-secondary-500 mb-1">경과 시간</div>
                      <div className={`text-body ${passwordInfo.isPasswordExpiringSoon ? 'text-error' : 'text-secondary-700'}`}>
                        {passwordInfo.daysSinceLastChange}일 전
                      </div>
                      {passwordInfo.isPasswordExpiringSoon && (
                        <div className="text-xs text-error mt-1">
                          ⚠️ 비밀번호 변경을 권장합니다
                        </div>
                      )}
                    </div>

                    <div className={`p-3 rounded-lg ${passwordInfo.isPasswordExpiringSoon ? 'bg-error-50' : 'bg-accent-50'}`}>
                      <div className={`text-caption ${passwordInfo.isPasswordExpiringSoon ? 'text-error-700' : 'text-accent-700'}`}>
                        {passwordInfo.isPasswordExpiringSoon 
                          ? '보안을 위해 비밀번호를 변경해주세요'
                          : '비밀번호가 안전하게 관리되고 있습니다'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비밀번호 변경 폼 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <h2 className="text-h4 font-semibold text-secondary mb-6">새 비밀번호 설정</h2>
                  
                  {/* 에러 메시지 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* 현재 비밀번호 */}
                    <div>
                      <label className="block text-caption font-medium text-secondary-700 mb-2">
                        현재 비밀번호 <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                          placeholder="현재 비밀번호를 입력하세요"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          {showCurrentPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* 새 비밀번호 */}
                    <div>
                      <label className="block text-caption font-medium text-secondary-700 mb-2">
                        새 비밀번호 <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                          placeholder="새 비밀번호를 입력하세요"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          {showNewPassword ? '🙈' : '👁️'}
                        </button>
                      </div>

                      {/* 비밀번호 강도 표시 */}
                      {newPassword && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-caption text-secondary-500">비밀번호 강도</span>
                            <span className={`text-caption font-medium ${
                              passwordValidation.level === 'strong' ? 'text-green-600' :
                              passwordValidation.level === 'medium' ? 'text-yellow-600' : 
                              passwordValidation.level === 'weak' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {passwordValidation.text}
                            </span>
                          </div>
                          <div className="w-full bg-background-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${passwordValidation.color}`}
                              style={{ width: `${(passwordValidation.requirements.filter(req => req.met).length / passwordValidation.requirements.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                      <label className="block text-caption font-medium text-secondary-700 mb-2">
                        새 비밀번호 확인 <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${
                            confirmPassword && newPassword !== confirmPassword
                              ? 'border-error focus:border-error focus:ring-error-100'
                              : 'border-background-300 focus:border-primary-400 focus:ring-primary-100'
                          }`}
                          placeholder="새 비밀번호를 다시 입력하세요"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-caption text-error mt-1">비밀번호가 일치하지 않습니다</p>
                      )}
                      {confirmPassword && newPassword === confirmPassword && (
                        <p className="text-caption text-accent mt-1">✓ 비밀번호가 일치합니다</p>
                      )}
                    </div>

                    {/* 비밀번호 요구사항 */}
                    <div className="bg-background-50 p-4 rounded-lg">
                      <h4 className="text-caption font-medium text-secondary-700 mb-3">비밀번호 요구사항</h4>
                      <div className="space-y-2">
                        {passwordValidation.requirements.map((requirement) => (
                          <div key={requirement.key} className="flex items-center space-x-2">
                            <span className={`text-sm ${requirement.met ? '✅' : '❌'}`}></span>
                            <span className={`text-caption ${
                              requirement.met ? 'text-green-600' : 'text-secondary-500'
                            }`}>
                              {requirement.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="pt-6 border-t border-background-200">
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="bg-background-300 text-secondary-600 px-6 py-3 rounded-lg hover:bg-background-400 transition-colors"
                        >
                          초기화
                        </button>
                        <button
                          type="submit"
                          disabled={!isFormValid || isLoading}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            isFormValid && !isLoading
                              ? 'bg-primary text-white hover:bg-primary-600'
                              : 'bg-background-300 text-secondary-400 cursor-not-allowed'
                          }`}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>변경 중...</span>
                            </div>
                          ) : (
                            '비밀번호 변경'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* 보안 팁 */}
                <div className="bg-white rounded-custom shadow-soft p-6 mt-6">
                  <h3 className="text-h4 font-semibold text-secondary mb-4">보안 팁</h3>
                  <div className="space-y-3 text-caption text-secondary-600">
                    <div className="flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>정기적으로 비밀번호를 변경하세요 (권장: 3개월마다)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>다른 서비스에서 사용하는 비밀번호와 다르게 설정하세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>개인정보나 쉽게 추측할 수 있는 단어는 피하세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>2단계 인증을 활성화하여 계정 보안을 강화하세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>공용 컴퓨터에서는 로그인을 피하고, 사용 후 반드시 로그아웃하세요</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PasswordChangePage;
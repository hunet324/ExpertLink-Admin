// 수퍼관리자 전용 글로벌 시스템 설정 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';

interface GlobalSettings {
  systemName: string;
  systemDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  apiRateLimit: number;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  logRetentionDays: number;
  defaultUserType: 'general' | 'expert';
  allowGuestAccess: boolean;
}

const GlobalSettingsPage: React.FC = () => {
  const { user } = useStore();
  
  const [settings, setSettings] = useState<GlobalSettings>({
    systemName: 'ExpertLink',
    systemDescription: '전문가 상담 플랫폼',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    apiRateLimit: 100,
    backupFrequency: 'daily',
    logRetentionDays: 90,
    defaultUserType: 'general',
    allowGuestAccess: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const userType = user?.user_type || user?.userType;

  // 글로벌 설정 조회
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Mock 데이터 (실제로는 API 호출)
        // 현재 설정값이 기본값으로 유지됨
        
        setError('');
      } catch (err: any) {
        console.error('글로벌 설정 조회 실패:', err);
        setError(err.message || '설정을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 설정 저장
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // 실제로는 API 호출
      console.log('글로벌 설정 저장:', settings);
      
      // 임시 지연 (API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('설정이 성공적으로 저장되었습니다.');
      
      // 성공 메시지 자동 제거
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('설정 저장 실패:', err);
      setError(err.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 시스템 재시작
  const handleSystemRestart = async () => {
    if (!confirm('시스템을 재시작하시겠습니까? 모든 사용자가 일시적으로 연결이 끊어집니다.')) {
      return;
    }

    try {
      // 실제로는 API 호출
      console.log('시스템 재시작 요청');
      alert('시스템 재시작이 예약되었습니다. 약 2분 후 재시작됩니다.');
    } catch (err: any) {
      console.error('시스템 재시작 실패:', err);
      alert(err.message || '시스템 재시작에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin/super-admin/global-dashboard"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 전체 시스템 현황
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">🔧 글로벌 시스템 설정</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">전체 시스템 운영 설정 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSystemRestart}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                시스템 재시작
              </button>
              <Link
                href="/admin/super-admin/backup-restore"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                백업 관리
              </Link>
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

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* 설정 폼 */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* 기본 시스템 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 시스템 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시스템 이름
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기본 사용자 타입
                </label>
                <select
                  value={settings.defaultUserType}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultUserType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">일반 사용자</option>
                  <option value="expert">전문가</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시스템 설명
                </label>
                <textarea
                  value={settings.systemDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">유지보수 모드 (모든 사용자 접근 차단)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.registrationEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">신규 가입 허용</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowGuestAccess}
                  onChange={(e) => setSettings(prev => ({ ...prev, allowGuestAccess: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">게스트 접근 허용</span>
              </label>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">보안 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 최소 길이
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  세션 타임아웃 (분)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 요청 제한 (분당)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 파일 업로드 크기 (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileUploadSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileUploadSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireSpecialChars}
                  onChange={(e) => setSettings(prev => ({ ...prev, passwordRequireSpecialChars: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">비밀번호에 특수문자 필수</span>
              </label>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotificationsEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">이메일 알림 활성화</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smsNotificationsEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, smsNotificationsEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">SMS 알림 활성화</span>
              </label>
            </div>
          </div>

          {/* 백업 및 로그 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">백업 및 로그 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  백업 주기
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  로그 보관 기간 (일)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.logRetentionDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                설정 변경사항은 즉시 적용되며, 일부 설정은 시스템 재시작이 필요할 수 있습니다.
              </p>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {saving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(GlobalSettingsPage);
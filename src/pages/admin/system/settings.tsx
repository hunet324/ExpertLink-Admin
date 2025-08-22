import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface SystemSetting {
  category: string;
  key: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  unit?: string;
}

interface SettingCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  settings: SystemSetting[];
}

const OperationSettingsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 시스템 설정 데이터
  const [settingCategories, setSettingCategories] = useState<SettingCategory[]>([
    {
      id: 'general',
      name: '일반 설정',
      icon: '⚙️',
      description: '플랫폼의 기본적인 운영 설정을 관리합니다',
      settings: [
        {
          category: 'general',
          key: 'platform_name',
          name: '플랫폼 이름',
          description: '서비스의 공식 명칭입니다',
          value: 'ExpertLink',
          type: 'text',
          required: true
        },
        {
          category: 'general',
          key: 'support_email',
          name: '고객지원 이메일',
          description: '고객 문의를 받는 이메일 주소입니다',
          value: 'support@expertlink.com',
          type: 'text',
          required: true
        },
        {
          category: 'general',
          key: 'maintenance_mode',
          name: '점검 모드',
          description: '점검 모드 활성화 시 서비스가 일시 중단됩니다',
          value: false,
          type: 'boolean'
        },
        {
          category: 'general',
          key: 'max_upload_size',
          name: '최대 업로드 크기',
          description: '파일 업로드 시 최대 허용 크기입니다',
          value: 50,
          type: 'number',
          min: 1,
          max: 500,
          unit: 'MB'
        },
        {
          category: 'general',
          key: 'timezone',
          name: '시스템 시간대',
          description: '플랫폼에서 사용할 기본 시간대입니다',
          value: 'Asia/Seoul',
          type: 'select',
          options: ['Asia/Seoul', 'UTC', 'America/New_York', 'Europe/London']
        }
      ]
    },
    {
      id: 'user',
      name: '사용자 설정',
      icon: '👤',
      description: '사용자 계정 및 인증 관련 설정을 관리합니다',
      settings: [
        {
          category: 'user',
          key: 'require_email_verification',
          name: '이메일 인증 필수',
          description: '회원가입 시 이메일 인증을 필수로 설정합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'user',
          key: 'require_phone_verification',
          name: '전화번호 인증 필수',
          description: '회원가입 시 전화번호 인증을 필수로 설정합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'user',
          key: 'password_min_length',
          name: '최소 비밀번호 길이',
          description: '사용자 비밀번호의 최소 길이입니다',
          value: 8,
          type: 'number',
          min: 4,
          max: 50,
          unit: '자'
        },
        {
          category: 'user',
          key: 'session_timeout',
          name: '세션 만료 시간',
          description: '사용자 세션이 자동으로 만료되는 시간입니다',
          value: 60,
          type: 'number',
          min: 15,
          max: 480,
          unit: '분'
        },
        {
          category: 'user',
          key: 'max_login_attempts',
          name: '최대 로그인 시도 횟수',
          description: '계정 잠금 전 최대 로그인 시도 횟수입니다',
          value: 5,
          type: 'number',
          min: 3,
          max: 10,
          unit: '회'
        }
      ]
    },
    {
      id: 'payment',
      name: '결제 설정',
      icon: '💳',
      description: '결제 시스템 및 수수료 관련 설정을 관리합니다',
      settings: [
        {
          category: 'payment',
          key: 'platform_commission_rate',
          name: '플랫폼 수수료율',
          description: '거래 시 플랫폼에서 가져가는 수수료 비율입니다',
          value: 15,
          type: 'number',
          min: 0,
          max: 50,
          unit: '%'
        },
        {
          category: 'payment',
          key: 'min_payment_amount',
          name: '최소 결제 금액',
          description: '한 번에 결제할 수 있는 최소 금액입니다',
          value: 10000,
          type: 'number',
          min: 1000,
          max: 100000,
          unit: '원'
        },
        {
          category: 'payment',
          key: 'max_payment_amount',
          name: '최대 결제 금액',
          description: '한 번에 결제할 수 있는 최대 금액입니다',
          value: 500000,
          type: 'number',
          min: 100000,
          max: 10000000,
          unit: '원'
        },
        {
          category: 'payment',
          key: 'refund_enabled',
          name: '환불 기능 활성화',
          description: '결제 후 환불 신청을 허용합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'payment',
          key: 'refund_period',
          name: '환불 가능 기간',
          description: '결제 후 환불 신청이 가능한 기간입니다',
          value: 7,
          type: 'number',
          min: 1,
          max: 30,
          unit: '일'
        }
      ]
    },
    {
      id: 'consultation',
      name: '상담 설정',
      icon: '💬',
      description: '상담 서비스 운영과 관련된 설정을 관리합니다',
      settings: [
        {
          category: 'consultation',
          key: 'video_session_duration',
          name: '화상상담 기본 시간',
          description: '화상상담의 기본 진행 시간입니다',
          value: 50,
          type: 'number',
          min: 30,
          max: 120,
          unit: '분'
        },
        {
          category: 'consultation',
          key: 'chat_session_duration',
          name: '채팅상담 기본 시간',
          description: '채팅상담의 기본 진행 시간입니다',
          value: 60,
          type: 'number',
          min: 30,
          max: 180,
          unit: '분'
        },
        {
          category: 'consultation',
          key: 'booking_advance_time',
          name: '예약 가능 시간',
          description: '상담 예약을 얼마나 미리 할 수 있는지 설정합니다',
          value: 24,
          type: 'number',
          min: 1,
          max: 168,
          unit: '시간'
        },
        {
          category: 'consultation',
          key: 'cancellation_period',
          name: '취소 가능 기간',
          description: '상담 시작 전 취소가 가능한 시간입니다',
          value: 2,
          type: 'number',
          min: 1,
          max: 24,
          unit: '시간'
        },
        {
          category: 'consultation',
          key: 'auto_assignment',
          name: '자동 배정',
          description: '전문가 자동 배정 기능을 활성화합니다',
          value: false,
          type: 'boolean'
        }
      ]
    },
    {
      id: 'notification',
      name: '알림 설정',
      icon: '🔔',
      description: '시스템 알림 및 메시지 관련 설정을 관리합니다',
      settings: [
        {
          category: 'notification',
          key: 'email_notifications',
          name: '이메일 알림',
          description: '시스템 알림을 이메일로 발송합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'notification',
          key: 'sms_notifications',
          name: 'SMS 알림',
          description: '중요한 알림을 SMS로 발송합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'notification',
          key: 'push_notifications',
          name: '푸시 알림',
          description: '앱 푸시 알림을 활성화합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'notification',
          key: 'notification_retention_days',
          name: '알림 보관 기간',
          description: '알림 내역을 보관하는 기간입니다',
          value: 30,
          type: 'number',
          min: 7,
          max: 365,
          unit: '일'
        },
        {
          category: 'notification',
          key: 'email_from_address',
          name: '발신 이메일 주소',
          description: '시스템에서 발송하는 이메일의 발신 주소입니다',
          value: 'noreply@expertlink.com',
          type: 'text',
          required: true
        }
      ]
    },
    {
      id: 'security',
      name: '보안 설정',
      icon: '🔒',
      description: '시스템 보안과 관련된 설정을 관리합니다',
      settings: [
        {
          category: 'security',
          key: 'two_factor_auth',
          name: '2단계 인증',
          description: '관리자 계정의 2단계 인증을 필수로 설정합니다',
          value: true,
          type: 'boolean'
        },
        {
          category: 'security',
          key: 'ip_whitelist_enabled',
          name: 'IP 화이트리스트',
          description: '특정 IP에서만 관리자 접근을 허용합니다',
          value: false,
          type: 'boolean'
        },
        {
          category: 'security',
          key: 'allowed_ips',
          name: '허용된 IP 주소',
          description: '관리자 접근이 허용된 IP 주소 목록입니다',
          value: '192.168.1.0/24, 10.0.0.0/8',
          type: 'textarea'
        },
        {
          category: 'security',
          key: 'password_expire_days',
          name: '비밀번호 만료 기간',
          description: '관리자 비밀번호의 강제 변경 주기입니다',
          value: 90,
          type: 'number',
          min: 30,
          max: 365,
          unit: '일'
        },
        {
          category: 'security',
          key: 'audit_log_retention',
          name: '감사 로그 보관 기간',
          description: '보안 감사 로그를 보관하는 기간입니다',
          value: 365,
          type: 'number',
          min: 30,
          max: 3650,
          unit: '일'
        }
      ]
    }
  ]);

  const selectedCategoryData = settingCategories.find(cat => cat.id === selectedCategory);

  const filteredSettings = selectedCategoryData?.settings.filter(setting =>
    setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSettingChange = (categoryId: string, key: string, value: string | number | boolean) => {
    setSettingCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          settings: category.settings.map(setting => 
            setting.key === key ? { ...setting, value } : setting
          )
        };
      }
      return category;
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // 설정 저장 로직
    alert('설정이 저장되었습니다.');
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    if (confirm('설정을 기본값으로 되돌리시겠습니까?')) {
      // 기본값으로 리셋하는 로직
      alert('설정이 기본값으로 되돌려졌습니다.');
      setHasChanges(false);
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const baseInputClass = "w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
    
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(setting.category, setting.key, e.target.checked)}
              className="w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-400 focus:ring-2"
            />
            <span className="text-caption text-secondary-600">
              {setting.value ? '활성화' : '비활성화'}
            </span>
          </label>
        );
      
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={setting.value as number}
              min={setting.min}
              max={setting.max}
              onChange={(e) => handleSettingChange(setting.category, setting.key, Number(e.target.value))}
              className={baseInputClass}
            />
            {setting.unit && (
              <span className="text-caption text-secondary-500 whitespace-nowrap">{setting.unit}</span>
            )}
          </div>
        );
      
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.category, setting.key, e.target.value)}
            className={baseInputClass}
          >
            {setting.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.category, setting.key, e.target.value)}
            rows={3}
            className={baseInputClass}
            placeholder={setting.description}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.category, setting.key, e.target.value)}
            className={baseInputClass}
            required={setting.required}
            placeholder={setting.description}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="super_admin" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">⚙️</span>
                운영 기본 설정
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                플랫폼의 운영과 관련된 기본 설정을 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <div className="flex items-center space-x-2 text-caption text-secondary-600 bg-secondary-100 px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
                  <span>저장되지 않은 변경사항</span>
                </div>
              )}

              {/* 프로필 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">관</span>
                </div>
                <span className="text-body text-secondary-600">관리자</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 flex overflow-hidden">
          {/* 카테고리 사이드바 */}
          <div className="w-80 bg-white border-r border-background-200 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="설정 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="space-y-2">
                {settingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full p-4 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-background-100 text-secondary-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="text-body font-medium">{category.name}</div>
                        <div className="text-caption text-secondary-400">{category.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 설정 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedCategoryData && (
              <>
                <div className="mb-6">
                  <h2 className="text-h3 font-semibold text-secondary flex items-center">
                    <span className="mr-3 text-2xl">{selectedCategoryData.icon}</span>
                    {selectedCategoryData.name}
                  </h2>
                  <p className="text-caption text-secondary-400 mt-1">
                    {selectedCategoryData.description}
                  </p>
                </div>

                <div className="space-y-6">
                  {filteredSettings.map((setting) => (
                    <div key={setting.key} className="bg-white rounded-custom shadow-soft p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-body font-semibold text-secondary">
                              {setting.name}
                            </h3>
                            {setting.required && (
                              <span className="text-error text-caption">*</span>
                            )}
                          </div>
                          <p className="text-caption text-secondary-500 mb-4">
                            {setting.description}
                          </p>
                          <div className="max-w-md">
                            {renderSettingInput(setting)}
                          </div>
                          
                          {/* 설정별 추가 정보 */}
                          {setting.type === 'number' && setting.min !== undefined && setting.max !== undefined && (
                            <div className="mt-2 text-xs text-secondary-400">
                              범위: {setting.min} ~ {setting.max} {setting.unit}
                            </div>
                          )}
                        </div>
                        
                        {/* 현재 값 표시 */}
                        <div className="ml-6 text-right">
                          <div className="text-caption text-secondary-400">현재 값</div>
                          <div className="text-body font-medium text-secondary-700">
                            {setting.type === 'boolean' 
                              ? (setting.value ? '활성화' : '비활성화')
                              : `${setting.value}${setting.unit || ''}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredSettings.length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🔍</span>
                      <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                        검색 결과가 없습니다
                      </h3>
                      <p className="text-caption text-secondary-400">
                        다른 검색어를 시도해보세요
                      </p>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="sticky bottom-0 bg-white border-t border-background-200 p-6 mt-8 -mx-6">
                  <div className="flex justify-between">
                    <button
                      onClick={handleResetSettings}
                      className="bg-background-300 text-secondary-600 px-6 py-2 rounded-lg hover:bg-background-400 transition-colors"
                    >
                      기본값으로 되돌리기
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setHasChanges(false)}
                        className="bg-secondary-400 text-white px-6 py-2 rounded-lg hover:bg-secondary-500 transition-colors"
                        disabled={!hasChanges}
                      >
                        변경사항 취소
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          hasChanges
                            ? 'bg-primary text-white hover:bg-primary-600'
                            : 'bg-background-300 text-secondary-400 cursor-not-allowed'
                        }`}
                        disabled={!hasChanges}
                      >
                        설정 저장
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperationSettingsPage;
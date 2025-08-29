import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { useStore } from '@/store/useStore';
import systemSettingsService, { SystemSetting, CategorySettings } from '@/services/systemSettingsService';

const OperationSettingsPage: React.FC = () => {
  const { user } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 설정 데이터
  const [settingCategories, setSettingCategories] = useState<CategorySettings[]>([]);
  const [originalSettings, setOriginalSettings] = useState<Record<string, string | number | boolean>>({});
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, string | number | boolean>>({});

  // 초기 데이터 로드
  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await systemSettingsService.getAllSettings();
      setSettingCategories(response.categories);

      // 원본 설정값 저장 (변경 감지용)
      const originalData: Record<string, string | number | boolean> = {};
      response.categories.forEach(category => {
        category.settings.forEach(setting => {
          originalData[setting.key] = setting.value;
        });
      });
      setOriginalSettings(originalData);
      setModifiedSettings({ ...originalData });
      
    } catch (err: any) {
      console.error('설정 데이터 로드 실패:', err);
      setError('설정 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryData = settingCategories.find(cat => cat.category === selectedCategory);

  const filteredSettings = selectedCategoryData?.settings.filter(setting =>
    setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setModifiedSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // 변경사항이 있는지 체크
    const hasAnyChanges = Object.keys(modifiedSettings).some(settingKey => {
      const newValue = settingKey === key ? value : modifiedSettings[settingKey];
      return newValue !== originalSettings[settingKey];
    });
    setHasChanges(hasAnyChanges || value !== originalSettings[key]);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // 변경된 설정만 추출
      const changedSettings: Record<string, string> = {};
      Object.keys(modifiedSettings).forEach(key => {
        if (modifiedSettings[key] !== originalSettings[key]) {
          changedSettings[key] = systemSettingsService.convertValueToString(modifiedSettings[key]);
        }
      });

      if (Object.keys(changedSettings).length === 0) {
        alert('변경된 설정이 없습니다.');
        return;
      }

      // 일괄 업데이트 요청
      await systemSettingsService.bulkUpdateSettings({ settings: changedSettings });

      alert('설정이 성공적으로 저장되었습니다.');
      setHasChanges(false);
      
      // 설정 새로고침
      await loadAllSettings();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '설정 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('선택한 카테고리의 모든 설정을 기본값으로 되돌리시겠습니까?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // 현재 카테고리의 모든 설정을 기본값으로 리셋
      if (selectedCategoryData) {
        for (const setting of selectedCategoryData.settings) {
          await systemSettingsService.resetSetting(setting.key);
        }
      }

      alert('설정이 기본값으로 되돌려졌습니다.');
      setHasChanges(false);
      
      // 설정 새로고침
      await loadAllSettings();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '설정 초기화 중 오류가 발생했습니다.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setModifiedSettings({ ...originalSettings });
    setHasChanges(false);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = modifiedSettings[setting.key] ?? setting.value;
    const baseInputClass = "w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
    
    switch (setting.valueType) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(currentValue)}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="w-4 h-4 text-primary bg-background-100 border-background-300 rounded focus:ring-primary-400 focus:ring-2"
            />
            <span className="text-caption text-secondary-600">
              {currentValue ? '활성화' : '비활성화'}
            </span>
          </label>
        );
      
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={Number(currentValue) || ''}
              min={setting.validationRules?.min}
              max={setting.validationRules?.max}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleSettingChange(setting.key, 0);
                } else {
                  const numValue = Number(value);
                  if (!isNaN(numValue)) {
                    handleSettingChange(setting.key, numValue);
                  }
                }
              }}
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
            value={String(currentValue)}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
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
            value={String(currentValue)}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            rows={3}
            className={baseInputClass}
            placeholder={setting.description}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className={baseInputClass}
            required={setting.required}
            placeholder={setting.description}
          />
        );
    }
  };

  // 권한 체크 및 로딩 상태
  if (!user) {
    return <div className="p-4">로딩 중...</div>;
  }

  // 관리자 권한 체크
  if (user.userType !== 'super_admin' && user.userType !== 'regional_manager' && 
      user.userType !== 'center_manager' && user.userType !== 'staff') {
    return (
      <div className="flex h-screen bg-background-50">
        <Sidebar userType={user.userType || 'general'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-h3 text-secondary-600 mb-2">접근 권한이 없습니다</p>
            <p className="text-body text-secondary-400">이 페이지는 관리자만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background-50">
        <Sidebar userType={user.userType || 'general'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (!settingCategories || settingCategories.length === 0) {
    return (
      <div className="flex h-screen bg-background-50">
        <Sidebar userType={user.userType || 'general'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <p className="text-h3 text-secondary-600 mb-2">설정 데이터가 없습니다</p>
            <p className="text-body text-secondary-400">시스템 설정을 불러올 수 없습니다.</p>
            <button 
              onClick={() => loadAllSettings()}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              다시 시도
            </button>
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
                  <span className="text-white text-sm font-bold">{user.name?.charAt(0) || '관'}</span>
                </div>
                <span className="text-body text-secondary-600">{user.name || '관리자'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => {
                setError(null);
                loadAllSettings();
              }}
              className="text-sm underline hover:no-underline ml-4"
            >
              다시 시도
            </button>
          </div>
        )}

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
                    key={category.category}
                    onClick={() => setSelectedCategory(category.category)}
                    className={`w-full p-4 rounded-lg text-left transition-colors ${
                      selectedCategory === category.category
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-background-100 text-secondary-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.categoryIcon}</span>
                      <div>
                        <div className="text-body font-medium">{category.categoryName}</div>
                        <div className="text-caption text-secondary-400">{category.categoryDescription}</div>
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
                    <span className="mr-3 text-2xl">{selectedCategoryData.categoryIcon}</span>
                    {selectedCategoryData.categoryName}
                  </h2>
                  <p className="text-caption text-secondary-400 mt-1">
                    {selectedCategoryData.categoryDescription}
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
                          {setting.valueType === 'number' && setting.validationRules?.min !== undefined && setting.validationRules?.max !== undefined && (
                            <div className="mt-2 text-xs text-secondary-400">
                              범위: {setting.validationRules.min} ~ {setting.validationRules.max} {setting.unit}
                            </div>
                          )}
                        </div>
                        
                        {/* 현재 값 표시 */}
                        <div className="ml-6 text-right">
                          <div className="text-caption text-secondary-400">현재 값</div>
                          <div className="text-body font-medium text-secondary-700">
                            {setting.valueType === 'boolean' 
                              ? (modifiedSettings[setting.key] ? '활성화' : '비활성화')
                              : `${modifiedSettings[setting.key]}${setting.unit || ''}`
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
                      disabled={isSaving}
                      className="bg-background-300 text-secondary-600 px-6 py-2 rounded-lg hover:bg-background-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      기본값으로 되돌리기
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelChanges}
                        className="bg-secondary-400 text-white px-6 py-2 rounded-lg hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!hasChanges || isSaving}
                      >
                        변경사항 취소
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                          hasChanges && !isSaving
                            ? 'bg-primary text-white hover:bg-primary-600'
                            : 'bg-background-300 text-secondary-400 cursor-not-allowed'
                        }`}
                        disabled={!hasChanges || isSaving}
                      >
                        {isSaving && (
                          <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <span>{isSaving ? '저장 중...' : '설정 저장'}</span>
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
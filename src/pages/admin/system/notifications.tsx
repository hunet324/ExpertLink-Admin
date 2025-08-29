import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import { withAdminOnly } from '@/components/withPermission';
import PermissionGuard from '@/components/PermissionGuard';
import { tokenManager } from '@/services/api';

interface NotificationTemplate {
  id: number;
  templateKey: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'system' | 'counseling' | 'marketing' | 'admin';
  titleTemplate: string;
  contentTemplate: string;
  variables: Record<string, any>;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateFormData {
  templateKey: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'system' | 'counseling' | 'marketing' | 'admin';
  titleTemplate: string;
  contentTemplate: string;
  isActive: boolean;
}

const NotificationTemplateAdminPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useStore();
  const userType = getUserType(user);
  
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState<TemplateFormData>({
    templateKey: '',
    name: '',
    description: '',
    type: 'in_app',
    category: 'system',
    titleTemplate: '',
    contentTemplate: '',
    isActive: true
  });
  
  // 미리보기 상태
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [renderedPreview, setRenderedPreview] = useState<{title: string; content: string} | null>(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    isActive: ''
  });

  // 템플릿 목록 로드
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '50');
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.isActive) queryParams.append('isActive', filters.isActive);
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`/api/proxy/admin/system/notifications/templates?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err: any) {
      console.error('템플릿 목록 로드 실패:', err);
      setError(err.message || '템플릿 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType) {
      fetchTemplates();
    }
  }, [userType, filters]);

  // 템플릿 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch('/api/proxy/admin/system/notifications/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setSuccessMessage('템플릿이 성공적으로 생성되었습니다.');
      setShowCreateModal(false);
      resetForm();
      fetchTemplates();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '템플릿 생성에 실패했습니다.');
    }
  };

  // 템플릿 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    try {
      setError('');
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`/api/proxy/admin/system/notifications/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setSuccessMessage('템플릿이 성공적으로 수정되었습니다.');
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '템플릿 수정에 실패했습니다.');
    }
  };

  // 템플릿 삭제
  const handleDelete = async (template: NotificationTemplate) => {
    if (!confirm(`'${template.name}' 템플릿을 삭제하시겠습니까?`)) return;
    
    try {
      setError('');
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`/api/proxy/admin/system/notifications/templates/${template.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setSuccessMessage('템플릿이 삭제되었습니다.');
      fetchTemplates();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '템플릿 삭제에 실패했습니다.');
    }
  };

  // 템플릿 상태 토글
  const handleToggle = async (template: NotificationTemplate) => {
    try {
      setError('');
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`/api/proxy/admin/system/notifications/templates/${template.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setSuccessMessage(`템플릿이 ${template.isActive ? '비활성화' : '활성화'}되었습니다.`);
      fetchTemplates();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '템플릿 상태 변경에 실패했습니다.');
    }
  };

  // 미리보기
  const handlePreview = async () => {
    if (!selectedTemplate) return;
    
    try {
      setError('');
      
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`/api/proxy/admin/system/notifications/templates/${selectedTemplate.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sample_data: previewData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setRenderedPreview(result);
    } catch (err: any) {
      setError(err.message || '미리보기 생성에 실패했습니다.');
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      templateKey: '',
      name: '',
      description: '',
      type: 'in_app',
      category: 'system',
      titleTemplate: '',
      contentTemplate: '',
      isActive: true
    });
  };

  // 편집 모달 열기
  const openEditModal = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      templateKey: template.templateKey,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      titleTemplate: template.titleTemplate,
      contentTemplate: template.contentTemplate,
      isActive: template.isActive
    });
    setShowEditModal(true);
  };

  // 미리보기 모달 열기
  const openPreviewModal = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    
    // 템플릿에서 변수 추출하여 기본값 설정
    const variables = template.variables || {};
    const defaultData: Record<string, string> = {};
    
    Object.keys(variables).forEach(key => {
      switch (key) {
        case 'userName': defaultData[key] = '김상담자'; break;
        case 'expertName': defaultData[key] = '이상담사'; break;
        case 'centerName': defaultData[key] = '서울심리센터'; break;
        case 'counselingDate': defaultData[key] = '2024-08-28'; break;
        case 'counselingTime': defaultData[key] = '14:00'; break;
        case 'amount': defaultData[key] = '50,000원'; break;
        case 'testName': defaultData[key] = 'MMPI-2 성격검사'; break;
        default: defaultData[key] = `[${key} 샘플값]`;
      }
    });
    
    setPreviewData(defaultData);
    setRenderedPreview(null);
    setShowPreviewModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'push': return 'bg-green-100 text-green-800';
      case 'sms': return 'bg-yellow-100 text-yellow-800';
      case 'in_app': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-red-100 text-red-800';
      case 'counseling': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'email': return '이메일';
      case 'push': return '푸시 알림';
      case 'sms': return 'SMS';
      case 'in_app': return '앱 내 알림';
      default: return type;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'system': return '시스템';
      case 'counseling': return '상담';
      case 'marketing': return '마케팅';
      case 'admin': return '관리자';
      default: return category;
    }
  };

  if (userLoading || !userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-50">
      <Sidebar userType={userType} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">🔔</span>
                알림 템플릿 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                시스템에서 사용되는 알림 메시지 템플릿을 관리합니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <PermissionGuard minLevel="regional_manager">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  새 템플릿
                </button>
              </PermissionGuard>
              <button
                onClick={fetchTemplates}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                {loading ? '로딩 중...' : '새로고침'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* 성공 메시지 */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* 필터 */}
          <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="템플릿 이름 또는 키 검색..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 타입</option>
                <option value="email">이메일</option>
                <option value="push">푸시 알림</option>
                <option value="sms">SMS</option>
                <option value="in_app">앱 내 알림</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 카테고리</option>
                <option value="system">시스템</option>
                <option value="counseling">상담</option>
                <option value="marketing">마케팅</option>
                <option value="admin">관리자</option>
              </select>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 상태</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          </div>

          {/* 템플릿 목록 */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">템플릿 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow-soft p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          {template.isSystem && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                              시스템 필수
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                            {getTypeDisplayName(template.type)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {getCategoryDisplayName(template.category)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">키: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{template.templateKey}</code></p>
                        {template.description && (
                          <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                        )}
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">제목 템플릿:</span>
                            <p className="text-sm bg-gray-50 p-2 rounded mt-1">{template.titleTemplate}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">내용 템플릿:</span>
                            <p className="text-sm bg-gray-50 p-2 rounded mt-1 line-clamp-3">{template.contentTemplate}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => openPreviewModal(template)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          미리보기
                        </button>
                        <PermissionGuard minLevel="regional_manager">
                          <button
                            onClick={() => openEditModal(template)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                          >
                            수정
                          </button>
                        </PermissionGuard>
                        <PermissionGuard minLevel="regional_manager">
                          <button
                            onClick={() => handleToggle(template)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              template.isActive 
                                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {template.isActive ? '비활성화' : '활성화'}
                          </button>
                        </PermissionGuard>
                        {!template.isSystem && (
                          <PermissionGuard minLevel="regional_manager">
                            <button
                              onClick={() => handleDelete(template)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              삭제
                            </button>
                          </PermissionGuard>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-soft p-12 text-center">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">템플릿이 없습니다</h3>
                  <p className="text-gray-600">새로운 알림 템플릿을 생성해보세요.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 템플릿 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">새 알림 템플릿 생성</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 키 *</label>
                    <input
                      type="text"
                      required
                      value={formData.templateKey}
                      onChange={(e) => setFormData({...formData, templateKey: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: payment_success"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 이름 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 결제 완료 알림"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="템플릿에 대한 간단한 설명"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">타입 *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in_app">앱 내 알림</option>
                      <option value="push">푸시 알림</option>
                      <option value="email">이메일</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="system">시스템</option>
                      <option value="counseling">상담</option>
                      <option value="marketing">마케팅</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목 템플릿 *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData({...formData, titleTemplate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: {{userName}}님, 결제가 완료되었습니다"
                  />
                  <p className="text-xs text-gray-500 mt-1">변수는 {`{{변수명}}`} 형식으로 입력하세요</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">내용 템플릿 *</label>
                  <textarea
                    required
                    value={formData.contentTemplate}
                    onChange={(e) => setFormData({...formData, contentTemplate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="예: {{userName}}님, {{serviceName}} 결제가 완료되었습니다. 결제금액: {{amount}}"
                  />
                  <p className="text-xs text-gray-500 mt-1">변수는 {`{{변수명}}`} 형식으로 입력하세요</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">즉시 활성화</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 수정 모달 */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">템플릿 수정</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 키</label>
                    <input
                      type="text"
                      value={formData.templateKey}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">템플릿 키는 수정할 수 없습니다</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 이름 *</label>
                    <input
                      type="text"
                      required
                      disabled={selectedTemplate.isSystem}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={formData.description}
                    disabled={selectedTemplate.isSystem}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">타입 *</label>
                    <select
                      required
                      disabled={selectedTemplate.isSystem}
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="in_app">앱 내 알림</option>
                      <option value="push">푸시 알림</option>
                      <option value="email">이메일</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                    <select
                      required
                      disabled={selectedTemplate.isSystem}
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="system">시스템</option>
                      <option value="counseling">상담</option>
                      <option value="marketing">마케팅</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목 템플릿 *</label>
                  <input
                    type="text"
                    required
                    disabled={selectedTemplate.isSystem}
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData({...formData, titleTemplate: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">내용 템플릿 *</label>
                  <textarea
                    required
                    disabled={selectedTemplate.isSystem}
                    value={formData.contentTemplate}
                    onChange={(e) => setFormData({...formData, contentTemplate: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedTemplate.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    rows={4}
                  />
                </div>

                {selectedTemplate.isSystem && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 이는 시스템 필수 템플릿입니다. 활성화/비활성화만 변경할 수 있습니다.
                    </p>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="edit_isActive" className="text-sm text-gray-700">활성화</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    수정
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 모달 */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">템플릿 미리보기: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 샘플 데이터 입력 */}
                <div>
                  <h4 className="text-lg font-medium mb-4">샘플 데이터 입력</h4>
                  <div className="space-y-3">
                    {Object.keys(previewData).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={previewData[key] || ''}
                          onChange={(e) => setPreviewData({...previewData, [key]: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`${key} 값 입력`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handlePreview}
                    className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    미리보기 생성
                  </button>
                </div>

                {/* 미리보기 결과 */}
                <div>
                  <h4 className="text-lg font-medium mb-4">미리보기 결과</h4>
                  {renderedPreview ? (
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">제목</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {renderedPreview.title}
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">내용</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {renderedPreview.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                      &apos;미리보기 생성&apos; 버튼을 클릭하여 결과를 확인하세요.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdminOnly(NotificationTemplateAdminPage, false);
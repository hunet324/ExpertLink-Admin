import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: 'auth' | 'booking' | 'payment' | 'reminder' | 'promotion' | 'system';
  triggerEvent: string;
  targetAudience: 'clients' | 'experts' | 'admins' | 'all';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sendDelay?: number; // 분 단위
  maxRetries?: number;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
  successRate: number;
}

const NotificationTemplatesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationTemplate['type']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationTemplate['category']>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 알림 템플릿 샘플 데이터
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'tpl_001',
      name: '회원가입 환영 이메일',
      description: '새로운 사용자가 회원가입 완료 시 발송되는 환영 메시지',
      type: 'email',
      category: 'auth',
      triggerEvent: 'user_registered',
      targetAudience: 'all',
      subject: '{{platform_name}}에 오신 것을 환영합니다, {{user_name}}님!',
      content: `안녕하세요 {{user_name}}님,

{{platform_name}}에 가입해주셔서 감사합니다!

이제 다음과 같은 서비스를 이용하실 수 있습니다:
- 전문 상담사와의 1:1 상담
- 다양한 심리검사 및 진단
- 맞춤형 상담 서비스

궁금한 점이 있으시면 언제든지 문의해주세요.

감사합니다.
{{platform_name}} 팀`,
      variables: ['user_name', 'platform_name'],
      isActive: true,
      priority: 'medium',
      createdAt: '2024-01-15T10:00:00',
      updatedAt: '2024-06-20T14:30:00',
      lastUsed: '2024-08-12T16:45:00',
      usageCount: 1250,
      successRate: 98.5
    },
    {
      id: 'tpl_002',
      name: '상담 예약 확인 SMS',
      description: '상담 예약이 확정되었을 때 발송되는 SMS',
      type: 'sms',
      category: 'booking',
      triggerEvent: 'booking_confirmed',
      targetAudience: 'clients',
      subject: '',
      content: '[{{platform_name}}] {{user_name}}님의 {{service_type}} 상담이 {{booking_date}} {{booking_time}}에 예약되었습니다. 상담사: {{expert_name}}',
      variables: ['platform_name', 'user_name', 'service_type', 'booking_date', 'booking_time', 'expert_name'],
      isActive: true,
      priority: 'high',
      createdAt: '2024-01-20T11:00:00',
      updatedAt: '2024-07-15T09:20:00',
      lastUsed: '2024-08-12T15:30:00',
      usageCount: 890,
      successRate: 99.2
    },
    {
      id: 'tpl_003',
      name: '결제 완료 알림',
      description: '결제가 성공적으로 완료되었을 때 발송되는 푸시 알림',
      type: 'push',
      category: 'payment',
      triggerEvent: 'payment_completed',
      targetAudience: 'clients',
      subject: '결제 완료',
      content: '{{service_name}} 결제가 완료되었습니다. 결제 금액: {{amount}}원',
      variables: ['service_name', 'amount'],
      isActive: true,
      priority: 'high',
      createdAt: '2024-02-01T12:30:00',
      updatedAt: '2024-08-01T16:15:00',
      lastUsed: '2024-08-12T14:20:00',
      usageCount: 2340,
      successRate: 97.8
    },
    {
      id: 'tpl_004',
      name: '상담 리마인더',
      description: '상담 시작 1시간 전에 발송되는 리마인더',
      type: 'in_app',
      category: 'reminder',
      triggerEvent: 'session_reminder',
      targetAudience: 'clients',
      subject: '상담 시작 알림',
      content: '{{user_name}}님, {{expert_name}} 상담사와의 {{service_type}} 상담이 1시간 후에 시작됩니다.',
      variables: ['user_name', 'expert_name', 'service_type'],
      isActive: true,
      priority: 'medium',
      sendDelay: 60,
      createdAt: '2024-02-15T14:00:00',
      updatedAt: '2024-07-30T11:45:00',
      lastUsed: '2024-08-12T13:15:00',
      usageCount: 567,
      successRate: 95.3
    },
    {
      id: 'tpl_005',
      name: '전문가 승인 완료 이메일',
      description: '전문가 승인이 완료되었을 때 발송되는 이메일',
      type: 'email',
      category: 'auth',
      triggerEvent: 'expert_approved',
      targetAudience: 'experts',
      subject: '축하합니다! {{platform_name}} 전문가 승인이 완료되었습니다',
      content: `안녕하세요 {{expert_name}}님,

{{platform_name}} 전문가 승인이 완료되었습니다!

이제 다음과 같은 활동을 시작하실 수 있습니다:
- 상담 일정 등록 및 관리
- 내담자와의 상담 진행
- 수익 관리 및 정산

전문가 대시보드에서 상세한 정보를 확인하세요.

{{platform_name}}과 함께 많은 내담자들에게 도움을 주시길 바랍니다.

감사합니다.
{{platform_name}} 팀`,
      variables: ['expert_name', 'platform_name'],
      isActive: true,
      priority: 'high',
      createdAt: '2024-03-01T09:15:00',
      updatedAt: '2024-05-20T13:30:00',
      lastUsed: '2024-08-10T10:20:00',
      usageCount: 45,
      successRate: 100.0
    },
    {
      id: 'tpl_006',
      name: '시스템 점검 공지',
      description: '시스템 점검 시 전체 사용자에게 발송되는 공지',
      type: 'push',
      category: 'system',
      triggerEvent: 'system_maintenance',
      targetAudience: 'all',
      subject: '시스템 점검 안내',
      content: '{{maintenance_date}} {{maintenance_time}}부터 {{duration}}시간 동안 시스템 점검이 예정되어 있습니다. 서비스 이용에 참고하시기 바랍니다.',
      variables: ['maintenance_date', 'maintenance_time', 'duration'],
      isActive: false,
      priority: 'urgent',
      sendDelay: 1440, // 24시간 전
      createdAt: '2024-03-15T16:00:00',
      updatedAt: '2024-07-01T14:20:00',
      lastUsed: '2024-07-15T09:00:00',
      usageCount: 8,
      successRate: 99.8
    },
    {
      id: 'tpl_007',
      name: '결제 실패 알림',
      description: '결제 실패 시 발송되는 이메일',
      type: 'email',
      category: 'payment',
      triggerEvent: 'payment_failed',
      targetAudience: 'clients',
      subject: '결제 실패 안내 - {{service_name}}',
      content: `안녕하세요 {{user_name}}님,

{{service_name}} 결제 처리 중 문제가 발생했습니다.

실패 사유: {{failure_reason}}

다음과 같은 방법으로 문제를 해결할 수 있습니다:
1. 결제 수단 정보 확인 및 재입력
2. 다른 결제 수단 사용
3. 고객센터 문의

문의사항이 있으시면 언제든지 연락주세요.

감사합니다.
{{platform_name}} 팀`,
      variables: ['user_name', 'service_name', 'failure_reason', 'platform_name'],
      isActive: true,
      priority: 'high',
      maxRetries: 3,
      createdAt: '2024-04-01T11:30:00',
      updatedAt: '2024-08-05T15:45:00',
      lastUsed: '2024-08-12T12:30:00',
      usageCount: 123,
      successRate: 94.3
    },
    {
      id: 'tpl_008',
      name: '신규 프로모션 안내',
      description: '신규 프로모션 또는 이벤트 안내',
      type: 'email',
      category: 'promotion',
      triggerEvent: 'promotion_launched',
      targetAudience: 'clients',
      subject: '🎉 {{promotion_title}} - 특별 할인 혜택!',
      content: `안녕하세요 {{user_name}}님,

{{platform_name}}에서 특별한 혜택을 준비했습니다!

{{promotion_title}}
- 할인율: {{discount_rate}}%
- 이벤트 기간: {{start_date}} ~ {{end_date}}
- 적용 서비스: {{applicable_services}}

이 기회를 놓치지 마세요!

감사합니다.
{{platform_name}} 팀`,
      variables: ['user_name', 'platform_name', 'promotion_title', 'discount_rate', 'start_date', 'end_date', 'applicable_services'],
      isActive: false,
      priority: 'low',
      createdAt: '2024-05-01T10:00:00',
      updatedAt: '2024-06-15T14:00:00',
      usageCount: 0,
      successRate: 0.0
    }
  ]);

  const getTypeLabel = (type: NotificationTemplate['type']) => {
    const typeLabels = {
      'email': '이메일',
      'sms': 'SMS',
      'push': '푸시알림',
      'in_app': '앱내알림'
    };
    return typeLabels[type];
  };

  const getTypeColor = (type: NotificationTemplate['type']) => {
    const typeColors = {
      'email': 'bg-primary-100 text-primary-700',
      'sms': 'bg-accent-100 text-accent-700',
      'push': 'bg-secondary-100 text-secondary-700',
      'in_app': 'bg-logo-point/20 text-logo-main'
    };
    return typeColors[type];
  };

  const getCategoryLabel = (category: NotificationTemplate['category']) => {
    const categoryLabels = {
      'auth': '인증',
      'booking': '예약',
      'payment': '결제',
      'reminder': '리마인더',
      'promotion': '프로모션',
      'system': '시스템'
    };
    return categoryLabels[category];
  };

  const getCategoryColor = (category: NotificationTemplate['category']) => {
    const categoryColors = {
      'auth': 'bg-green-100 text-green-700',
      'booking': 'bg-blue-100 text-blue-700',
      'payment': 'bg-orange-100 text-orange-700',
      'reminder': 'bg-purple-100 text-purple-700',
      'promotion': 'bg-pink-100 text-pink-700',
      'system': 'bg-red-100 text-red-700'
    };
    return categoryColors[category];
  };

  const getPriorityColor = (priority: NotificationTemplate['priority']) => {
    const priorityColors = {
      'low': 'bg-background-200 text-secondary-600',
      'medium': 'bg-secondary-400 text-white',
      'high': 'bg-primary text-white',
      'urgent': 'bg-error text-white'
    };
    return priorityColors[priority];
  };

  const getPriorityText = (priority: NotificationTemplate['priority']) => {
    const priorityTexts = {
      'low': '낮음',
      'medium': '보통',
      'high': '높음',
      'urgent': '긴급'
    };
    return priorityTexts[priority];
  };

  const getAudienceLabel = (audience: NotificationTemplate['targetAudience']) => {
    const audienceLabels = {
      'clients': '내담자',
      'experts': '전문가',
      'admins': '관리자',
      'all': '전체'
    };
    return audienceLabels[audience];
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getFilterCount = (type: 'all' | NotificationTemplate['type']) => {
    if (type === 'all') return templates.length;
    return templates.filter(template => template.type === type).length;
  };

  const getTemplateStats = () => {
    return {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
      avgSuccessRate: templates.length > 0 
        ? templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length
        : 0
    };
  };

  const stats = getTemplateStats();

  const openTemplateModal = (template?: NotificationTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setIsEditing(true);
    } else {
      setSelectedTemplate({
        id: '',
        name: '',
        description: '',
        type: 'email',
        category: 'auth',
        triggerEvent: '',
        targetAudience: 'clients',
        subject: '',
        content: '',
        variables: [],
        isActive: true,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        successRate: 0
      });
      setIsEditing(false);
    }
    setShowTemplateModal(true);
  };

  const openPreviewModal = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    if (isEditing) {
      setTemplates(prev => prev.map(template => 
        template.id === selectedTemplate.id 
          ? { ...selectedTemplate, updatedAt: new Date().toISOString() }
          : template
      ));
    } else {
      const newTemplate = {
        ...selectedTemplate,
        id: `tpl_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    }
  };

  const handleToggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const sendTestNotification = (template: NotificationTemplate) => {
    alert(`테스트 알림이 발송되었습니다.\n템플릿: ${template.name}\n유형: ${getTypeLabel(template.type)}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="super_admin" 
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">🔔</span>
                알림 템플릿 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                사용자에게 발송되는 다양한 알림 템플릿을 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{stats.active}</div>
                  <div className="text-xs text-secondary-400">활성 템플릿</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-primary">{stats.totalUsage.toLocaleString()}</div>
                  <div className="text-xs text-secondary-400">총 발송</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{stats.avgSuccessRate.toFixed(1)}%</div>
                  <div className="text-xs text-secondary-400">평균 성공률</div>
                </div>
              </div>

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
        <main className="flex-1 overflow-y-auto p-6">
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색바 및 액션 버튼 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="템플릿명, 설명, 트리거 이벤트로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                      className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="all">모든 유형</option>
                      <option value="email">이메일</option>
                      <option value="sms">SMS</option>
                      <option value="push">푸시알림</option>
                      <option value="in_app">앱내알림</option>
                    </select>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                      className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="all">모든 카테고리</option>
                      <option value="auth">인증</option>
                      <option value="booking">예약</option>
                      <option value="payment">결제</option>
                      <option value="reminder">리마인더</option>
                      <option value="promotion">프로모션</option>
                      <option value="system">시스템</option>
                    </select>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                      검색
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openTemplateModal()}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>템플릿 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 유형별 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'email' as const, label: '이메일', count: getFilterCount('email') },
                  { key: 'sms' as const, label: 'SMS', count: getFilterCount('sms') },
                  { key: 'push' as const, label: '푸시', count: getFilterCount('push') },
                  { key: 'in_app' as const, label: '앱내', count: getFilterCount('in_app') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTypeFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      typeFilter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      typeFilter === tab.key
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 템플릿 목록 */}
          <div className="space-y-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-h4 font-semibold text-secondary">{template.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getTypeColor(template.type)}`}>
                          {getTypeLabel(template.type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getCategoryColor(template.category)}`}>
                          {getCategoryLabel(template.category)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getPriorityColor(template.priority)}`}>
                          {getPriorityText(template.priority)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${
                          template.isActive ? 'bg-accent text-white' : 'bg-background-400 text-white'
                        }`}>
                          {template.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      <p className="text-caption text-secondary-500 mb-3">{template.description}</p>
                      <div className="text-caption text-secondary-600">
                        <strong>트리거:</strong> {template.triggerEvent} | <strong>대상:</strong> {getAudienceLabel(template.targetAudience)}
                      </div>
                    </div>

                    <div className="text-caption text-secondary-400 text-right ml-4">
                      <div>생성: {formatDate(template.createdAt)}</div>
                      <div>수정: {formatDate(template.updatedAt)}</div>
                      {template.lastUsed && (
                        <div>최근 사용: {formatDate(template.lastUsed)}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* 사용 통계 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">사용 통계</h4>
                      <div className="space-y-1 text-caption">
                        <div>발송 횟수: {template.usageCount.toLocaleString()}회</div>
                        <div>성공률: {template.successRate.toFixed(1)}%</div>
                        {template.sendDelay && (
                          <div>발송 지연: {template.sendDelay}분</div>
                        )}
                        {template.maxRetries && (
                          <div>재시도 횟수: {template.maxRetries}회</div>
                        )}
                      </div>
                    </div>

                    {/* 제목 미리보기 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">제목</h4>
                      <div className="bg-background-50 p-3 rounded-lg">
                        <div className="text-caption text-secondary-700 line-clamp-2">
                          {template.subject || '제목 없음'}
                        </div>
                      </div>
                    </div>

                    {/* 변수 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">사용 변수</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable, index) => (
                          <span key={index} className="bg-logo-point/20 text-logo-main px-2 py-1 rounded text-xs">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                        {template.variables.length > 3 && (
                          <span className="bg-background-200 text-secondary-500 px-2 py-1 rounded text-xs">
                            +{template.variables.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 내용 미리보기 */}
                  <div className="bg-background-50 p-4 rounded-lg mb-4">
                    <h4 className="text-caption font-semibold text-secondary-600 mb-2">내용 미리보기</h4>
                    <div className="text-caption text-secondary-700 line-clamp-3 whitespace-pre-wrap">
                      {template.content}
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(template.id)}
                        className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors ${
                          template.isActive
                            ? 'bg-background-200 text-secondary-600 hover:bg-background-300'
                            : 'bg-accent text-white hover:bg-accent-600'
                        }`}
                      >
                        {template.isActive ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => openPreviewModal(template)}
                        className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                      >
                        미리보기
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => sendTestNotification(template)}
                        className="bg-logo-main text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-logo-point transition-colors"
                      >
                        테스트 발송
                      </button>
                      <button
                        onClick={() => openTemplateModal(template)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">🔔</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '알림 템플릿이 없습니다'}
                </h3>
                <p className="text-caption text-secondary-400 mb-4">
                  {searchQuery ? '다른 검색어를 입력해보세요' : '첫 번째 알림 템플릿을 추가해보세요'}
                </p>
                <button
                  onClick={() => openTemplateModal()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  템플릿 추가하기
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 템플릿 편집 모달 (간략화된 버전) */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">
                  {isEditing ? '템플릿 편집' : '새 템플릿 추가'}
                </h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      템플릿명 *
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="템플릿명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      알림 유형 *
                    </label>
                    <select
                      value={selectedTemplate.type}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, type: e.target.value as NotificationTemplate['type']})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="email">이메일</option>
                      <option value="sms">SMS</option>
                      <option value="push">푸시알림</option>
                      <option value="in_app">앱내알림</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    설명
                  </label>
                  <textarea
                    value={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    placeholder="템플릿에 대한 설명을 입력하세요"
                  />
                </div>

                {selectedTemplate.type !== 'sms' && (
                  <div>
                    <label className="block text-caption font-medium text-secondary-600 mb-2">
                      제목 *
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                      placeholder="알림 제목을 입력하세요"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-caption font-medium text-secondary-600 mb-2">
                    내용 *
                  </label>
                  <textarea
                    value={selectedTemplate.content}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                    placeholder="알림 내용을 입력하세요. {{변수명}} 형태로 동적 값을 삽입할 수 있습니다."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                >
                  {isEditing ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 모달 */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">템플릿 미리보기</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-background-50 p-4 rounded-lg">
                  <div className="text-caption text-secondary-500 mb-2">템플릿 정보</div>
                  <div className="text-body font-medium text-secondary-700">{selectedTemplate.name}</div>
                  <div className="text-caption text-secondary-600 mt-1">
                    {getTypeLabel(selectedTemplate.type)} • {getCategoryLabel(selectedTemplate.category)} • {getAudienceLabel(selectedTemplate.targetAudience)}
                  </div>
                </div>

                {selectedTemplate.subject && (
                  <div className="bg-background-50 p-4 rounded-lg">
                    <div className="text-caption text-secondary-500 mb-2">제목</div>
                    <div className="text-body text-secondary-700">{selectedTemplate.subject}</div>
                  </div>
                )}

                <div className="bg-background-50 p-4 rounded-lg">
                  <div className="text-caption text-secondary-500 mb-2">내용</div>
                  <div className="text-body text-secondary-700 whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </div>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-caption text-primary-600 mb-2">사용된 변수</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.variables.map((variable, index) => (
                        <span key={index} className="bg-primary text-white px-2 py-1 rounded text-xs">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-background-300 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-400 transition-colors"
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

export default NotificationTemplatesPage;
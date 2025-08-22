// 수퍼관리자 전용 보안 정책 관리 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface SecurityPolicy {
  id: number;
  name: string;
  category: 'authentication' | 'authorization' | 'data-protection' | 'audit' | 'network';
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastModified: string;
  modifiedBy: string;
}

interface SecurityEvent {
  id: number;
  timestamp: string;
  eventType: 'login_failure' | 'unauthorized_access' | 'data_breach' | 'suspicious_activity';
  userId?: number;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

const SecurityPolicyPage: React.FC = () => {
  const { user } = useStore();
  
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'policies' | 'events' | 'settings'>('policies');

  const userType = getUserType(user);

  // 보안 정책 및 이벤트 조회
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setLoading(true);
        
        // Mock 보안 정책 데이터
        const mockPolicies: SecurityPolicy[] = [
          {
            id: 1,
            name: '비밀번호 복잡성 요구사항',
            category: 'authentication',
            description: '최소 8자, 대소문자, 숫자, 특수문자 포함 필수',
            enabled: true,
            severity: 'high',
            lastModified: '2024-08-15T10:00:00Z',
            modifiedBy: '수퍼관리자'
          },
          {
            id: 2,
            name: '계정 잠금 정책',
            category: 'authentication',
            description: '5회 연속 로그인 실패 시 30분간 계정 잠금',
            enabled: true,
            severity: 'medium',
            lastModified: '2024-08-10T14:30:00Z',
            modifiedBy: '수퍼관리자'
          },
          {
            id: 3,
            name: '세션 타임아웃',
            category: 'authentication',
            description: '30분 비활성 시 자동 로그아웃',
            enabled: true,
            severity: 'medium',
            lastModified: '2024-08-12T09:15:00Z',
            modifiedBy: '수퍼관리자'
          },
          {
            id: 4,
            name: '관리자 권한 분리',
            category: 'authorization',
            description: '센터별 관리자 권한 분리 및 최소 권한 원칙',
            enabled: true,
            severity: 'critical',
            lastModified: '2024-08-18T16:20:00Z',
            modifiedBy: '수퍼관리자'
          },
          {
            id: 5,
            name: '개인정보 암호화',
            category: 'data-protection',
            description: '개인식별정보 데이터베이스 암호화 저장',
            enabled: true,
            severity: 'critical',
            lastModified: '2024-08-01T11:00:00Z',
            modifiedBy: '수퍼관리자'
          }
        ];

        // Mock 보안 이벤트 데이터
        const mockEvents: SecurityEvent[] = [
          {
            id: 1,
            timestamp: '2024-08-19T08:30:00Z',
            eventType: 'login_failure',
            userId: 123,
            userEmail: 'suspicious@example.com',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            description: '5회 연속 로그인 실패',
            severity: 'medium',
            status: 'investigating'
          },
          {
            id: 2,
            timestamp: '2024-08-19T07:15:00Z',
            eventType: 'unauthorized_access',
            userId: undefined,
            userEmail: undefined,
            ipAddress: '203.0.113.45',
            userAgent: 'curl/7.68.0',
            description: '권한 없는 API 엔드포인트 접근 시도',
            severity: 'high',
            status: 'open'
          },
          {
            id: 3,
            timestamp: '2024-08-18T22:45:00Z',
            eventType: 'suspicious_activity',
            userId: 89,
            userEmail: 'admin@center1.com',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0...',
            description: '비정상적인 시간대 관리자 접근',
            severity: 'low',
            status: 'resolved'
          }
        ];

        setPolicies(mockPolicies);
        setSecurityEvents(mockEvents);
        setError('');
      } catch (err: any) {
        console.error('보안 데이터 조회 실패:', err);
        setError(err.message || '보안 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  // 정책 활성화/비활성화 토글
  const togglePolicy = async (policyId: number) => {
    try {
      setPolicies(prev => 
        prev.map(policy => 
          policy.id === policyId 
            ? { ...policy, enabled: !policy.enabled, lastModified: new Date().toISOString(), modifiedBy: '수퍼관리자' }
            : policy
        )
      );
      
      console.log('정책 상태 변경:', policyId);
    } catch (err: any) {
      console.error('정책 상태 변경 실패:', err);
      alert(err.message || '정책 상태 변경에 실패했습니다.');
    }
  };

  // 보안 이벤트 상태 변경
  const updateEventStatus = async (eventId: number, newStatus: SecurityEvent['status']) => {
    try {
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, status: newStatus }
            : event
        )
      );
      
      console.log('보안 이벤트 상태 변경:', { eventId, newStatus });
    } catch (err: any) {
      console.error('이벤트 상태 변경 실패:', err);
      alert(err.message || '이벤트 상태 변경에 실패했습니다.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return '심각';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '알 수 없음';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'bg-blue-100 text-blue-800';
      case 'authorization': return 'bg-purple-100 text-purple-800';
      case 'data-protection': return 'bg-green-100 text-green-800';
      case 'audit': return 'bg-yellow-100 text-yellow-800';
      case 'network': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'authentication': return '인증';
      case 'authorization': return '인가';
      case 'data-protection': return '데이터 보호';
      case 'audit': return '감사';
      case 'network': return '네트워크';
      default: return '기타';
    }
  };

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'login_failure': return '로그인 실패';
      case 'unauthorized_access': return '무권한 접근';
      case 'data_breach': return '데이터 유출';
      case 'suspicious_activity': return '의심스러운 활동';
      default: return '기타';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '미처리';
      case 'investigating': return '조사 중';
      case 'resolved': return '해결됨';
      case 'false_positive': return '오탐';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">보안 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin/super-admin/admin-accounts"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 관리자 계정
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">🔒 보안 정책 관리</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">시스템 보안 정책 및 이벤트 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/admin/super-admin/audit-trails"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                감사 추적
              </Link>
              <Link
                href="/admin/super-admin/system-monitoring"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                시스템 모니터링
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

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'policies', label: '보안 정책', icon: '🛡️' },
                { id: 'events', label: '보안 이벤트', icon: '🚨' },
                { id: 'settings', label: '보안 설정', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 보안 정책 탭 */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                보안 정책 목록 ({policies.length}개)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      정책명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      중요도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마지막 수정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                          <div className="text-sm text-gray-500">{policy.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getCategoryColor(policy.category)
                        }`}>
                          {getCategoryText(policy.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getSeverityColor(policy.severity)
                        }`}>
                          {getSeverityText(policy.severity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePolicy(policy.id)}
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                            policy.enabled
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {policy.enabled ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(policy.lastModified).toLocaleDateString()}</div>
                        <div className="text-xs">{policy.modifiedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-2">
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 보안 이벤트 탭 */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                보안 이벤트 목록 ({securityEvents.length}개)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      발생시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이벤트 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      중요도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getEventTypeText(event.eventType)}
                        </div>
                        <div className="text-sm text-gray-500">{event.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {event.userEmail || '알 수 없음'}
                        </div>
                        <div className="text-sm text-gray-500">
                          IP: {event.ipAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getSeverityColor(event.severity)
                        }`}>
                          {getSeverityText(event.severity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={event.status}
                          onChange={(e) => updateEventStatus(event.id, e.target.value as any)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                            getStatusColor(event.status)
                          }`}
                        >
                          <option value="open">미처리</option>
                          <option value="investigating">조사 중</option>
                          <option value="resolved">해결됨</option>
                          <option value="false_positive">오탐</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-2">
                          상세
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          차단
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 보안 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">보안 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">인증 설정</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">2단계 인증 강제</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">IP 주소 제한</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">소셜 로그인 허용</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">감사 설정</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">모든 관리자 활동 로깅</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">데이터 변경 추적</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">실시간 알림</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                설정 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withSuperAdminOnly(SecurityPolicyPage);
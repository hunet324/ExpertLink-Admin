// 수퍼관리자 전용 감사 추적 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userEmail: string;
  userType: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: 'success' | 'failed' | 'warning';
}

interface AuditFilter {
  dateFrom: string;
  dateTo: string;
  userId?: string;
  userType?: string;
  action?: string;
  resource?: string;
  status?: string;
}

const AuditTrailsPage: React.FC = () => {
  const { user } = useStore();
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState<AuditFilter>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 일주일 전
    dateTo: new Date().toISOString().slice(0, 10), // 오늘
  });

  const userType = getUserType(user);

  // 감사 로그 조회
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        // Mock 감사 로그 데이터
        const mockLogs: AuditLog[] = [
          {
            id: 1,
            timestamp: '2024-08-19T10:30:00Z',
            userId: 1,
            userEmail: 'super@expertlink.com',
            userType: 'super_admin',
            action: 'CREATE',
            resource: 'admin_account',
            resourceId: '123',
            ipAddress: '192.168.1.10',
            userAgent: 'Mozilla/5.0...',
            details: {
              accountEmail: 'new_admin@expertlink.com',
              role: 'center_manager',
              centerId: 2
            },
            status: 'success'
          },
          {
            id: 2,
            timestamp: '2024-08-19T09:15:00Z',
            userId: 2,
            userEmail: 'admin@center1.com',
            userType: 'center_manager',
            action: 'UPDATE',
            resource: 'expert_profile',
            resourceId: '456',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0...',
            details: {
              fieldChanged: 'specialization',
              oldValue: '상담심리',
              newValue: '임상심리'
            },
            status: 'success'
          },
          {
            id: 3,
            timestamp: '2024-08-19T08:45:00Z',
            userId: 3,
            userEmail: 'staff@center2.com',
            userType: 'staff',
            action: 'DELETE',
            resource: 'user_data',
            resourceId: '789',
            ipAddress: '203.0.113.25',
            userAgent: 'Mozilla/5.0...',
            details: {
              reason: 'GDPR compliance',
              dataTypes: ['personal_info', 'session_records']
            },
            status: 'success'
          },
          {
            id: 4,
            timestamp: '2024-08-19T07:20:00Z',
            userId: 4,
            userEmail: 'hacker@example.com',
            userType: 'unknown',
            action: 'LOGIN_ATTEMPT',
            resource: 'authentication',
            ipAddress: '45.76.123.456',
            userAgent: 'curl/7.68.0',
            details: {
              reason: 'Multiple failed attempts',
              attemptCount: 10
            },
            status: 'failed'
          },
          {
            id: 5,
            timestamp: '2024-08-18T22:10:00Z',
            userId: 1,
            userEmail: 'super@expertlink.com',
            userType: 'super_admin',
            action: 'UPDATE',
            resource: 'system_settings',
            ipAddress: '192.168.1.10',
            userAgent: 'Mozilla/5.0...',
            details: {
              setting: 'maintenance_mode',
              oldValue: false,
              newValue: true
            },
            status: 'success'
          },
          {
            id: 6,
            timestamp: '2024-08-18T16:30:00Z',
            userId: 2,
            userEmail: 'admin@center1.com',
            userType: 'center_manager',
            action: 'VIEW',
            resource: 'sensitive_data',
            resourceId: '321',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0...',
            details: {
              dataType: 'patient_records',
              accessReason: 'case_review'
            },
            status: 'warning'
          }
        ];

        setAuditLogs(mockLogs);
        setFilteredLogs(mockLogs);
        setError('');
      } catch (err: any) {
        console.error('감사 로그 조회 실패:', err);
        setError(err.message || '감사 로그를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // 필터 적용
  useEffect(() => {
    let filtered = auditLogs;

    // 날짜 필터
    if (filter.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filter.dateFrom)
      );
    }
    if (filter.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filter.dateTo + 'T23:59:59')
      );
    }

    // 사용자 필터
    if (filter.userId) {
      filtered = filtered.filter(log => 
        log.userId.toString().includes(filter.userId!) ||
        log.userEmail.toLowerCase().includes(filter.userId!.toLowerCase())
      );
    }

    // 사용자 타입 필터
    if (filter.userType) {
      filtered = filtered.filter(log => log.userType === filter.userType);
    }

    // 액션 필터
    if (filter.action) {
      filtered = filtered.filter(log => log.action === filter.action);
    }

    // 리소스 필터
    if (filter.resource) {
      filtered = filtered.filter(log => log.resource === filter.resource);
    }

    // 상태 필터
    if (filter.status) {
      filtered = filtered.filter(log => log.status === filter.status);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, filter]);

  // 로그 내보내기
  const exportLogs = async () => {
    try {
      // 실제로는 서버에 요청하여 CSV/JSON 파일 생성
      const csvContent = [
        'Timestamp,User Email,User Type,Action,Resource,Status,IP Address,Details',
        ...filteredLogs.map(log => 
          `${log.timestamp},${log.userEmail},${log.userType},${log.action},${log.resource},${log.status},${log.ipAddress},"${JSON.stringify(log.details).replace(/"/g, '""')}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('로그 내보내기 실패:', err);
      alert(err.message || '로그 내보내기에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '성공';
      case 'failed': return '실패';
      case 'warning': return '주의';
      default: return '알 수 없음';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-blue-100 text-blue-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-purple-100 text-purple-800';
      case 'LOGIN_ATTEMPT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'super_admin': return '수퍼관리자';
      case 'regional_manager': return '지역관리자';
      case 'center_manager': return '센터관리자';
      case 'staff': return '직원';
      case 'expert': return '전문가';
      case 'general': return '일반사용자';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">감사 로그를 불러오는 중...</p>
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
                  href="/admin/super-admin/security-policy"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 보안 정책
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">🔍 감사 추적</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">시스템 활동 감사 로그 및 추적</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportLogs}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                내보내기
              </button>
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

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">검색 필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자
              </label>
              <input
                type="text"
                placeholder="이메일 또는 ID"
                value={filter.userId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 타입
              </label>
              <select
                value={filter.userType || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, userType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="super_admin">수퍼관리자</option>
                <option value="regional_manager">지역관리자</option>
                <option value="center_manager">센터관리자</option>
                <option value="staff">직원</option>
                <option value="expert">전문가</option>
                <option value="general">일반사용자</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                액션
              </label>
              <select
                value={filter.action || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="CREATE">생성</option>
                <option value="UPDATE">수정</option>
                <option value="DELETE">삭제</option>
                <option value="VIEW">조회</option>
                <option value="LOGIN_ATTEMPT">로그인 시도</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리소스
              </label>
              <select
                value={filter.resource || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, resource: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="admin_account">관리자 계정</option>
                <option value="expert_profile">전문가 프로필</option>
                <option value="user_data">사용자 데이터</option>
                <option value="system_settings">시스템 설정</option>
                <option value="sensitive_data">민감한 데이터</option>
                <option value="authentication">인증</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="success">성공</option>
                <option value="failed">실패</option>
                <option value="warning">주의</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilter({
                  dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                  dateTo: new Date().toISOString().slice(0, 10)
                })}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 감사 로그 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              감사 로그 ({filteredLogs.length}개)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    리소스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.userEmail}</div>
                      <div className="text-sm text-gray-500">{getUserTypeText(log.userType)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getActionColor(log.action)
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource}</div>
                      {log.resourceId && (
                        <div className="text-sm text-gray-500">ID: {log.resourceId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(log.status)
                      }`}>
                        {getStatusText(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상세 모달 */}
        {selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">감사 로그 상세 정보</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">시간</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">사용자</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLog.userEmail} ({getUserTypeText(selectedLog.userType)})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">액션</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">리소스</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLog.resource} {selectedLog.resourceId && `(ID: ${selectedLog.resourceId})`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP 주소</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">상태</label>
                      <p className="mt-1 text-sm text-gray-900">{getStatusText(selectedLog.status)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상세 정보</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withSuperAdminOnly(AuditTrailsPage);
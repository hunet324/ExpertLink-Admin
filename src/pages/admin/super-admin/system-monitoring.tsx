// 수퍼관리자 전용 시스템 모니터링 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  activeSessions: number;
  activeUsers: number;
  responseTime: number;
}

interface SystemAlert {
  id: number;
  timestamp: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'security';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  lastCheck: string;
  responseTime: number;
}

const SystemMonitoringPage: React.FC = () => {
  const { user } = useStore();
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: '0 days',
    activeSessions: 0,
    activeUsers: 0,
    responseTime: 0
  });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const userType = getUserType(user);

  // 실시간 시스템 메트릭 시뮬레이션
  useEffect(() => {
    const fetchSystemMetrics = () => {
      // Mock 데이터 생성 (실제로는 API 호출)
      const mockMetrics: SystemMetrics = {
        cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
        memory: Math.floor(Math.random() * 20) + 30, // 30-50%
        disk: Math.floor(Math.random() * 10) + 60, // 60-70%
        network: Math.floor(Math.random() * 50) + 10, // 10-60 Mbps
        uptime: '15 days 8 hours',
        activeSessions: Math.floor(Math.random() * 100) + 200, // 200-300
        activeUsers: Math.floor(Math.random() * 50) + 150, // 150-200
        responseTime: Math.floor(Math.random() * 50) + 50 // 50-100ms
      };

      const mockAlerts: SystemAlert[] = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          type: 'cpu',
          message: 'CPU 사용률이 85%를 초과했습니다',
          severity: 'warning',
          resolved: false
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 30000).toISOString(),
          type: 'memory',
          message: '메모리 사용률이 90%를 초과했습니다',
          severity: 'error',
          resolved: false
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'service',
          message: '데이터베이스 연결 지연이 감지되었습니다',
          severity: 'warning',
          resolved: true
        }
      ];

      const mockServices: ServiceStatus[] = [
        {
          name: 'Web Server',
          status: 'healthy',
          uptime: '99.9%',
          lastCheck: new Date().toISOString(),
          responseTime: 45
        },
        {
          name: 'Database',
          status: 'warning',
          uptime: '99.7%',
          lastCheck: new Date().toISOString(),
          responseTime: 120
        },
        {
          name: 'File Storage',
          status: 'healthy',
          uptime: '100%',
          lastCheck: new Date().toISOString(),
          responseTime: 30
        },
        {
          name: 'Email Service',
          status: 'healthy',
          uptime: '99.8%',
          lastCheck: new Date().toISOString(),
          responseTime: 80
        }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setServices(mockServices);
      setLoading(false);
    };

    fetchSystemMetrics();

    // 자동 새로고침
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemMetrics, 5000); // 5초마다 업데이트
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // 알림 해결 처리
  const resolveAlert = (alertId: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getMetricColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '정상';
      case 'warning': return '주의';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">시스템 모니터링 정보를 불러오는 중...</p>
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
                  href="/admin/super-admin/global-dashboard"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 전체 시스템 현황
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">📈 시스템 모니터링</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">실시간 시스템 성능 및 상태 모니터링</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">자동 새로고침</span>
              </label>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 시스템 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">CPU 사용률</p>
                <p className={`text-2xl font-semibold mt-1 px-2 py-1 rounded-lg ${
                  getMetricColor(metrics.cpu, { warning: 70, error: 85 })
                }`}>
                  {metrics.cpu}%
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🔧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">메모리 사용률</p>
                <p className={`text-2xl font-semibold mt-1 px-2 py-1 rounded-lg ${
                  getMetricColor(metrics.memory, { warning: 80, error: 90 })
                }`}>
                  {metrics.memory}%
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">💾</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">디스크 사용률</p>
                <p className={`text-2xl font-semibold mt-1 px-2 py-1 rounded-lg ${
                  getMetricColor(metrics.disk, { warning: 80, error: 95 })
                }`}>
                  {metrics.disk}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">💿</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">응답 시간</p>
                <p className={`text-2xl font-semibold mt-1 px-2 py-1 rounded-lg ${
                  getMetricColor(metrics.responseTime, { warning: 200, error: 500 })
                }`}>
                  {metrics.responseTime}ms
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 서비스 상태 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">서비스 상태</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' :
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          응답시간: {service.responseTime}ms | 가동률: {service.uptime}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      getServiceStatusColor(service.status)
                    }`}>
                      {getServiceStatusText(service.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 시스템 알림 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">시스템 알림</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {alerts.filter(alert => !alert.resolved).length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">✅</span>
                    <p className="text-gray-500">현재 활성 알림이 없습니다.</p>
                  </div>
                ) : (
                  alerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className={`p-3 border-l-4 rounded-lg ${
                      alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                      alert.severity === 'error' ? 'border-l-red-500 bg-red-50' :
                      alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              getSeverityColor(alert.severity)
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          해결
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.uptime}</div>
              <div className="text-sm text-gray-500">시스템 가동시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.activeSessions}</div>
              <div className="text-sm text-gray-500">활성 세션</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</div>
              <div className="text-sm text-gray-500">동시접속자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.network} Mbps</div>
              <div className="text-sm text-gray-500">네트워크 처리량</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withSuperAdminOnly(SystemMonitoringPage);
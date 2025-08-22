// 수퍼관리자 전용 백업 및 복원 관리 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { withSuperAdminOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface BackupRecord {
  id: number;
  filename: string;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: string;
  createdBy: string;
  description?: string;
}

interface BackupConfig {
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  includeUploads: boolean;
  includeLogs: boolean;
}

const BackupRestorePage: React.FC = () => {
  const { user } = useStore();
  
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    includeUploads: true,
    includeLogs: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'backups' | 'restore' | 'config'>('backups');
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const userType = getUserType(user);

  // 백업 목록 조회
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setLoading(true);
        
        // Mock 백업 데이터
        const mockBackups: BackupRecord[] = [
          {
            id: 1,
            filename: 'expertlink_full_20240819_020000.sql.gz',
            type: 'full',
            size: 1024 * 1024 * 250, // 250MB
            status: 'completed',
            createdAt: '2024-08-19T02:00:00Z',
            createdBy: 'System Auto',
            description: '일일 자동 전체 백업'
          },
          {
            id: 2,
            filename: 'expertlink_incremental_20240818_020000.sql.gz',
            type: 'incremental',
            size: 1024 * 1024 * 45, // 45MB
            status: 'completed',
            createdAt: '2024-08-18T02:00:00Z',
            createdBy: 'System Auto',
            description: '일일 자동 증분 백업'
          },
          {
            id: 3,
            filename: 'expertlink_manual_20240817_143000.sql.gz',
            type: 'full',
            size: 1024 * 1024 * 240, // 240MB
            status: 'completed',
            createdAt: '2024-08-17T14:30:00Z',
            createdBy: '수퍼관리자',
            description: '시스템 업데이트 전 수동 백업'
          },
          {
            id: 4,
            filename: 'expertlink_full_20240817_020000.sql.gz',
            type: 'full',
            size: 1024 * 1024 * 238, // 238MB
            status: 'completed',
            createdAt: '2024-08-17T02:00:00Z',
            createdBy: 'System Auto',
            description: '일일 자동 전체 백업'
          },
          {
            id: 5,
            filename: 'expertlink_full_20240816_020000.sql.gz',
            type: 'full',
            size: 0,
            status: 'failed',
            createdAt: '2024-08-16T02:00:00Z',
            createdBy: 'System Auto',
            description: '디스크 공간 부족으로 실패'
          }
        ];

        setBackups(mockBackups);
        setError('');
      } catch (err: any) {
        console.error('백업 목록 조회 실패:', err);
        setError(err.message || '백업 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, []);

  // 수동 백업 실행
  const createManualBackup = async (type: BackupRecord['type'] = 'full') => {
    if (!confirm(`${type === 'full' ? '전체' : '증분'} 백업을 실행하시겠습니까?`)) {
      return;
    }

    try {
      const newBackup: BackupRecord = {
        id: Date.now(),
        filename: `expertlink_manual_${new Date().toISOString().replace(/[:.]/g, '_').slice(0, -5)}.sql.gz`,
        type,
        size: 0,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        createdBy: user?.name || '수퍼관리자',
        description: `수동 ${type === 'full' ? '전체' : '증분'} 백업`
      };

      setBackups(prev => [newBackup, ...prev]);

      // 백업 진행 시뮬레이션
      setTimeout(() => {
        setBackups(prev => 
          prev.map(backup => 
            backup.id === newBackup.id 
              ? { ...backup, status: 'completed' as const, size: 1024 * 1024 * 200 }
              : backup
          )
        );
      }, 5000);

      alert('백업이 시작되었습니다. 완료까지 몇 분 소요될 수 있습니다.');
    } catch (err: any) {
      console.error('백업 실행 실패:', err);
      alert(err.message || '백업 실행에 실패했습니다.');
    }
  };

  // 백업 복원
  const restoreBackup = async (backup: BackupRecord) => {
    if (!confirm(`${backup.filename} 백업을 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setRestoreInProgress(true);
      setSelectedBackup(backup);

      // 복원 진행 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 10000));

      alert('백업 복원이 완료되었습니다.');
      setSelectedBackup(null);
    } catch (err: any) {
      console.error('백업 복원 실패:', err);
      alert(err.message || '백업 복원에 실패했습니다.');
    } finally {
      setRestoreInProgress(false);
    }
  };

  // 설정 저장
  const saveConfig = async () => {
    try {
      // 실제로는 API 호출
      console.log('백업 설정 저장:', config);
      alert('백업 설정이 저장되었습니다.');
    } catch (err: any) {
      console.error('설정 저장 실패:', err);
      alert(err.message || '설정 저장에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'failed': return '실패';
      case 'in_progress': return '진행중';
      default: return '알 수 없음';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'incremental': return 'bg-purple-100 text-purple-800';
      case 'differential': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full': return '전체';
      case 'incremental': return '증분';
      case 'differential': return '차등';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">백업 정보를 불러오는 중...</p>
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
                  href="/admin/super-admin/global-settings"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  ← 글로벌 설정
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">💾 백업 및 복원</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">데이터베이스 백업 및 복원 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => createManualBackup('incremental')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                증분 백업
              </button>
              <button
                onClick={() => createManualBackup('full')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                전체 백업
              </button>
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

        {/* 복원 진행 알림 */}
        {restoreInProgress && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full mr-3"></div>
              <p className="text-yellow-700">
                백업 복원이 진행 중입니다. 완료까지 몇 분 소요될 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'backups', label: '백업 목록', icon: '📋' },
                { id: 'restore', label: '복원', icon: '🔄' },
                { id: 'config', label: '설정', icon: '⚙️' }
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

        {/* 백업 목록 탭 */}
        {activeTab === 'backups' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                백업 목록 ({backups.length}개)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      파일명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      크기
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{backup.filename}</div>
                          <div className="text-sm text-gray-500">{backup.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getTypeColor(backup.type)
                        }`}>
                          {getTypeText(backup.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusColor(backup.status)
                        }`}>
                          {getStatusText(backup.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {backup.createdBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => restoreBackup(backup)}
                                disabled={restoreInProgress}
                                className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                              >
                                복원
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                다운로드
                              </button>
                            </>
                          )}
                          <button className="text-red-600 hover:text-red-900">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 복원 탭 */}
        {activeTab === 'restore' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">백업 복원</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">백업 파일 업로드</h3>
                <p className="text-gray-600 mb-4">
                  복원할 백업 파일을 선택하거나 드래그하여 업로드하세요.
                </p>
                <input
                  type="file"
                  accept=".sql,.gz,.zip"
                  className="hidden"
                  id="backup-upload"
                />
                <label
                  htmlFor="backup-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
                >
                  파일 선택
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ 복원 시 주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 복원 작업은 현재 데이터를 완전히 덮어씁니다.</li>
                  <li>• 복원 중에는 시스템에 접근할 수 없습니다.</li>
                  <li>• 복원 전에 현재 데이터를 백업하는 것을 권장합니다.</li>
                  <li>• 복원 작업은 취소하거나 되돌릴 수 없습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">백업 설정</h2>
            
            <div className="space-y-6">
              {/* 자동 백업 설정 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">자동 백업</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.autoBackupEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoBackupEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">자동 백업 활성화</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        백업 주기
                      </label>
                      <select
                        value={config.backupFrequency}
                        onChange={(e) => setConfig(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">매일</option>
                        <option value="weekly">매주</option>
                        <option value="monthly">매월</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        백업 시간
                      </label>
                      <input
                        type="time"
                        value={config.backupTime}
                        onChange={(e) => setConfig(prev => ({ ...prev, backupTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        보관 기간 (일)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={config.retentionDays}
                        onChange={(e) => setConfig(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 백업 옵션 */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">백업 옵션</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.compressionEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">압축 사용</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.encryptionEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, encryptionEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">암호화 사용</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.includeUploads}
                      onChange={(e) => setConfig(prev => ({ ...prev, includeUploads: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">업로드 파일 포함</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.includeLogs}
                      onChange={(e) => setConfig(prev => ({ ...prev, includeLogs: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">로그 파일 포함</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={saveConfig}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withSuperAdminOnly(BackupRestorePage);
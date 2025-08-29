import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { AdminApiService } from '@/services/adminApi';
import { useStore } from '@/store/useStore';
import { getUserType } from '@/utils/permissions';
import { withAdminOnly } from '@/components/withPermission';
import PermissionGuard from '@/components/PermissionGuard';

interface Expert {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  licenseNumber: string;
  licenseType: string;
  specializations: string[];
  experience: number;
  education: string[];
  certifications: string[];
  workHistory: {
    institution: string;
    position: string;
    period: string;
  }[] | any[];
  bio: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
  consultationCount: number;
  rating: number;
  consultationTypes: {
    video: boolean;
    chat: boolean;
    voice: boolean;
  };
  rates: {
    video: number;
    chat: number;
    voice: number;
  };
  totalEarnings: number;
  clientCount: number;
}

const ExpertSystemPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useStore();
  const userType = getUserType(user);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 버튼 액션 로딩 상태
  const [successMessage, setSuccessMessage] = useState<string>(''); // 성공 메시지

  // 전문가 목록 상태
  const [allExperts, setAllExperts] = useState<Expert[]>([]); // 전체 데이터
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 전문가 목록 데이터 로드
  const fetchExperts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const expertsData = await AdminApiService.getAllExperts();
      setAllExperts(expertsData);
    } catch (err: any) {
      console.error('전문가 목록 조회 실패:', err);
      setError(err.message || '전문가 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType) {
      fetchExperts();
    }
  }, [userType]);

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search as string);
    }
  }, [router.query]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-white';
      case 'inactive': return 'bg-background-400 text-white';
      case 'suspended': return 'bg-error text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활동중';
      case 'inactive': return '비활성';
      case 'suspended': return '정지';
      default: return status;
    }
  };

  // 안전한 데이터 검증 함수들 (필터링 전에 선언)
  const safeString = (value: any, fallback: string = '정보 없음'): string => {
    return value && typeof value === 'string' && value.trim() ? value : fallback;
  };

  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return !isNaN(num) && isFinite(num) ? num : fallback;
  };

  const safeArray = (value: any): any[] => {
    return Array.isArray(value) ? value : [];
  };

  // 필터링된 전체 데이터
  const filteredExperts = allExperts.filter(expert => {
    if (!expert) return false;
    
    const name = safeString(expert.name, '').toLowerCase();
    const email = safeString(expert.email, '').toLowerCase();
    const specializations = safeArray(expert.specializations);
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = name.includes(searchLower) ||
                         email.includes(searchLower) ||
                         specializations.some(spec => safeString(spec, '').toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'all' || expert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 페이지네이션 적용 (필터링된 데이터 기준)
  const totalFilteredExperts = filteredExperts.length;
  const totalPages = Math.ceil(totalFilteredExperts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExperts = filteredExperts.slice(startIndex, endIndex);

  // 상태별 카운트 (전체 데이터 기준)
  const getFilterCount = (status: 'all' | 'active' | 'inactive' | 'suspended') => {
    if (status === 'all') return allExperts.length;
    return allExperts.filter(expert => expert && expert.status === status).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0원';
    return `${amount.toLocaleString()}원`;
  };

  const openDetailModal = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (expertId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      setActionLoading(expertId + '_' + newStatus);
      setError('');
      setSuccessMessage('');
      
      const result = await AdminApiService.updateExpertStatus(expertId, newStatus);
      
      if (result.success) {
        // 전체 데이터 업데이트
        setAllExperts(prev => prev.map(expert => 
          expert.id === expertId 
            ? { ...expert, status: newStatus }
            : expert
        ));
        setSuccessMessage(result.message);
        
        // 기존 타이머가 있으면 제거
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        
        // 3초 후 성공 메시지 제거
        successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('상태 변경 실패:', err);
      setError(err.message || '상태 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const refreshExperts = () => {
    fetchExperts();
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // 검색이나 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
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
      {/* 사이드바 */}
      <Sidebar 
        userType={userType} 
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">👨‍⚕️</span>
                전문가 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                승인된 전문가들의 정보를 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 통계 정보 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getFilterCount('active')}</div>
                  <div className="text-xs text-secondary-400">활동중</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary-400">{getFilterCount('inactive')}</div>
                  <div className="text-xs text-secondary-400">비활성</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-error">{getFilterCount('suspended')}</div>
                  <div className="text-xs text-secondary-400">정지됨</div>
                </div>
              </div>

              {/* 새로고침 버튼 */}
              <button
                onClick={refreshExperts}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                {loading ? '로딩 중...' : '새로고침'}
              </button>
              
              {/* 프로필 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || '관'}</span>
                </div>
                <span className="text-body text-secondary-600">{user?.name || '관리자'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
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

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="text-secondary-400">전문가 목록을 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* 데이터가 있을 때만 표시 */}
          {!loading && (
            <>
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색바 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="전문가 이름, 이메일, 전문분야로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                  검색
                </button>
              </div>
            </div>

            {/* 상태 필터 탭 */}
            <div className="bg-white rounded-custom shadow-soft p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                  { key: 'active' as const, label: '활동중', count: getFilterCount('active') },
                  { key: 'inactive' as const, label: '비활성', count: getFilterCount('inactive') },
                  { key: 'suspended' as const, label: '정지됨', count: getFilterCount('suspended') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                      statusFilter === tab.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        statusFilter === tab.key
                          ? 'bg-white text-primary'
                          : 'bg-background-200 text-secondary-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 전문가 목록 */}
          <div className="space-y-4">
            {paginatedExperts.length > 0 ? (
              paginatedExperts.map((expert) => (
                <div key={expert.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{expert.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-h4 font-semibold text-secondary flex items-center space-x-2">
                          <span>{safeString(expert.name, '이름 없음')}</span>
                          <span className="bg-background-200 text-secondary-600 px-3 py-1 rounded-full text-caption">
                            {safeString(expert.licenseType, '자격증 없음')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(expert.status)}`}>
                            {getStatusText(expert.status)}
                          </span>
                        </h3>
                        <p className="text-caption text-secondary-400 mt-1">{safeString(expert.email, '이메일 없음')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-caption text-secondary-400">가입일: {expert.joinedAt ? formatDate(expert.joinedAt) : '정보 없음'}</div>
                      <div className="text-caption text-secondary-400 mt-1">최종 접속: {expert.lastLogin ? formatDateTime(expert.lastLogin) : '접속 내역 없음'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
                    {/* 활동 통계 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">활동 통계</h4>
                      <div className="space-y-1 text-caption">
                        <div className="flex justify-between">
                          <span>상담 횟수:</span>
                          <span className="font-medium">{safeNumber(expert.consultationCount)}회</span>
                        </div>
                        <div className="flex justify-between">
                          <span>내담자 수:</span>
                          <span className="font-medium">{safeNumber(expert.clientCount)}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span>평점:</span>
                          <span className="font-medium text-accent">⭐ {safeNumber(expert.rating, 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 수익 정보 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">수익 정보</h4>
                      <div className="space-y-1 text-caption">
                        <div className="flex justify-between">
                          <span>총 수익:</span>
                          <span className="font-medium text-primary">{formatCurrency(safeNumber(expert.totalEarnings))}</span>
                        </div>
                        <div className="text-xs text-secondary-400">
                          평균: {safeNumber(expert.consultationCount) > 0 ? formatCurrency(Math.round(safeNumber(expert.totalEarnings) / safeNumber(expert.consultationCount))) : '0원'} / 건
                        </div>
                      </div>
                    </div>

                    {/* 전문분야 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">전문분야</h4>
                      <div className="flex flex-wrap gap-1">
                        {safeArray(expert.specializations).length > 0 ? (
                          <>
                            {safeArray(expert.specializations).slice(0, 3).map((spec, index) => (
                              <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                                {safeString(spec, '전문분야')}
                              </span>
                            ))}
                            {safeArray(expert.specializations).length > 3 && (
                              <span className="bg-background-200 text-secondary-500 px-2 py-1 rounded text-xs">
                                +{safeArray(expert.specializations).length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-secondary-400">전문분야 없음</span>
                        )}
                      </div>
                    </div>

                    {/* 상담 방식 및 요금 */}
                    <div className="space-y-2">
                      <h4 className="text-caption font-semibold text-secondary-600">상담 방식 및 요금</h4>
                      <div className="space-y-1 text-xs">
                        {expert.consultationTypes.video && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>🎥</span>
                              <span>화상</span>
                            </span>
                            <span>{formatCurrency(expert.rates.video)}</span>
                          </div>
                        )}
                        {expert.consultationTypes.chat && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>💭</span>
                              <span>채팅</span>
                            </span>
                            <span>{formatCurrency(expert.rates.chat)}</span>
                          </div>
                        )}
                        {expert.consultationTypes.voice && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span>🎧</span>
                              <span>음성</span>
                            </span>
                            <span>{formatCurrency(expert.rates.voice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200">
                    <button
                      onClick={() => openDetailModal(expert)}
                      className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                    >
                      상세정보
                    </button>

                    <div className="flex space-x-2">
                      {expert.status === 'active' && (
                        <>
                          <PermissionGuard minLevel="center_manager">
                            <button
                              onClick={() => handleStatusChange(expert.id, 'inactive')}
                              disabled={actionLoading === expert.id + '_inactive'}
                              className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === expert.id + '_inactive' ? '처리중...' : '비활성화'}
                            </button>
                          </PermissionGuard>
                          <PermissionGuard minLevel="regional_manager">
                            <button
                              onClick={() => handleStatusChange(expert.id, 'suspended')}
                              disabled={actionLoading === expert.id + '_suspended'}
                              className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === expert.id + '_suspended' ? '처리중...' : '정지'}
                            </button>
                          </PermissionGuard>
                        </>
                      )}
                      
                      {expert.status === 'inactive' && (
                        <PermissionGuard minLevel="center_manager">
                          <button
                            onClick={() => handleStatusChange(expert.id, 'active')}
                            disabled={actionLoading === expert.id + '_active'}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === expert.id + '_active' ? '처리중...' : '활성화'}
                          </button>
                        </PermissionGuard>
                      )}

                      {expert.status === 'suspended' && (
                        <PermissionGuard minLevel="regional_manager">
                          <button
                            onClick={() => handleStatusChange(expert.id, 'active')}
                            disabled={actionLoading === expert.id + '_active'}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === expert.id + '_active' ? '처리중...' : '정지해제'}
                          </button>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  다른 검색어를 입력하거나 필터를 변경해보세요.
                </p>
              </div>
            )}
          </div>
          
          {/* 페이지네이션 */}
          {!loading && !error && totalPages > 1 && (
            <div className="bg-white rounded-custom shadow-soft p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-500">
                  총 {totalFilteredExperts}명의 전문가 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalFilteredExperts)}명 표시
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="px-3 py-2 border border-background-300 rounded-lg text-sm font-medium text-secondary-600 hover:bg-background-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-secondary-600 hover:bg-background-100'
                          } disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="px-3 py-2 border border-background-300 rounded-lg text-sm font-medium text-secondary-600 hover:bg-background-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">{selectedExpert.name} 전문가 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">이메일</div>
                      <div className="text-body text-secondary-700">{safeString(selectedExpert.email, '이메일 없음')}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">전화번호</div>
                      <div className="text-body text-secondary-700">{safeString(selectedExpert.phone, '전화번호 없음')}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">생년월일</div>
                      <div className="text-body text-secondary-700">{selectedExpert.birthDate ? formatDate(selectedExpert.birthDate) : '생년월일 없음'}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">성별</div>
                      <div className="text-body text-secondary-700">
                        {selectedExpert.gender === 'male' ? '남성' : selectedExpert.gender === 'female' ? '여성' : '성별 없음'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 학력 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">학력</h4>
                  <ul className="space-y-1">
                    {safeArray(selectedExpert.education).length > 0 ? (
                      safeArray(selectedExpert.education).map((edu, index) => (
                        <li key={index} className="text-body text-secondary-700 flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                          {safeString(edu)}
                        </li>
                      ))
                    ) : (
                      <li className="text-body text-secondary-400">학력 정보 없음</li>
                    )}
                  </ul>
                </div>

                {/* 자격증 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">자격증</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {safeArray(selectedExpert.certifications).length > 0 ? (
                      safeArray(selectedExpert.certifications).map((cert, index) => (
                        <div key={index} className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                          <span className="text-accent-700 text-body">{safeString(cert)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-body text-secondary-400">자격증 정보 없음</div>
                    )}
                  </div>
                </div>

                {/* 경력 사항 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">경력 사항</h4>
                  <div className="space-y-3">
                    {safeArray(selectedExpert.workHistory).length > 0 ? (
                      safeArray(selectedExpert.workHistory).map((work, index) => (
                        <div key={index} className="border border-background-200 rounded-lg p-4">
                          <div className="text-body font-medium text-secondary-700">{safeString(work.institution, '기관명 없음')}</div>
                          <div className="text-caption text-secondary-500">{safeString(work.position, '직책 없음')}</div>
                          <div className="text-caption text-secondary-400">{safeString(work.period, '기간 없음')}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-body text-secondary-400">경력 사항 없음</div>
                    )}
                  </div>
                </div>

                {/* 소개글 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-2">소개글</h4>
                  <div className="bg-background-50 p-4 rounded-lg">
                    <p className="text-body text-secondary-700 leading-relaxed whitespace-pre-wrap">
                      {safeString(selectedExpert.bio, '소개글이 작성되지 않았습니다.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                <button
                  onClick={() => setShowDetailModal(false)}
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

export default withAdminOnly(ExpertSystemPage, false);
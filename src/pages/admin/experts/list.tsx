// 전문가 목록 관리 페이지

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { apiClient } from '@/services/api';
import { withCenterManagerOnly } from '@/components/withPermission';
import AdminLevelBadge from '@/components/AdminLevelBadge';
import { getUserType } from '@/utils/permissions';

interface Expert {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  status: string;
  centerName?: string;
  centerCode?: string;
  centerId?: number;
  specialties?: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  expertProfile?: {
    yearsExperience?: number;
    licenseType?: string;
    licenseNumber?: string;
    isVerified: boolean;
  };
}

interface ExpertListResponse {
  experts: Expert[];
  total: number;
  page: number;
  limit: number;
}

const ExpertListPage: React.FC = () => {
  const { user } = useStore();
  
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 필터링 및 페이지네이션
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // 센터 목록
  const [centers, setCenters] = useState<any[]>([]);

  const userType = getUserType(user);

  // 전문가 목록 조회
  useEffect(() => {
    fetchExperts();
  }, [currentPage, selectedStatus, selectedCenter, searchKeyword]);

  // 센터 목록 조회
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await apiClient.get<{ centers: any[] }>('/admin/centers');
        setCenters(response.centers || []);
      } catch (error) {
        console.error('센터 목록 조회 실패:', error);
      }
    };

    fetchCenters();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        userType: 'expert'
      });

      if (selectedStatus !== 'all') {
        queryParams.append('status', selectedStatus);
      }

      if (selectedCenter !== 'all') {
        queryParams.append('centerId', selectedCenter);
      }

      if (searchKeyword.trim()) {
        queryParams.append('search', searchKeyword.trim());
      }

      const response = await apiClient.get<{ users: any[]; total: number }>(`/admin/users?${queryParams.toString()}`);
      
      setExperts(response.users || []);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      setError('');
    } catch (err: any) {
      console.error('전문가 목록 조회 실패:', err);
      setError(err.message || '전문가 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '승인대기';
      default: return '알 수 없음';
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchExperts();
  };

  const handleReset = () => {
    setSelectedStatus('all');
    setSelectedCenter('all');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">전문가 목록을 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                전문가 목록 관리
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">전문가 계정 조회 및 관리</p>
                {userType && <AdminLevelBadge userType={userType} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색어
              </label>
              <input
                type="text"
                placeholder="이름, 이메일 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">승인대기</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                센터
              </label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                검색
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                초기화
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

        {/* 전문가 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                전문가 목록 ({experts.length}명)
              </h2>
              <div className="text-sm text-gray-500">
                {currentPage} / {totalPages} 페이지
              </div>
            </div>
          </div>

          {experts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">전문가가 없습니다</h3>
              <p className="text-gray-600">검색 조건에 맞는 전문가가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전문가 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소속 센터
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전문 분야
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      자격 인증
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {experts.map((expert) => (
                    <tr key={expert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {expert.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={expert.profileImage}
                                alt={expert.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {expert.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {expert.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {expert.email}
                            </div>
                            {expert.phone && (
                              <div className="text-xs text-gray-400">
                                {expert.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {expert.centerName ? (
                            <div>
                              <div className="font-medium">{expert.centerName}</div>
                              {expert.centerCode && (
                                <div className="text-xs text-gray-500">{expert.centerCode}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">미배정</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {expert.specialties && expert.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {expert.specialties.map((specialty, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">미설정</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {expert.expertProfile?.isVerified ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              ✅ 인증됨
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              ⏳ 대기중
                            </span>
                          )}
                          {expert.expertProfile?.licenseType && (
                            <div className="text-xs text-gray-500 mt-1">
                              {expert.expertProfile.licenseType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusColor(expert.status)
                        }`}>
                          {getStatusText(expert.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expert.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/experts/${expert.id}/profile`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            프로필
                          </Link>
                          <Link
                            href={`/admin/experts/${expert.id}/vacation`}
                            className="text-green-600 hover:text-green-900"
                          >
                            휴가
                          </Link>
                          <Link
                            href={`/admin/experts/${expert.id}/working-hours`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            일정
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                이전
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                다음
              </button>
            </nav>
          </div>
        )}

        {/* 통계 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 전문가</p>
                <p className="text-2xl font-semibold text-gray-900">{experts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">활성</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {experts.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">승인대기</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {experts.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🏥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">인증됨</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {experts.filter(e => e.expertProfile?.isVerified).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCenterManagerOnly(ExpertListPage);
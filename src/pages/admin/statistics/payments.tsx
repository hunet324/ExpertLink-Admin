import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { paymentService, PaymentRecord, PaymentStats, PaymentFilters } from '@/services/payments';


const PaymentHistoryPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '2024-08-01',
    end: '2024-08-31'
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 결제 내역 및 통계 로딩
  useEffect(() => {
    loadPayments();
    loadStats();
  }, [statusFilter, serviceFilter, paymentMethodFilter, dateRange, pagination.page]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const filters: PaymentFilters = {
        status: statusFilter,
        serviceType: serviceFilter,
        paymentMethod: paymentMethodFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await paymentService.getAllPayments(filters);
      console.log('결제 내역 API 응답:', response);
      if (response.data.length > 0) {
        console.log('첫 번째 결제 데이터:', response.data[0]);
        console.log('paidAt 값:', response.data[0].paidAt, typeof response.data[0].paidAt);
      }
      setPaymentRecords(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err: any) {
      console.error('결제 내역 조회 실패:', err);
      setError(err.message || '결제 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('결제 통계 API 호출:', { dateRange });
      const stats = await paymentService.getPaymentStats(dateRange.start, dateRange.end);
      console.log('결제 통계 API 응답:', stats);
      setPaymentStats(stats);
    } catch (err: any) {
      console.error('결제 통계 조회 실패:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPayments();
  };

  // 샘플 데이터 (API 연동 후 제거됨)
  const [samplePayments] = useState<PaymentRecord[]>([
  ]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'completed': 'bg-accent text-white',
      'pending': 'bg-secondary-400 text-white',
      'failed': 'bg-error text-white',
      'refunded': 'bg-background-400 text-white',
      'cancelled': 'bg-background-300 text-secondary-600'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'completed': '완료',
      'pending': '대기중',
      'failed': '실패',
      'refunded': '환불',
      'cancelled': '취소'
    };
    return statusTexts[status] || '알 수 없음';
  };

  const getServiceTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'video': '화상 상담',
      'chat': '채팅 상담',
      'voice': '음성 상담',
      'test': '심리검사'
    };
    return typeLabels[type] || '기타';
  };

  const getServiceTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'video': 'bg-primary-100 text-primary-700',
      'chat': 'bg-accent-100 text-accent-700',
      'voice': 'bg-secondary-100 text-secondary-700',
      'test': 'bg-logo-point/20 text-logo-main'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodLabels: Record<string, string> = {
      'card': '신용카드',
      'bank': '계좌이체',
      'kakao': '카카오페이',
      'paypal': 'PayPal'
    };
    return methodLabels[method] || '기타';
  };

  // API에서 이미 필터링되어 오므로 그대로 사용
  const filteredPayments = paymentRecords;

  const getFilterCount = (status: string) => {
    if (!paymentStats || !paymentStats.statusCounts) return 0;
    if (status === 'all') return Object.values(paymentStats.statusCounts).reduce((sum, count) => sum + count, 0);
    return (paymentStats.statusCounts as any)[status] || 0;
  };

  const stats = paymentStats || {
    totalTransactions: 0,
    totalAmount: 0,
    totalFee: 0,
    totalNet: 0,
    refundedAmount: 0
  };

  const openDetailModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleRefund = async (paymentId: number) => {
    const reason = prompt('환불 사유를 입력하세요:');
    if (reason) {
      try {
        setLoading(true);
        await paymentService.refundPayment(paymentId, reason);
        alert('환불 처리가 완료되었습니다.');
        loadPayments(); // 목록 새로고침
        loadStats(); // 통계 새로고침
      } catch (err: any) {
        console.error('환불 처리 실패:', err);
        alert(err.message || '환불 처리에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar userType="super_admin" />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">💳</span>
                결제 내역 관리
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                모든 결제 거래 내역을 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
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

        {/* 통계 대시보드 */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 거래량</p>
                  <p className="text-h2 font-bold text-secondary mt-1">{stats.totalTransactions}건</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 결제액</p>
                  <p className="text-h3 font-bold text-accent mt-1">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">수수료</p>
                  <p className="text-h3 font-bold text-secondary mt-1">{formatCurrency(stats.totalFee)}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏦</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">순 수익</p>
                  <p className="text-h3 font-bold text-logo-main mt-1">{formatCurrency(stats.totalNet)}</p>
                </div>
                <div className="w-12 h-12 bg-logo-point/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">환불액</p>
                  <p className="text-h3 font-bold text-error mt-1">{formatCurrency(stats.refundedAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">↩️</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6 pt-0">
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색바 및 날짜 필터 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="고객명, 전문가명, 거래ID, 서비스명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                  />
                  <span className="text-secondary-400">~</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="px-3 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* 필터 옵션 */}
            <div className="bg-white rounded-custom shadow-soft p-4">
              <div className="flex items-center space-x-4">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value as typeof serviceFilter)}
                  className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="all">모든 서비스</option>
                  <option value="video">화상 상담</option>
                  <option value="chat">채팅 상담</option>
                  <option value="voice">음성 상담</option>
                  <option value="test">심리검사</option>
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value as typeof paymentMethodFilter)}
                  className="px-4 py-2 border border-background-300 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="all">모든 결제수단</option>
                  <option value="card">신용카드</option>
                  <option value="bank">계좌이체</option>
                  <option value="kakao">카카오페이</option>
                  <option value="paypal">PayPal</option>
                </select>

                <div className="flex space-x-2">
                  {[
                    { key: 'all' as const, label: '전체', count: getFilterCount('all') },
                    { key: 'completed' as const, label: '완료', count: getFilterCount('completed') },
                    { key: 'pending' as const, label: '대기중', count: getFilterCount('pending') },
                    { key: 'failed' as const, label: '실패', count: getFilterCount('failed') },
                    { key: 'refunded' as const, label: '환불', count: getFilterCount('refunded') }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-1 ${
                        statusFilter === tab.key
                          ? 'bg-primary text-white'
                          : 'text-secondary-600 hover:bg-background-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        statusFilter === tab.key
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
          </div>

          {/* 결제 내역 테이블 */}
          <div className="bg-white rounded-custom shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-50 border-b border-background-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">거래ID</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">고객정보</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">전문가</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">서비스</th>
                    <th className="text-right py-3 px-4 font-medium text-secondary-600 text-caption">결제액</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">결제수단</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">상태</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-600 text-caption">결제일시</th>
                    <th className="text-center py-3 px-4 font-medium text-secondary-600 text-caption">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className={`border-b border-background-100 hover:bg-background-50 ${index % 2 === 0 ? 'bg-white' : 'bg-background-25'}`}>
                      <td className="py-3 px-4">
                        <div className="text-caption font-mono text-secondary-700">{payment.transactionId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          <div className="font-medium text-secondary-700">{payment.userName}</div>
                          <div className="text-secondary-400">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption font-medium text-secondary-700">{payment.expertName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(payment.serviceType)}`}>
                            {getServiceTypeLabel(payment.serviceType)}
                          </span>
                          <div className="text-caption text-secondary-600">{payment.serviceName}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-caption">
                          <div className="font-bold text-secondary-700">{formatCurrency(payment.amount)}</div>
                          <div className="text-secondary-400">수수료: {formatCurrency(payment.fee)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption">
                          <div className="text-secondary-700">{getPaymentMethodLabel(payment.paymentMethod)}</div>
                          <div className="text-secondary-400">{payment.paymentProvider}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-caption text-secondary-700">{formatDate(payment.paidAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openDetailModal(payment)}
                            className="text-primary hover:text-primary-600 text-caption"
                          >
                            상세
                          </button>
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => handleRefund(payment.id)}
                              disabled={loading}
                              className="text-error hover:text-error-600 text-caption disabled:opacity-50"
                            >
                              환불
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-secondary-600">결제 내역을 불러오는 중...</p>
              </div>
            )}

            {!loading && filteredPayments.length === 0 && (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">💳</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  검색 조건에 맞는 결제 내역이 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  검색 조건이나 날짜 범위를 변경해보세요
                </p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {!loading && pagination.totalPages > 1 && (
            <div className="bg-white rounded-custom shadow-soft p-4 mt-6 flex items-center justify-between">
              <div className="text-caption text-secondary-600">
                전체 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page <= 1 || loading}
                  className="px-3 py-2 border border-background-300 rounded-lg text-caption disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50"
                >
                  이전
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-caption ${
                        pagination.page === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-background-300 hover:bg-background-50 disabled:opacity-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="px-3 py-2 border border-background-300 rounded-lg text-caption disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 결제 상세 모달 */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-custom max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-semibold text-secondary">결제 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 거래 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">거래 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">거래 ID</div>
                      <div className="text-body font-mono text-secondary-700">{selectedPayment.transactionId}</div>
                    </div>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-caption text-secondary-500">결제 상태</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(selectedPayment.status)}`}>
                          {getStatusText(selectedPayment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 고객 및 전문가 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">관련 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-caption text-primary-600">고객 정보</div>
                      <div className="text-body text-primary-700">{selectedPayment.userName}</div>
                      <div className="text-caption text-primary-600">{selectedPayment.userEmail}</div>
                    </div>
                    <div className="bg-accent-50 p-3 rounded-lg">
                      <div className="text-caption text-accent-600">전문가</div>
                      <div className="text-body text-accent-700">{selectedPayment.expertName}</div>
                    </div>
                  </div>
                </div>

                {/* 서비스 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">서비스 정보</h4>
                  <div className="bg-background-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-caption font-medium ${getServiceTypeColor(selectedPayment.serviceType)}`}>
                        {getServiceTypeLabel(selectedPayment.serviceType)}
                      </span>
                    </div>
                    <div className="text-body text-secondary-700 mb-1">{selectedPayment.serviceName}</div>
                    {selectedPayment.sessionDuration && (
                      <div className="text-caption text-secondary-500">실제 진행 시간: {selectedPayment.sessionDuration}분</div>
                    )}
                  </div>
                </div>

                {/* 결제 정보 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">결제 정보</h4>
                  <div className="bg-background-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-caption text-secondary-600">서비스 금액</span>
                      <span className="text-body font-medium">{formatCurrency(selectedPayment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-caption text-secondary-600">플랫폼 수수료</span>
                      <span className="text-body text-secondary-600">-{formatCurrency(selectedPayment.fee)}</span>
                    </div>
                    <div className="border-t border-background-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-body font-semibold text-secondary">전문가 수익</span>
                        <span className="text-body font-bold text-accent">{formatCurrency(selectedPayment.netAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 결제 수단 */}
                <div>
                  <h4 className="text-body font-semibold text-secondary mb-3">결제 수단</h4>
                  <div className="bg-background-50 p-3 rounded-lg">
                    <div className="text-body text-secondary-700">{getPaymentMethodLabel(selectedPayment.paymentMethod)}</div>
                    <div className="text-caption text-secondary-500">{selectedPayment.paymentProvider}</div>
                  </div>
                </div>

                {/* 환불 정보 (환불된 경우) */}
                {selectedPayment.status === 'refunded' && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">환불 정보</h4>
                    <div className="bg-error-50 p-4 rounded-lg">
                      <div className="text-caption text-error-600 mb-1">환불 일시</div>
                      <div className="text-body text-error-700 mb-2">{selectedPayment.refundedAt && formatDate(selectedPayment.refundedAt)}</div>
                      <div className="text-caption text-error-600 mb-1">환불 사유</div>
                      <div className="text-body text-error-700">{selectedPayment.refundReason}</div>
                    </div>
                  </div>
                )}

                {/* 기타 정보 */}
                {selectedPayment.notes && (
                  <div>
                    <h4 className="text-body font-semibold text-secondary mb-3">추가 정보</h4>
                    <div className="bg-background-50 p-3 rounded-lg">
                      <div className="text-body text-secondary-700">{selectedPayment.notes}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-background-200">
                {selectedPayment.receiptUrl && (
                  <a
                    href={selectedPayment.receiptUrl}
                    target="_blank"
                    className="bg-secondary-400 text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-secondary-500 transition-colors"
                  >
                    영수증 다운로드
                  </a>
                )}
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

export default PaymentHistoryPage;
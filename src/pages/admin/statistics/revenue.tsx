import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';
import { revenueService, RevenueData, RevenueStats, ExpertRanking } from '@/services/revenue';


const RevenueStatisticsPage: React.FC = () => {
  const router = useRouter();
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-08-12'
  });
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'growth'>('revenue');
  
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueData[]>([]);
  const [expertRankings, setExpertRankings] = useState<ExpertRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('매출통계 API 호출 시작:', { periodType, dateRange });
      
      const [stats, trends, rankings] = await Promise.all([
        revenueService.getRevenueStats(periodType, dateRange.start, dateRange.end),
        revenueService.getRevenueTrends(periodType, dateRange.start, dateRange.end),
        revenueService.getExpertRankings(dateRange.start, dateRange.end, 5)
      ]);
      
      console.log('매출통계 API 응답:', { stats, trends, rankings });
      
      setRevenueStats(stats);
      setRevenueTrends(trends);
      setExpertRankings(rankings);
    } catch (err) {
      console.error('매출 통계 데이터 로드 실패:', err);
      setError(`데이터를 불러오는데 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [periodType, dateRange]);


  const getCurrentPeriodData = () => {
    return revenueTrends[revenueTrends.length - 2] || revenueTrends[revenueTrends.length - 1];
  };

  const getPreviousPeriodData = () => {
    return revenueTrends[revenueTrends.length - 3] || revenueTrends[revenueTrends.length - 2];
  };

  const currentData = getCurrentPeriodData();
  const previousData = getPreviousPeriodData();

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getServiceData = () => {
    if (!revenueStats) {
      return {
        video: { count: 0, revenue: 0 },
        chat: { count: 0, revenue: 0 },
        voice: { count: 0, revenue: 0 },
        test: { count: 0, revenue: 0 }
      };
    }
    return revenueStats.serviceBreakdown;
  };

  const serviceData = getServiceData();

  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(0)}천만원`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}백만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-accent';
    if (rate < 0) return 'text-error';
    return 'text-secondary-400';
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
                <span className="mr-3 text-2xl">📊</span>
                매출 통계
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                플랫폼의 매출 현황과 트렌드를 분석할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 기간 선택 */}
              <div className="flex items-center space-x-2 bg-background-100 px-4 py-2 rounded-lg">
                {[
                  { key: 'daily', label: '일별' },
                  { key: 'weekly', label: '주별' },
                  { key: 'monthly', label: '월별' },
                  { key: 'yearly', label: '연별' }
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setPeriodType(period.key as typeof periodType)}
                    className={`px-3 py-1 rounded text-caption font-medium transition-colors ${
                      periodType === period.key
                        ? 'bg-primary text-white'
                        : 'text-secondary-600 hover:bg-background-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
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
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-secondary-500">데이터를 불러오는 중...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-error-600 mr-2">⚠️</span>
                <p className="text-error-700">{error}</p>
              </div>
            </div>
          )}
          
          {!loading && !error && revenueStats && (
            <>
              {/* 핵심 지표 대시보드 */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-caption text-secondary-400">총 매출액</p>
                      <p className="text-h2 font-bold text-secondary mt-1">{formatCurrency(revenueStats.totalRevenue)}</p>
                      <p className={`text-caption mt-1 ${currentData && previousData ? getGrowthColor(getGrowthRate(currentData.totalRevenue, previousData.totalRevenue)) : ''}`}>
                        {currentData && previousData ? 
                          `전월 대비 ${formatGrowthRate(getGrowthRate(currentData.totalRevenue, previousData.totalRevenue))}` :
                          '데이터 부족'
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
            
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-caption text-secondary-400">플랫폼 수수료</p>
                      <p className="text-h2 font-bold text-accent mt-1">{formatCurrency(revenueStats.platformFee)}</p>
                      <p className="text-caption text-secondary-500 mt-1">
                        전체 매출의 {revenueStats.feePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏦</span>
                    </div>
                  </div>
                </div>
            
                <div className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-caption text-secondary-400">전문가 수익</p>
                      <p className="text-h2 font-bold text-logo-main mt-1">{formatCurrency(revenueStats.expertRevenue)}</p>
                      <p className="text-caption text-secondary-500 mt-1">
                        평균 {expertRankings.length ? formatCurrency(revenueStats.expertRevenue / expertRankings.length) : '계산 불가'} / 전문가
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-logo-point/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-caption text-secondary-400">총 거래량</p>
                      <p className="text-h2 font-bold text-secondary mt-1">{revenueStats.transactionCount.toLocaleString()}건</p>
                      <p className="text-caption text-secondary-500 mt-1">
                        평균 {formatCurrency(revenueStats.averageTransaction)} / 건
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 매출 트렌드 차트 영역 */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-custom shadow-soft p-6">
                  <h3 className="text-h4 font-semibold text-secondary mb-4">{periodType === 'monthly' ? '월별' : periodType === 'daily' ? '일별' : periodType === 'weekly' ? '주별' : '연별'} 매출 추이</h3>
                  <div className="h-64 bg-background-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📊</span>
                      <p className="text-secondary-400">매출 트렌드 차트</p>
                      <div className="mt-4 grid grid-cols-4 gap-4 text-caption">
                        {revenueTrends.slice(-4).map((data) => (
                          <div key={data.period} className="text-center">
                            <div className="text-secondary-600">
                              {periodType === 'monthly' ? data.period.substring(5) + '월' : data.period}
                            </div>
                            <div className="font-bold text-primary mt-1">{formatCurrency(data.totalRevenue)}</div>
                            <div className={`text-xs mt-1 ${getGrowthColor(data.growthRate)}`}>
                              {formatGrowthRate(data.growthRate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-custom shadow-soft p-6">
                  <h3 className="text-h4 font-semibold text-secondary mb-4">서비스별 매출 비중</h3>
                  <div className="space-y-4">
                    {Object.entries(serviceData).map(([service, data]) => {
                      const percentage = revenueStats?.totalRevenue ? (data.revenue / revenueStats.totalRevenue) * 100 : 0;
                      const serviceLabels = {
                        video: '화상상담',
                        chat: '채팅상담', 
                        voice: '음성상담',
                        test: '심리검사'
                      };
                      
                      return (
                        <div key={service}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-caption text-secondary-600">{serviceLabels[service as keyof typeof serviceLabels]}</span>
                            <span className="text-caption font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-background-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-secondary-400 mt-1">
                            <span>{data.count}건</span>
                            <span>{formatCurrency(data.revenue)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 전문가 매출 랭킹 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-custom shadow-soft">
                  <div className="p-6 border-b border-background-200">
                    <h3 className="text-h4 font-semibold text-secondary">전문가 매출 TOP 5</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {expertRankings.map((expert, index) => (
                        <div key={expert.expertId} className="flex items-center space-x-4 p-3 hover:bg-background-50 rounded-lg transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-caption font-bold ${
                            index === 0 ? 'bg-accent' : index === 1 ? 'bg-secondary-400' : index === 2 ? 'bg-logo-main' : 'bg-background-300 text-secondary-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-body font-medium text-secondary-700">{expert.expertName}</div>
                                <div className="text-caption text-secondary-500">{expert.specialization}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-body font-bold text-primary">{formatCurrency(expert.totalRevenue)}</div>
                                <div className="text-caption text-secondary-400">{expert.transactionCount}건</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">⭐</span>
                                <span className="text-caption text-secondary-600">{expert.averageRating}</span>
                              </div>
                              <div className="text-caption text-accent">
                                수수료: {formatCurrency(expert.commission)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 주요 지표 요약 */}
                <div className="bg-white rounded-custom shadow-soft">
                  <div className="p-6 border-b border-background-200">
                    <h3 className="text-h4 font-semibold text-secondary">주요 지표 요약</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <div className="text-caption text-primary-600">월평균 매출</div>
                        <div className="text-h3 font-bold text-primary mt-1">
                          {formatCurrency(revenueStats.averageMonthlyRevenue)}
                        </div>
                      </div>
                      <div className="bg-accent-50 p-4 rounded-lg">
                        <div className="text-caption text-accent-600">건당 평균액</div>
                        <div className="text-h3 font-bold text-accent mt-1">
                          {formatCurrency(revenueStats.averageTransaction)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-error-50 p-4 rounded-lg">
                      <div className="text-caption text-error-600">총 환불액</div>
                      <div className="text-h3 font-bold text-error mt-1">
                        {formatCurrency(revenueStats.refundAmount)}
                      </div>
                      <div className="text-caption text-error-600 mt-1">
                        전체 매출의 {((revenueStats.refundAmount / revenueStats.totalRevenue) * 100).toFixed(2)}%
                      </div>
                    </div>

                    <div className="border-t border-background-200 pt-4">
                      <div className="text-caption text-secondary-600 mb-3">최근 성장률 추이</div>
                      <div className="space-y-2">
                        {revenueTrends.slice(-3).map((data) => (
                          <div key={data.period} className="flex justify-between items-center">
                            <span className="text-caption text-secondary-600">{data.period}</span>
                            <span className={`text-caption font-medium ${getGrowthColor(data.growthRate)}`}>
                              {formatGrowthRate(data.growthRate)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RevenueStatisticsPage;
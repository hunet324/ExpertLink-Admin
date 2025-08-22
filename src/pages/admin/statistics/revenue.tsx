import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface RevenueData {
  period: string;
  totalRevenue: number;
  platformFee: number;
  expertRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  serviceBreakdown: {
    video: { count: number; revenue: number };
    chat: { count: number; revenue: number };
    voice: { count: number; revenue: number };
    test: { count: number; revenue: number };
  };
  refundAmount: number;
  growthRate: number;
}

interface ExpertRanking {
  expertId: string;
  expertName: string;
  totalRevenue: number;
  transactionCount: number;
  averageRating: number;
  specialization: string;
  commission: number;
}

const RevenueStatisticsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-08-12'
  });
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'growth'>('revenue');

  // 매출 통계 샘플 데이터 (월별)
  const monthlyRevenueData: RevenueData[] = [
    {
      period: '2024-01',
      totalRevenue: 45000000,
      platformFee: 6750000,
      expertRevenue: 38250000,
      transactionCount: 850,
      averageTransaction: 52941,
      serviceBreakdown: {
        video: { count: 400, revenue: 28000000 },
        chat: { count: 250, revenue: 10000000 },
        voice: { count: 150, revenue: 5500000 },
        test: { count: 50, revenue: 1500000 }
      },
      refundAmount: 800000,
      growthRate: 0
    },
    {
      period: '2024-02',
      totalRevenue: 52000000,
      platformFee: 7800000,
      expertRevenue: 44200000,
      transactionCount: 950,
      averageTransaction: 54737,
      serviceBreakdown: {
        video: { count: 450, revenue: 32000000 },
        chat: { count: 280, revenue: 12000000 },
        voice: { count: 170, revenue: 6200000 },
        test: { count: 50, revenue: 1800000 }
      },
      refundAmount: 600000,
      growthRate: 15.6
    },
    {
      period: '2024-03',
      totalRevenue: 48000000,
      platformFee: 7200000,
      expertRevenue: 40800000,
      transactionCount: 920,
      averageTransaction: 52174,
      serviceBreakdown: {
        video: { count: 420, revenue: 29000000 },
        chat: { count: 260, revenue: 11000000 },
        voice: { count: 180, revenue: 6500000 },
        test: { count: 60, revenue: 1500000 }
      },
      refundAmount: 900000,
      growthRate: -7.7
    },
    {
      period: '2024-04',
      totalRevenue: 58000000,
      platformFee: 8700000,
      expertRevenue: 49300000,
      transactionCount: 1100,
      averageTransaction: 52727,
      serviceBreakdown: {
        video: { count: 500, revenue: 35000000 },
        chat: { count: 320, revenue: 14000000 },
        voice: { count: 200, revenue: 7000000 },
        test: { count: 80, revenue: 2000000 }
      },
      refundAmount: 750000,
      growthRate: 20.8
    },
    {
      period: '2024-05',
      totalRevenue: 62000000,
      platformFee: 9300000,
      expertRevenue: 52700000,
      transactionCount: 1200,
      averageTransaction: 51667,
      serviceBreakdown: {
        video: { count: 550, revenue: 38000000 },
        chat: { count: 350, revenue: 15000000 },
        voice: { count: 220, revenue: 7500000 },
        test: { count: 80, revenue: 1500000 }
      },
      refundAmount: 820000,
      growthRate: 6.9
    },
    {
      period: '2024-06',
      totalRevenue: 67000000,
      platformFee: 10050000,
      expertRevenue: 56950000,
      transactionCount: 1320,
      averageTransaction: 50758,
      serviceBreakdown: {
        video: { count: 600, revenue: 42000000 },
        chat: { count: 380, revenue: 16000000 },
        voice: { count: 250, revenue: 8000000 },
        test: { count: 90, revenue: 1000000 }
      },
      refundAmount: 950000,
      growthRate: 8.1
    },
    {
      period: '2024-07',
      totalRevenue: 71000000,
      platformFee: 10650000,
      expertRevenue: 60350000,
      transactionCount: 1420,
      averageTransaction: 50000,
      serviceBreakdown: {
        video: { count: 650, revenue: 45000000 },
        chat: { count: 400, revenue: 17000000 },
        voice: { count: 270, revenue: 8000000 },
        test: { count: 100, revenue: 1000000 }
      },
      refundAmount: 1100000,
      growthRate: 6.0
    },
    {
      period: '2024-08',
      totalRevenue: 35000000,
      platformFee: 5250000,
      expertRevenue: 29750000,
      transactionCount: 720,
      averageTransaction: 48611,
      serviceBreakdown: {
        video: { count: 320, revenue: 22000000 },
        chat: { count: 200, revenue: 8500000 },
        voice: { count: 140, revenue: 4000000 },
        test: { count: 60, revenue: 500000 }
      },
      refundAmount: 650000,
      growthRate: -50.7 // 8월은 아직 진행중
    }
  ];

  // 전문가 매출 랭킹
  const expertRankings: ExpertRanking[] = [
    {
      expertId: 'expert_001',
      expertName: '김상담사',
      totalRevenue: 18500000,
      transactionCount: 245,
      averageRating: 4.9,
      specialization: '우울/불안 전문',
      commission: 2775000
    },
    {
      expertId: 'expert_002',
      expertName: '이심리사',
      totalRevenue: 16200000,
      transactionCount: 210,
      averageRating: 4.8,
      specialization: '가족상담 전문',
      commission: 2430000
    },
    {
      expertId: 'expert_003',
      expertName: '박전문가',
      totalRevenue: 14800000,
      transactionCount: 198,
      averageRating: 4.7,
      specialization: '성격검사 전문',
      commission: 2220000
    },
    {
      expertId: 'expert_004',
      expertName: '최치료사',
      totalRevenue: 13900000,
      transactionCount: 180,
      averageRating: 4.8,
      specialization: '인지치료 전문',
      commission: 2085000
    },
    {
      expertId: 'expert_005',
      expertName: '정상담사',
      totalRevenue: 12600000,
      transactionCount: 165,
      averageRating: 4.6,
      specialization: '청소년 상담',
      commission: 1890000
    }
  ];

  const getCurrentPeriodData = () => {
    return monthlyRevenueData[monthlyRevenueData.length - 2]; // 7월 데이터 (완전한 달)
  };

  const getPreviousPeriodData = () => {
    return monthlyRevenueData[monthlyRevenueData.length - 3]; // 6월 데이터
  };

  const getTotalStats = () => {
    const total = monthlyRevenueData.reduce((acc, curr) => {
      return {
        totalRevenue: acc.totalRevenue + curr.totalRevenue,
        platformFee: acc.platformFee + curr.platformFee,
        expertRevenue: acc.expertRevenue + curr.expertRevenue,
        transactionCount: acc.transactionCount + curr.transactionCount,
        refundAmount: acc.refundAmount + curr.refundAmount
      };
    }, { totalRevenue: 0, platformFee: 0, expertRevenue: 0, transactionCount: 0, refundAmount: 0 });

    return {
      ...total,
      averageTransaction: total.totalRevenue / total.transactionCount,
      averageMonthlyRevenue: total.totalRevenue / monthlyRevenueData.length
    };
  };

  const currentData = getCurrentPeriodData();
  const previousData = getPreviousPeriodData();
  const totalStats = getTotalStats();

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getServiceData = () => {
    const serviceData = monthlyRevenueData.reduce((acc, curr) => {
      Object.keys(curr.serviceBreakdown).forEach(service => {
        const key = service as keyof typeof curr.serviceBreakdown;
        if (!acc[key]) {
          acc[key] = { count: 0, revenue: 0 };
        }
        acc[key].count += curr.serviceBreakdown[key].count;
        acc[key].revenue += curr.serviceBreakdown[key].revenue;
      });
      return acc;
    }, {} as RevenueData['serviceBreakdown']);

    return serviceData;
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
      <Sidebar 
        userType="super_admin" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

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
          {/* 핵심 지표 대시보드 */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-caption text-secondary-400">총 매출액</p>
                  <p className="text-h2 font-bold text-secondary mt-1">{formatCurrency(totalStats.totalRevenue)}</p>
                  <p className={`text-caption mt-1 ${getGrowthColor(currentData.growthRate)}`}>
                    전월 대비 {formatGrowthRate(getGrowthRate(currentData.totalRevenue, previousData.totalRevenue))}
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
                  <p className="text-h2 font-bold text-accent mt-1">{formatCurrency(totalStats.platformFee)}</p>
                  <p className="text-caption text-secondary-500 mt-1">
                    전체 매출의 {((totalStats.platformFee / totalStats.totalRevenue) * 100).toFixed(1)}%
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
                  <p className="text-h2 font-bold text-logo-main mt-1">{formatCurrency(totalStats.expertRevenue)}</p>
                  <p className="text-caption text-secondary-500 mt-1">
                    평균 {formatCurrency(totalStats.expertRevenue / expertRankings.length)} / 전문가
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
                  <p className="text-h2 font-bold text-secondary mt-1">{totalStats.transactionCount.toLocaleString()}건</p>
                  <p className="text-caption text-secondary-500 mt-1">
                    평균 {formatCurrency(totalStats.averageTransaction)} / 건
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* 매출 트렌드 차트 영역 (시각적 표현을 위한 플레이스홀더) */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white rounded-custom shadow-soft p-6">
              <h3 className="text-h4 font-semibold text-secondary mb-4">월별 매출 추이</h3>
              <div className="h-64 bg-background-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p className="text-secondary-400">매출 트렌드 차트</p>
                  <div className="mt-4 grid grid-cols-4 gap-4 text-caption">
                    {monthlyRevenueData.slice(-4).map((data) => (
                      <div key={data.period} className="text-center">
                        <div className="text-secondary-600">{data.period.substring(5)}월</div>
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
                  const percentage = (data.revenue / totalStats.totalRevenue) * 100;
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
                      {formatCurrency(totalStats.averageMonthlyRevenue)}
                    </div>
                  </div>
                  <div className="bg-accent-50 p-4 rounded-lg">
                    <div className="text-caption text-accent-600">건당 평균액</div>
                    <div className="text-h3 font-bold text-accent mt-1">
                      {formatCurrency(totalStats.averageTransaction)}
                    </div>
                  </div>
                </div>

                <div className="bg-error-50 p-4 rounded-lg">
                  <div className="text-caption text-error-600">총 환불액</div>
                  <div className="text-h3 font-bold text-error mt-1">
                    {formatCurrency(totalStats.refundAmount)}
                  </div>
                  <div className="text-caption text-error-600 mt-1">
                    전체 매출의 {((totalStats.refundAmount / totalStats.totalRevenue) * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="border-t border-background-200 pt-4">
                  <div className="text-caption text-secondary-600 mb-3">최근 성장률 추이</div>
                  <div className="space-y-2">
                    {monthlyRevenueData.slice(-3).map((data) => (
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
        </main>
      </div>
    </div>
  );
};

export default RevenueStatisticsPage;
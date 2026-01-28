import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { analyticsApi } from '../api/analyticsApi';
import type { AnalyticsData } from '../api/analyticsApi';

function Analytics() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('6months');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getAll(timeRange);
      console.log('📊 Analytics data received:', response);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate key metrics
  const totalRevenue = data?.donationTrends.reduce((sum, trend) => sum + trend.amount, 0) || 0;
  const totalDonations = data?.donationTrends.reduce((sum, trend) => sum + trend.count, 0) || 0;
  const avgDonation = totalDonations > 0 ? totalRevenue / totalDonations : 0;
  
  // Get max amount for chart scaling
  const maxAmount = data?.donationTrends.length 
    ? Math.max(...data.donationTrends.map(d => d.amount))
    : 1;

  // Get max total amount for top donors scaling
  const maxDonorAmount = data?.topDonors.length
    ? Math.max(...data.topDonors.map(d => d.totalAmount))
    : 1;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <h1 className="text-lg font-medium text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-900">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Data Display */}
          {!loading && data && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalDonations} donations
                  </p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Avg Donation</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(avgDonation)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Per donation</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Top Donor</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.topDonors.length > 0 
                      ? formatCurrency(data.topDonors[0].totalAmount)
                      : formatCurrency(0)
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    {data.topDonors.length > 0 ? data.topDonors[0].name : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Distribution Impact Section */}
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Distribution Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Total Clients Helped</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{data.distributionImpact.totalClients}</p>
                    <p className="text-xs text-gray-600 mt-2">Unique beneficiaries</p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Money Distributed</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.distributionImpact.moneyDistributed)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">{data.distributionImpact.clientsHelpedByMoney} clients</p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Medicine Units</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.distributionImpact.medicineDistributed.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">{data.distributionImpact.clientsHelpedByMedicine} clients</p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Equipment Items</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.distributionImpact.equipmentDistributed}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">{data.distributionImpact.clientsHelpedByEquipment} clients</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Donations Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-6">Monthly Donations Trend</h2>
                  {data.donationTrends.length > 0 ? (
                    <div className="space-y-3">
                      {data.donationTrends.map((trend) => {
                        const barWidth = maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0;
                        return (
                          <div key={`${trend.month}-${trend.year}`} className="flex items-center gap-3">
                            <div className="w-20 text-xs text-gray-600">
                              {trend.month} '{String(trend.year).slice(-2)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded h-8 relative overflow-hidden">
                                <div
                                  className="bg-gray-900 h-8 flex items-center justify-end pr-3 transition-all"
                                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                                >
                                  {barWidth > 25 && (
                                    <span className="text-white text-xs font-medium">
                                      {formatCurrency(trend.amount)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {barWidth <= 25 && (
                              <span className="text-xs text-gray-600 w-24 text-right">
                                {formatCurrency(trend.amount)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No donation data available for this period</p>
                  )}
                </div>

                {/* Top Donors */}
                <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-6">Top 5 Donors</h2>
                  {data.topDonors.length > 0 ? (
                    <div className="space-y-4">
                      {data.topDonors.slice(0, 5).map((donor, index) => {
                        const percentage = maxDonorAmount > 0 ? (donor.totalAmount / maxDonorAmount) * 100 : 0;
                        return (
                          <div key={donor.id}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold">#{index + 1}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900 block">
                                    {donor.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {donor.donationCount} donations • {donor.donorType}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(donor.totalAmount)}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded h-2 overflow-hidden">
                              <div
                                className="bg-gray-900 h-2 transition-all"
                                style={{ width: `${Math.max(percentage, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No donor data available for this period</p>
                  )}
                </div>
              </div>

              {/* Recent Activities - Full Width */}
              <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-6">Recent Activities</h2>
                {data.recentActivities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.recentActivities.map((activity, index) => (
                      <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.type === 'donation' ? 'bg-gray-900' : 'bg-gray-600'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activities</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
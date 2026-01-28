import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// Define interfaces for query results
interface DonationTrendRow extends RowDataPacket {
  month: string;
  year: number;
  amount: string | number;
  count: number;
}

interface TopDonorRow extends RowDataPacket {
  id: number;
  name: string;
  donor_type: string;
  totalAmount: string | number;
  donationCount: number;
}

interface CategoryBreakdownRow extends RowDataPacket {
  category: string;
  amount: string | number;
  count: number;
}

interface MemberGrowthRow extends RowDataPacket {
  month: string;
  year: number;
  count: number;
}

interface DistributionImpactRow extends RowDataPacket {
  totalClients: number;
  moneyDistributed: string | number;
  clientsHelpedByMoney: number;
  medicineDistributed: string | number;
  clientsHelpedByMedicine: number;
  equipmentDistributed: string | number;
  clientsHelpedByEquipment: number;
}

interface MedicalDonationsStatRow extends RowDataPacket {
  category: string;
  donationCount: number;
  totalQuantity: number;
  approvedCount: number;
  pendingCount: number;
  collectedCount: number;
}

interface RecentActivityRow extends RowDataPacket {
  type: string;
  description: string;
  activity_date: string;
}

interface DonorTypeBreakdownRow extends RowDataPacket {
  donor_type: string;
  donorCount: number;
  totalAmount: string | number;
  donationCount: number;
}

interface DistributionTrendRow extends RowDataPacket {
  month: string;
  year: number;
  assistance_type: string;
  count: number;
  moneyAmount: string | number;
  itemQuantity: number;
}

interface ClientStatRow extends RowDataPacket {
  status: string;
  count: number;
}

// Get comprehensive analytics
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Analytics endpoint hit - timeRange:', req.query.timeRange);
    
    const { timeRange = '6months' } = req.query;
    
    // Calculate date range - but make it flexible to show ALL data if needed
    let monthsBack = 6;
    let useAllData = false;
    
    switch (timeRange) {
      case '3months':
        monthsBack = 3;
        break;
      case '12months':
        monthsBack = 12;
        break;
      case 'all':
        useAllData = true;
        break;
      default:
        monthsBack = 6;
    }

    // For filtering, use a very old date if we want all data, otherwise calculate from today
    let startDateStr: string;
    if (useAllData) {
      startDateStr = '2000-01-01'; // Get all historical data
    } else {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);
      startDateStr = startDate.toISOString().split('T')[0];
    }
    
    console.log('📅 Date filter:', useAllData ? 'ALL DATA' : `From ${startDateStr}`);

    // 1. DONATION TRENDS - Get last N months of donations OR all if timeRange is 'all'
    console.log('🔍 Fetching donation trends...');
    const trendMonths = useAllData ? 120 : monthsBack; // Show up to 10 years of history if 'all'
    const [donationTrends] = await pool.execute<DonationTrendRow[]>(
      `SELECT 
        DATE_FORMAT(date, '%b') as month,
        YEAR(date) as year,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as count
      FROM donations
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY YEAR(date), MONTH(date), DATE_FORMAT(date, '%b')
      ORDER BY YEAR(date), MONTH(date)`,
      [trendMonths]
    );
    console.log('✅ Donation trends:', donationTrends.length, 'rows');

    // 2. TOP DONORS - Based on total donations (all time or filtered)
    console.log('🔍 Fetching top donors...');
    const [topDonors] = await pool.execute<TopDonorRow[]>(
      `SELECT 
        d.id,
        d.name,
        d.donor_type,
        COALESCE(SUM(don.amount), 0) as totalAmount,
        COUNT(don.id) as donationCount
      FROM donors d
      INNER JOIN donations don ON d.id = don.donor_id
      WHERE don.date >= ?
      GROUP BY d.id, d.name, d.donor_type
      ORDER BY totalAmount DESC
      LIMIT 10`,
      [startDateStr]
    );
    console.log('✅ Top donors:', topDonors.length, 'rows');

    // 3. CATEGORY BREAKDOWN - Donations by purpose
    console.log('🔍 Fetching category breakdown...');
    const [categoryBreakdown] = await pool.execute<CategoryBreakdownRow[]>(
      `SELECT 
        COALESCE(purpose, 'Uncategorized') as category,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as count
      FROM donations
      WHERE date >= ?
      GROUP BY purpose
      ORDER BY amount DESC`,
      [startDateStr]
    );
    console.log('✅ Category breakdown:', categoryBreakdown.length, 'rows');

    // Calculate percentages for category breakdown
    const totalDonationAmount = categoryBreakdown.reduce((sum, cat) => sum + parseFloat(String(cat.amount)), 0);
    const categoryBreakdownWithPercentage = categoryBreakdown.map(cat => ({
      category: cat.category,
      amount: parseFloat(String(cat.amount)),
      count: cat.count,
      percentage: totalDonationAmount > 0 
        ? Math.round((parseFloat(String(cat.amount)) / totalDonationAmount) * 100) 
        : 0
    }));

    // 4. MEMBER GROWTH - Life members joined per month
    console.log('🔍 Fetching member growth...');
    const [memberGrowth] = await pool.execute<MemberGrowthRow[]>(
      `SELECT 
        DATE_FORMAT(join_date, '%b') as month,
        YEAR(join_date) as year,
        COUNT(*) as count
      FROM life_members
      WHERE join_date >= ?
      GROUP BY YEAR(join_date), MONTH(join_date), DATE_FORMAT(join_date, '%b')
      ORDER BY YEAR(join_date), MONTH(join_date)`,
      [startDateStr]
    );
    console.log('✅ Member growth:', memberGrowth.length, 'rows');

    // Calculate cumulative member count
    let cumulative = 0;
    const [previousMembers] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM life_members WHERE join_date < ?`,
      [startDateStr]
    );
    cumulative = previousMembers[0]?.count || 0;

    const memberGrowthWithCumulative = memberGrowth.map(growth => {
      cumulative += growth.count;
      return {
        month: growth.month,
        year: growth.year,
        count: growth.count,
        cumulative
      };
    });

    // 5. DISTRIBUTION IMPACT - Real impact metrics
    console.log('🔍 Fetching distribution impact...');
    const [distributionImpact] = await pool.execute<DistributionImpactRow[]>(
      `SELECT 
        COUNT(DISTINCT client_id) as totalClients,
        COALESCE(SUM(CASE WHEN assistance_type = 'money' THEN amount ELSE 0 END), 0) as moneyDistributed,
        COUNT(DISTINCT CASE WHEN assistance_type = 'money' THEN client_id END) as clientsHelpedByMoney,
        COALESCE(SUM(CASE WHEN assistance_type = 'medicine' THEN quantity ELSE 0 END), 0) as medicineDistributed,
        COUNT(DISTINCT CASE WHEN assistance_type = 'medicine' THEN client_id END) as clientsHelpedByMedicine,
        COALESCE(SUM(CASE WHEN assistance_type = 'equipment' THEN quantity ELSE 0 END), 0) as equipmentDistributed,
        COUNT(DISTINCT CASE WHEN assistance_type = 'equipment' THEN client_id END) as clientsHelpedByEquipment
      FROM distributions
      WHERE assistance_date >= ?`,
      [startDateStr]
    );
    console.log('✅ Distribution impact fetched');

    // 6. MEDICAL DONATIONS STATS
    console.log('🔍 Fetching medical donations stats...');
    const [medicalDonationsStats] = await pool.execute<MedicalDonationsStatRow[]>(
      `SELECT 
        category,
        COUNT(*) as donationCount,
        COALESCE(SUM(quantity), 0) as totalQuantity,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approvedCount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN status = 'collected' THEN 1 END) as collectedCount
      FROM medical_donations
      WHERE donation_date >= ?
      GROUP BY category`,
      [startDateStr]
    );
    console.log('✅ Medical donations stats:', medicalDonationsStats.length, 'rows');

    // 7. RECENT ACTIVITIES - Last 10 significant activities
    console.log('🔍 Fetching recent activities...');
    const [recentActivities] = await pool.execute<RecentActivityRow[]>(
      `(SELECT 
        'donation' as type,
        CONCAT(d.name, ' donated ₹', FORMAT(don.amount, 0)) as description,
        don.date as activity_date
      FROM donations don
      INNER JOIN donors d ON don.donor_id = d.id
      ORDER BY don.date DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'member' as type,
        CONCAT(d.name, ' joined as Life Member') as description,
        lm.join_date as activity_date
      FROM life_members lm
      INNER JOIN donors d ON lm.donor_id = d.id
      ORDER BY lm.join_date DESC
      LIMIT 5)
      ORDER BY activity_date DESC
      LIMIT 10`
    );
    console.log('✅ Recent activities:', recentActivities.length, 'rows');

    // 8. DONOR TYPE BREAKDOWN
    console.log('🔍 Fetching donor type breakdown...');
    const [donorTypeBreakdown] = await pool.execute<DonorTypeBreakdownRow[]>(
      `SELECT 
        d.donor_type,
        COUNT(DISTINCT d.id) as donorCount,
        COALESCE(SUM(don.amount), 0) as totalAmount,
        COUNT(don.id) as donationCount
      FROM donors d
      LEFT JOIN donations don ON d.id = don.donor_id AND don.date >= ?
      GROUP BY d.donor_type`,
      [startDateStr]
    );
    console.log('✅ Donor type breakdown:', donorTypeBreakdown.length, 'rows');

    // 9. MONTHLY DISTRIBUTION TRENDS
    console.log('🔍 Fetching distribution trends...');
    const [distributionTrends] = await pool.execute<DistributionTrendRow[]>(
      `SELECT 
        DATE_FORMAT(assistance_date, '%b') as month,
        YEAR(assistance_date) as year,
        assistance_type,
        COUNT(*) as count,
        COALESCE(SUM(CASE WHEN assistance_type = 'money' THEN amount ELSE 0 END), 0) as moneyAmount,
        COALESCE(SUM(CASE WHEN assistance_type IN ('medicine', 'equipment') THEN quantity ELSE 0 END), 0) as itemQuantity
      FROM distributions
      WHERE assistance_date >= ?
      GROUP BY YEAR(assistance_date), MONTH(assistance_date), DATE_FORMAT(assistance_date, '%b'), assistance_type
      ORDER BY YEAR(assistance_date), MONTH(assistance_date), assistance_type`,
      [startDateStr]
    );
    console.log('✅ Distribution trends:', distributionTrends.length, 'rows');

    // 10. CLIENT STATUS BREAKDOWN
    console.log('🔍 Fetching client stats...');
    const [clientStats] = await pool.execute<ClientStatRow[]>(
      `SELECT 
        status,
        COUNT(*) as count
      FROM clients
      GROUP BY status`
    );
    console.log('✅ Client stats:', clientStats.length, 'rows');

    // Prepare response
    const analyticsData = {
      success: true,
      data: {
        donationTrends: donationTrends.map(d => ({
          month: d.month,
          year: d.year,
          amount: parseFloat(String(d.amount || 0)),
          count: d.count
        })),
        topDonors: topDonors.map(d => ({
          id: d.id,
          name: d.name,
          donorType: d.donor_type,
          totalAmount: parseFloat(String(d.totalAmount || 0)),
          donationCount: d.donationCount
        })),
        categoryBreakdown: categoryBreakdownWithPercentage,
        memberGrowth: memberGrowthWithCumulative,
        distributionImpact: {
          totalClients: distributionImpact[0]?.totalClients || 0,
          moneyDistributed: parseFloat(String(distributionImpact[0]?.moneyDistributed || 0)),
          clientsHelpedByMoney: distributionImpact[0]?.clientsHelpedByMoney || 0,
          medicineDistributed: parseInt(String(distributionImpact[0]?.medicineDistributed || 0)),
          clientsHelpedByMedicine: distributionImpact[0]?.clientsHelpedByMedicine || 0,
          equipmentDistributed: parseInt(String(distributionImpact[0]?.equipmentDistributed || 0)),
          clientsHelpedByEquipment: distributionImpact[0]?.clientsHelpedByEquipment || 0
        },
        medicalDonationsStats: medicalDonationsStats.map(m => ({
          category: m.category,
          donationCount: m.donationCount,
          totalQuantity: m.totalQuantity,
          approvedCount: m.approvedCount,
          pendingCount: m.pendingCount,
          collectedCount: m.collectedCount
        })),
        recentActivities: recentActivities.map(a => ({
          type: a.type,
          description: a.description,
          date: a.activity_date
        })),
        donorTypeBreakdown: donorTypeBreakdown.map(d => ({
          donorType: d.donor_type,
          donorCount: d.donorCount,
          totalAmount: parseFloat(String(d.totalAmount || 0)),
          donationCount: d.donationCount || 0
        })),
        distributionTrends: distributionTrends.map(d => ({
          month: d.month,
          year: d.year,
          assistanceType: d.assistance_type,
          count: d.count,
          moneyAmount: parseFloat(String(d.moneyAmount || 0)),
          itemQuantity: d.itemQuantity
        })),
        clientStats: clientStats.map(c => ({
          status: c.status,
          count: c.count
        }))
      }
    };

    console.log('✅ Analytics response prepared successfully');
    console.log('📈 Summary - Donations:', donationTrends.length, '| Donors:', topDonors.length, '| Members:', memberGrowth.length);
    
    res.json(analyticsData);
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch analytics',
      error: String(error)
    });
  }
};

// Get dashboard summary (quick overview)
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Dashboard summary endpoint hit');
    
    // Total donations
    const [totalDonations] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM donations`
    );

    // Total life members
    const [totalMembers] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM life_members`
    );

    // Total active clients
    const [totalClients] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM clients`
    );

    // Pending donations
    const [pendingDonations] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM donations WHERE status = 'Pending'`
    );

    // Medical donations pending approval
    const [pendingMedical] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM medical_donations WHERE status = 'pending'`
    );

    // Distributions this month
    const [thisMonthDistributions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(CASE WHEN assistance_type = 'money' THEN amount ELSE 0 END), 0) as moneyDistributed
      FROM distributions
      WHERE MONTH(assistance_date) = MONTH(CURRENT_DATE())
        AND YEAR(assistance_date) = YEAR(CURRENT_DATE())`
    );

    const summary = {
      success: true,
      data: {
        totalDonations: {
          amount: parseFloat(String(totalDonations[0]?.total || 0)),
          count: totalDonations[0]?.count || 0
        },
        totalMembers: totalMembers[0]?.count || 0,
        totalClients: totalClients[0]?.count || 0,
        pendingDonations: pendingDonations[0]?.count || 0,
        pendingMedicalDonations: pendingMedical[0]?.count || 0,
        thisMonthDistributions: {
          count: thisMonthDistributions[0]?.count || 0,
          moneyDistributed: parseFloat(String(thisMonthDistributions[0]?.moneyDistributed || 0))
        }
      }
    };
    
    console.log('✅ Dashboard summary:', summary.data);
    res.json(summary);
  } catch (error) {
    console.error('❌ Get dashboard summary error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: String(error)
    });
  }
};
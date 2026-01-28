import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface DonationTrendRow extends RowDataPacket {
  month: string;
  year: number;
  amount: string;
  count: number;
}

interface MemberGrowthRow extends RowDataPacket {
  month: string;
  year: number;
  count: number;
  cumulative?: number;
}

interface ClientStatsRow extends RowDataPacket {
  month: string;
  year: number;
  active: number;
  inactive: number;
  dead: number;
  total: number;
}

interface TopDonorRow extends RowDataPacket {
  id: number;
  donor_id: number;
  donor_name: string;
  donor_email: string;
  donor_type: string;
  total_amount: string;
  donation_count: number;
  last_donation_date: string;
}

interface PurposeBreakdownRow extends RowDataPacket {
  purpose: string;
  amount: string;
  count: number;
  percentage: number;
}

interface MedicalDonationTrendRow extends RowDataPacket {
  month: string;
  year: number;
  medicine_count: number;
  supplement_count: number;
  equipment_count: number;
  total_count: number;
}

interface DistributionTrendRow extends RowDataPacket {
  month: string;
  year: number;
  money_amount: string;
  medicine_count: number;
  equipment_count: number;
  total_distributions: number;
}

interface DonorTypeBreakdownRow extends RowDataPacket {
  donor_type: string;
  donor_count: number;
  total_amount: string;
  avg_donation: string;
}

interface PaymentModeBreakdownRow extends RowDataPacket {
  payment_mode: string;
  amount: string;
  count: number;
  percentage: number;
}

// For backward compatibility with old controller
interface CategoryBreakdownRow extends RowDataPacket {
  category: string;
  amount: string;
  total: string;
}

interface DistributionImpactRow extends RowDataPacket {
  totalClients: number;
  moneyDistributed: string;
  clientsHelpedByMoney: number;
  medicineDistributed: number;
  clientsHelpedByMedicine: number;
  equipmentDistributed: number;
  clientsHelpedByEquipment: number;
}

// ============= MONETARY DONATION ANALYTICS =============

export const getDonationTrends = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<DonationTrendRow[]>(
      `SELECT 
        DATE_FORMAT(date, '%b') as month,
        YEAR(date) as year,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as count
      FROM donations
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND status = 'Completed'
      GROUP BY YEAR(date), MONTH(date), DATE_FORMAT(date, '%b')
      ORDER BY YEAR(date), MONTH(date)`,
      [months]
    );
    return rows;
  } catch (error) {
    console.error('Error in getDonationTrends:', error);
    return [];
  }
};

export const getPurposeBreakdown = async () => {
  try {
    const [rows] = await pool.query<PurposeBreakdownRow[]>(
      `SELECT 
        purpose,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as count,
        ROUND((SUM(amount) / (SELECT SUM(amount) FROM donations WHERE status = 'Completed')) * 100, 2) as percentage
      FROM donations
      WHERE status = 'Completed'
      GROUP BY purpose
      ORDER BY amount DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPurposeBreakdown:', error);
    return [];
  }
};

export const getPaymentModeBreakdown = async () => {
  try {
    const [rows] = await pool.query<PaymentModeBreakdownRow[]>(
      `SELECT 
        payment_mode,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as count,
        ROUND((SUM(amount) / (SELECT SUM(amount) FROM donations WHERE status = 'Completed')) * 100, 2) as percentage
      FROM donations
      WHERE status = 'Completed'
      GROUP BY payment_mode
      ORDER BY amount DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPaymentModeBreakdown:', error);
    return [];
  }
};

// Backward compatibility - maps purpose to category
export const getCategoryBreakdown = async (): Promise<CategoryBreakdownRow[]> => {
  try {
    const [rows] = await pool.query<CategoryBreakdownRow[]>(
      `SELECT 
        purpose as category,
        COALESCE(SUM(amount), 0) as amount,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'Completed') as total
      FROM donations
      WHERE status = 'Completed'
      GROUP BY purpose
      ORDER BY amount DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getCategoryBreakdown:', error);
    return [];
  }
};

// ============= DONOR ANALYTICS =============

export const getTopDonors = async (limit: number = 10) => {
  try {
    const [rows] = await pool.query<TopDonorRow[]>(
      `SELECT 
        don.id as donor_id,
        don.id,
        don.name as donor_name,
        don.email as donor_email,
        don.donor_type,
        COALESCE(SUM(d.amount), 0) as total_amount,
        COUNT(d.id) as donation_count,
        MAX(d.date) as last_donation_date
      FROM donors don
      LEFT JOIN donations d ON don.id = d.donor_id AND d.status = 'Completed'
      WHERE don.status = 'Active'
      GROUP BY don.id, don.name, don.email, don.donor_type
      HAVING total_amount > 0
      ORDER BY total_amount DESC
      LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error('Error in getTopDonors:', error);
    return [];
  }
};

export const getDonorTypeBreakdown = async () => {
  try {
    const [rows] = await pool.query<DonorTypeBreakdownRow[]>(
      `SELECT 
        don.donor_type,
        COUNT(DISTINCT don.id) as donor_count,
        COALESCE(SUM(d.amount), 0) as total_amount,
        COALESCE(AVG(d.amount), 0) as avg_donation
      FROM donors don
      LEFT JOIN donations d ON don.id = d.donor_id AND d.status = 'Completed'
      WHERE don.status = 'Active'
      GROUP BY don.donor_type
      ORDER BY total_amount DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getDonorTypeBreakdown:', error);
    return [];
  }
};

// ============= MEMBER ANALYTICS =============

export const getMemberGrowth = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<MemberGrowthRow[]>(
      `SELECT 
        DATE_FORMAT(join_date, '%b') as month,
        YEAR(join_date) as year,
        COUNT(*) as count
      FROM life_members
      WHERE join_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY YEAR(join_date), MONTH(join_date), DATE_FORMAT(join_date, '%b')
      ORDER BY YEAR(join_date), MONTH(join_date)`,
      [months]
    );
    
    // Calculate cumulative count
    let cumulative = 0;
    return rows.map(row => {
      cumulative += row.count;
      return {
        ...row,
        cumulative
      };
    });
  } catch (error) {
    console.error('Error in getMemberGrowth:', error);
    return [];
  }
};

// ============= CLIENT ANALYTICS =============

export const getClientStats = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<ClientStatsRow[]>(
      `SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        YEAR(created_at) as year,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'Dead' THEN 1 ELSE 0 END) as dead,
        COUNT(*) as total
      FROM clients
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at), MONTH(created_at)`,
      [months]
    );
    return rows;
  } catch (error) {
    console.error('Error in getClientStats:', error);
    return [];
  }
};

export const getClientsByCity = async (limit: number = 10) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        city,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count
      FROM clients
      GROUP BY city
      ORDER BY count DESC
      LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error('Error in getClientsByCity:', error);
    return [];
  }
};

export const getClientsByState = async () => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        state,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count
      FROM clients
      GROUP BY state
      ORDER BY count DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getClientsByState:', error);
    return [];
  }
};

// ============= MEDICAL DONATION ANALYTICS =============

export const getMedicalDonationTrends = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<MedicalDonationTrendRow[]>(
      `SELECT 
        DATE_FORMAT(donation_date, '%b') as month,
        YEAR(donation_date) as year,
        SUM(CASE WHEN category = 'Medicine' THEN quantity ELSE 0 END) as medicine_count,
        SUM(CASE WHEN category = 'Supplement' THEN quantity ELSE 0 END) as supplement_count,
        SUM(CASE WHEN category = 'Equipment' THEN quantity ELSE 0 END) as equipment_count,
        SUM(quantity) as total_count
      FROM medical_donations
      WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND status IN ('approved', 'collected')
      GROUP BY YEAR(donation_date), MONTH(donation_date), DATE_FORMAT(donation_date, '%b')
      ORDER BY YEAR(donation_date), MONTH(donation_date)`,
      [months]
    );
    return rows;
  } catch (error) {
    console.error('Error in getMedicalDonationTrends:', error);
    return [];
  }
};

export const getMedicalItemsByCategory = async () => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        category,
        COUNT(*) as item_types,
        SUM(quantity) as total_quantity,
        COUNT(DISTINCT donor_id) as unique_donors
      FROM medical_donations
      WHERE status IN ('approved', 'collected')
      GROUP BY category
      ORDER BY total_quantity DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getMedicalItemsByCategory:', error);
    return [];
  }
};

export const getExpiringMedicines = async (days: number = 90) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        md.id,
        md.item_name,
        md.strength,
        md.quantity,
        md.expiry_date,
        d.name as donor_name,
        DATEDIFF(md.expiry_date, CURDATE()) as days_until_expiry
      FROM medical_donations md
      LEFT JOIN donors d ON md.donor_id = d.id
      WHERE md.category IN ('Medicine', 'Supplement')
        AND md.status IN ('approved', 'collected')
        AND md.expiry_date IS NOT NULL
        AND md.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY md.expiry_date ASC`,
      [days]
    );
    return rows;
  } catch (error) {
    console.error('Error in getExpiringMedicines:', error);
    return [];
  }
};

// ============= DISTRIBUTION ANALYTICS =============

export const getDistributionTrends = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<DistributionTrendRow[]>(
      `SELECT 
        DATE_FORMAT(assistance_date, '%b') as month,
        YEAR(assistance_date) as year,
        COALESCE(SUM(CASE WHEN assistance_type = 'money' THEN amount ELSE 0 END), 0) as money_amount,
        SUM(CASE WHEN assistance_type = 'medicine' THEN quantity ELSE 0 END) as medicine_count,
        SUM(CASE WHEN assistance_type = 'equipment' THEN quantity ELSE 0 END) as equipment_count,
        COUNT(*) as total_distributions
      FROM distributions
      WHERE assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND status = 'provided'
      GROUP BY YEAR(assistance_date), MONTH(assistance_date), DATE_FORMAT(assistance_date, '%b')
      ORDER BY YEAR(assistance_date), MONTH(assistance_date)`,
      [months]
    );
    return rows;
  } catch (error) {
    console.error('Error in getDistributionTrends:', error);
    return [];
  }
};

export const getDistributionsByType = async () => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        assistance_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        SUM(quantity) as total_quantity
      FROM distributions
      WHERE status = 'provided'
      GROUP BY assistance_type
      ORDER BY count DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getDistributionsByType:', error);
    return [];
  }
};

export const getTopBeneficiaries = async (limit: number = 10) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.id as client_id,
        c.name as client_name,
        c.city,
        c.state,
        COUNT(d.id) as assistance_count,
        COALESCE(SUM(d.amount), 0) as total_money_received,
        SUM(CASE WHEN d.assistance_type = 'medicine' THEN d.quantity ELSE 0 END) as medicine_count,
        SUM(CASE WHEN d.assistance_type = 'equipment' THEN d.quantity ELSE 0 END) as equipment_count,
        MAX(d.assistance_date) as last_assistance_date
      FROM clients c
      LEFT JOIN distributions d ON c.id = d.client_id AND d.status = 'provided'
      WHERE c.status = 'Active'
      GROUP BY c.id, c.name, c.city, c.state
      HAVING assistance_count > 0
      ORDER BY total_money_received DESC, assistance_count DESC
      LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error('Error in getTopBeneficiaries:', error);
    return [];
  }
};

export const getDistributionImpact = async (months: number = 6) => {
  try {
    // Get total unique clients helped
    const [totalClientsResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT client_id) as totalClients
       FROM distributions
       WHERE assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         AND status = 'provided'`,
      [months]
    );

    // Get money distribution stats
    const [moneyResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(amount), 0) as moneyDistributed,
         COUNT(DISTINCT client_id) as clientsHelpedByMoney
       FROM distributions
       WHERE assistance_type = 'money'
         AND assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         AND status = 'provided'`,
      [months]
    );

    // Get medicine distribution stats
    const [medicineResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(quantity), 0) as medicineDistributed,
         COUNT(DISTINCT client_id) as clientsHelpedByMedicine
       FROM distributions
       WHERE assistance_type = 'medicine'
         AND assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         AND status = 'provided'`,
      [months]
    );

    // Get equipment distribution stats
    const [equipmentResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(quantity), 0) as equipmentDistributed,
         COUNT(DISTINCT client_id) as clientsHelpedByEquipment
       FROM distributions
       WHERE assistance_type = 'equipment'
         AND assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         AND status = 'provided'`,
      [months]
    );

    return {
      totalClients: totalClientsResult[0]?.totalClients || 0,
      moneyDistributed: moneyResult[0]?.moneyDistributed || '0',
      clientsHelpedByMoney: moneyResult[0]?.clientsHelpedByMoney || 0,
      medicineDistributed: medicineResult[0]?.medicineDistributed || 0,
      clientsHelpedByMedicine: medicineResult[0]?.clientsHelpedByMedicine || 0,
      equipmentDistributed: equipmentResult[0]?.equipmentDistributed || 0,
      clientsHelpedByEquipment: equipmentResult[0]?.clientsHelpedByEquipment || 0
    };
  } catch (error) {
    console.error('Error in getDistributionImpact:', error);
    return {
      totalClients: 0,
      moneyDistributed: '0',
      clientsHelpedByMoney: 0,
      medicineDistributed: 0,
      clientsHelpedByMedicine: 0,
      equipmentDistributed: 0,
      clientsHelpedByEquipment: 0
    };
  }
};

// ============= COMPARATIVE ANALYTICS =============

export const getDonationVsDistribution = async (months: number = 6) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(month_date, '%b') as month,
        YEAR(month_date) as year,
        COALESCE(donations, 0) as donations,
        COALESCE(distributions, 0) as distributions,
        COALESCE(donations - distributions, 0) as balance
      FROM (
        SELECT DISTINCT 
          DATE_FORMAT(date, '%Y-%m-01') as month_date
        FROM donations
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        UNION
        SELECT DISTINCT 
          DATE_FORMAT(assistance_date, '%Y-%m-01') as month_date
        FROM distributions
        WHERE assistance_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      ) all_months
      LEFT JOIN (
        SELECT 
          DATE_FORMAT(date, '%Y-%m-01') as month_date,
          SUM(amount) as donations
        FROM donations
        WHERE status = 'Completed'
        GROUP BY DATE_FORMAT(date, '%Y-%m-01')
      ) d ON all_months.month_date = d.month_date
      LEFT JOIN (
        SELECT 
          DATE_FORMAT(assistance_date, '%Y-%m-01') as month_date,
          SUM(amount) as distributions
        FROM distributions
        WHERE status = 'provided' AND assistance_type = 'money'
        GROUP BY DATE_FORMAT(assistance_date, '%Y-%m-01')
      ) dist ON all_months.month_date = dist.month_date
      ORDER BY all_months.month_date`,
      [months, months]
    );
    return rows;
  } catch (error) {
    console.error('Error in getDonationVsDistribution:', error);
    return [];
  }
};

// ============= COMPREHENSIVE ANALYTICS =============

export const getAllAnalytics = async (period: string = '6months') => {
  const months = period === '3months' ? 3 : period === '12months' ? 12 : 6;
  
  console.log('📊 Fetching all analytics data...');
  
  const [
    donationTrends,
    purposeBreakdown,
    paymentModeBreakdown,
    categoryBreakdown,
    topDonors,
    donorTypeBreakdown,
    memberGrowth,
    clientStats,
    clientsByCity,
    clientsByState,
    medicalDonationTrends,
    medicalItemsByCategory,
    expiringMedicines,
    distributionTrends,
    distributionsByType,
    topBeneficiaries,
    donationVsDistribution,
    distributionImpact
  ] = await Promise.all([
    getDonationTrends(months).catch(err => {
      console.error('❌ getDonationTrends failed:', err.message);
      return [];
    }),
    getPurposeBreakdown().catch(err => {
      console.error('❌ getPurposeBreakdown failed:', err.message);
      return [];
    }),
    getPaymentModeBreakdown().catch(err => {
      console.error('❌ getPaymentModeBreakdown failed:', err.message);
      return [];
    }),
    getCategoryBreakdown().catch(err => {
      console.error('❌ getCategoryBreakdown failed:', err.message);
      return [];
    }),
    getTopDonors(10).catch(err => {
      console.error('❌ getTopDonors failed:', err.message);
      return [];
    }),
    getDonorTypeBreakdown().catch(err => {
      console.error('❌ getDonorTypeBreakdown failed:', err.message);
      return [];
    }),
    getMemberGrowth(months).catch(err => {
      console.error('❌ getMemberGrowth failed:', err.message);
      return [];
    }),
    getClientStats(months).catch(err => {
      console.error('❌ getClientStats failed:', err.message);
      return [];
    }),
    getClientsByCity(10).catch(err => {
      console.error('❌ getClientsByCity failed:', err.message);
      return [];
    }),
    getClientsByState().catch(err => {
      console.error('❌ getClientsByState failed:', err.message);
      return [];
    }),
    getMedicalDonationTrends(months).catch(err => {
      console.error('❌ getMedicalDonationTrends failed:', err.message);
      return [];
    }),
    getMedicalItemsByCategory().catch(err => {
      console.error('❌ getMedicalItemsByCategory failed:', err.message);
      return [];
    }),
    getExpiringMedicines(90).catch(err => {
      console.error('❌ getExpiringMedicines failed:', err.message);
      return [];
    }),
    getDistributionTrends(months).catch(err => {
      console.error('❌ getDistributionTrends failed:', err.message);
      return [];
    }),
    getDistributionsByType().catch(err => {
      console.error('❌ getDistributionsByType failed:', err.message);
      return [];
    }),
    getTopBeneficiaries(10).catch(err => {
      console.error('❌ getTopBeneficiaries failed:', err.message);
      return [];
    }),
    getDonationVsDistribution(months).catch(err => {
      console.error('❌ getDonationVsDistribution failed:', err.message);
      return [];
    }),
    getDistributionImpact(months).catch(err => {
      console.error('❌ getDistributionImpact failed:', err.message);
      return {
        totalClients: 0,
        moneyDistributed: '0',
        clientsHelpedByMoney: 0,
        medicineDistributed: 0,
        clientsHelpedByMedicine: 0,
        equipmentDistributed: 0,
        clientsHelpedByEquipment: 0
      };
    })
  ]);

  console.log('✅ Analytics data fetched successfully');

  // Return in both formats for backward compatibility
  return {
    // New structured format
    monetaryDonations: {
      trends: donationTrends,
      purposeBreakdown,
      paymentModeBreakdown
    },
    donors: {
      topDonors,
      typeBreakdown: donorTypeBreakdown
    },
    members: {
      growth: memberGrowth
    },
    clients: {
      stats: clientStats,
      byCity: clientsByCity,
      byState: clientsByState
    },
    medicalDonations: {
      trends: medicalDonationTrends,
      byCategory: medicalItemsByCategory,
      expiringMedicines
    },
    distributions: {
      trends: distributionTrends,
      byType: distributionsByType,
      topBeneficiaries,
      impact: distributionImpact
    },
    comparative: {
      donationVsDistribution
    },
    // Old format for backward compatibility
    donationTrends,
    memberGrowth,
    clientStats,
    topDonors,
    categoryBreakdown,
    distributionImpact
  };
};
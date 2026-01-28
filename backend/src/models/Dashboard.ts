import db from '../config/database';
import { RowDataPacket } from 'mysql2';

interface DonationStats extends RowDataPacket {
  total_amount: number;
}

interface CountStats extends RowDataPacket {
  count: number;
}

interface RecentDonation extends RowDataPacket {
  id: number;
  donor_name: string;
  donor_type: string;
  amount: number;
  date: string;
  payment_mode: string;
  purpose: string;
  status: string;
}

interface RecentMedicalDonation extends RowDataPacket {
  id: number;
  donor_name: string;
  donor_type: string;
  item_name: string;
  category: string;
  strength: string | null;
  quantity: number;
  donation_date: string;
  status: string;
}

interface RecentDistribution extends RowDataPacket {
  id: number;
  client_name: string;
  assistance_type: string;
  item_name: string | null;
  amount: number | null;
  quantity: number | null;
  unit: string | null;
  assistance_date: string;
  status: string;
}

// ============= MONETARY DONATION STATISTICS =============

export const getTotalMonetaryDonations = async (): Promise<number> => {
  const [rows] = await db.query<DonationStats[]>(
    'SELECT COALESCE(SUM(amount), 0) as total_amount FROM donations WHERE status = "Completed"'
  );
  return rows[0]?.total_amount || 0;
};

export const getCurrentMonthMonetaryDonations = async (): Promise<number> => {
  const [rows] = await db.query<DonationStats[]>(
    `SELECT COALESCE(SUM(amount), 0) as total_amount 
     FROM donations 
     WHERE status = "Completed" 
     AND MONTH(date) = MONTH(CURRENT_DATE()) 
     AND YEAR(date) = YEAR(CURRENT_DATE())`
  );
  return rows[0]?.total_amount || 0;
};

export const getLastMonthMonetaryDonations = async (): Promise<number> => {
  const [rows] = await db.query<DonationStats[]>(
    `SELECT COALESCE(SUM(amount), 0) as total_amount 
     FROM donations 
     WHERE status = "Completed" 
     AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
     AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
  );
  return rows[0]?.total_amount || 0;
};

// ============= MEDICAL DONATIONS STATISTICS =============

export const getTotalMedicalDonationsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM medical_donations'
  );
  return rows[0]?.count || 0;
};

export const getPendingMedicalDonationsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM medical_donations WHERE status = "pending"'
  );
  return rows[0]?.count || 0;
};

export const getApprovedMedicalDonationsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM medical_donations WHERE status = "approved"'
  );
  return rows[0]?.count || 0;
};

export const getTotalMedicalItemsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    `SELECT COALESCE(SUM(quantity), 0) as count 
     FROM medical_donations 
     WHERE status IN ("approved", "collected")`
  );
  return rows[0]?.count || 0;
};

// ============= LIFE MEMBERS STATISTICS =============

export const getLifeMembersCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM life_members WHERE membership_status = "Active"'
  );
  return rows[0]?.count || 0;
};

export const getCurrentMonthMembers = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    `SELECT COUNT(*) as count 
     FROM life_members 
     WHERE MONTH(join_date) = MONTH(CURRENT_DATE()) 
     AND YEAR(join_date) = YEAR(CURRENT_DATE())`
  );
  return rows[0]?.count || 0;
};

// ============= DONORS STATISTICS =============

export const getActiveDonorsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM donors WHERE status = "Active"'
  );
  return rows[0]?.count || 0;
};

export const getTotalDonorsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM donors'
  );
  return rows[0]?.count || 0;
};

// ============= CLIENTS STATISTICS =============

export const getActiveClientsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM clients WHERE status = "Active"'
  );
  return rows[0]?.count || 0;
};

export const getCurrentWeekClients = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    `SELECT COUNT(*) as count 
     FROM clients 
     WHERE status = "Active"
     AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)`
  );
  return rows[0]?.count || 0;
};

export const getCurrentMonthClients = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    `SELECT COUNT(*) as count 
     FROM clients 
     WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
     AND YEAR(created_at) = YEAR(CURRENT_DATE())`
  );
  return rows[0]?.count || 0;
};

// ============= DISTRIBUTIONS STATISTICS =============

export const getTotalDistributionsAmount = async (): Promise<number> => {
  const [rows] = await db.query<DonationStats[]>(
    `SELECT COALESCE(SUM(amount), 0) as total_amount 
     FROM distributions 
     WHERE assistance_type = "money" 
     AND status = "provided"`
  );
  return rows[0]?.total_amount || 0;
};

export const getCurrentMonthDistributions = async (): Promise<number> => {
  const [rows] = await db.query<DonationStats[]>(
    `SELECT COALESCE(SUM(amount), 0) as total_amount 
     FROM distributions 
     WHERE assistance_type = "money" 
     AND status = "provided"
     AND MONTH(assistance_date) = MONTH(CURRENT_DATE()) 
     AND YEAR(assistance_date) = YEAR(CURRENT_DATE())`
  );
  return rows[0]?.total_amount || 0;
};

export const getPendingDistributionsCount = async (): Promise<number> => {
  const [rows] = await db.query<CountStats[]>(
    'SELECT COUNT(*) as count FROM distributions WHERE status = "pending"'
  );
  return rows[0]?.count || 0;
};

// ============= RECENT ACTIVITIES =============

export const getRecentMonetaryDonations = async (limit: number = 5): Promise<RecentDonation[]> => {
  const [rows] = await db.query<RecentDonation[]>(
    `SELECT 
      d.id, 
      don.name as donor_name,
      don.donor_type,
      d.amount, 
      d.date,
      d.payment_mode,
      d.purpose,
      d.status
     FROM donations d
     INNER JOIN donors don ON d.donor_id = don.id
     WHERE d.status = "Completed"
     ORDER BY d.created_at DESC 
     LIMIT ?`,
    [limit]
  );
  return rows;
};

export const getRecentMedicalDonations = async (limit: number = 5): Promise<RecentMedicalDonation[]> => {
  const [rows] = await db.query<RecentMedicalDonation[]>(
    `SELECT 
      md.id,
      d.name as donor_name,
      d.donor_type,
      md.item_name,
      md.category,
      md.strength,
      md.quantity,
      md.donation_date,
      md.status
     FROM medical_donations md
     INNER JOIN donors d ON md.donor_id = d.id
     ORDER BY md.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

export const getRecentDistributions = async (limit: number = 5): Promise<RecentDistribution[]> => {
  const [rows] = await db.query<RecentDistribution[]>(
    `SELECT 
      dist.id,
      c.name as client_name,
      dist.assistance_type,
      dist.item_name,
      dist.amount,
      dist.quantity,
      dist.unit,
      dist.assistance_date,
      dist.status
     FROM distributions dist
     INNER JOIN clients c ON dist.client_id = c.id
     ORDER BY dist.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

// ============= COMPREHENSIVE DASHBOARD DATA =============

export interface DashboardData {
  monetaryDonations: {
    total: number;
    currentMonth: number;
    lastMonth: number;
    monthlyGrowth: number;
  };
  medicalDonations: {
    totalCount: number;
    pending: number;
    approved: number;
    totalItems: number;
  };
  members: {
    total: number;
    currentMonth: number;
  };
  donors: {
    active: number;
    total: number;
  };
  clients: {
    active: number;
    currentWeek: number;
    currentMonth: number;
  };
  distributions: {
    totalAmount: number;
    currentMonth: number;
    pendingCount: number;
  };
  recentActivities: {
    monetaryDonations: RecentDonation[];
    medicalDonations: RecentMedicalDonation[];
    distributions: RecentDistribution[];
  };
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const [
    totalMonetary,
    currentMonthMonetary,
    lastMonthMonetary,
    totalMedicalCount,
    pendingMedical,
    approvedMedical,
    totalMedicalItems,
    lifeMembersCount,
    currentMonthMembers,
    activeDonors,
    totalDonors,
    activeClients,
    currentWeekClients,
    currentMonthClients,
    totalDistAmount,
    currentMonthDist,
    pendingDist,
    recentMonetaryDonations,
    recentMedicalDonations,
    recentDistributions
  ] = await Promise.all([
    getTotalMonetaryDonations(),
    getCurrentMonthMonetaryDonations(),
    getLastMonthMonetaryDonations(),
    getTotalMedicalDonationsCount(),
    getPendingMedicalDonationsCount(),
    getApprovedMedicalDonationsCount(),
    getTotalMedicalItemsCount(),
    getLifeMembersCount(),
    getCurrentMonthMembers(),
    getActiveDonorsCount(),
    getTotalDonorsCount(),
    getActiveClientsCount(),
    getCurrentWeekClients(),
    getCurrentMonthClients(),
    getTotalDistributionsAmount(),
    getCurrentMonthDistributions(),
    getPendingDistributionsCount(),
    getRecentMonetaryDonations(5),
    getRecentMedicalDonations(5),
    getRecentDistributions(5)
  ]);

  const monthlyGrowth = lastMonthMonetary > 0 
    ? ((currentMonthMonetary - lastMonthMonetary) / lastMonthMonetary) * 100 
    : 0;

  return {
    monetaryDonations: {
      total: totalMonetary,
      currentMonth: currentMonthMonetary,
      lastMonth: lastMonthMonetary,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
    },
    medicalDonations: {
      totalCount: totalMedicalCount,
      pending: pendingMedical,
      approved: approvedMedical,
      totalItems: totalMedicalItems
    },
    members: {
      total: lifeMembersCount,
      currentMonth: currentMonthMembers
    },
    donors: {
      active: activeDonors,
      total: totalDonors
    },
    clients: {
      active: activeClients,
      currentWeek: currentWeekClients,
      currentMonth: currentMonthClients
    },
    distributions: {
      totalAmount: totalDistAmount,
      currentMonth: currentMonthDist,
      pendingCount: pendingDist
    },
    recentActivities: {
      monetaryDonations: recentMonetaryDonations,
      medicalDonations: recentMedicalDonations,
      distributions: recentDistributions
    }
  };
};
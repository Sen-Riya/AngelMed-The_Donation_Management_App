import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { donationsApi } from '../api/donationApi';
import type { Donation, CreateDonationData } from '../api/donationApi';

function Donations() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  
  // Form state
  const [formData, setFormData] = useState<CreateDonationData>({
    donor_name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    payment_mode: '',
    purpose: '',
    status: 'Completed'
  });

  // Fetch donations on component mount
  useEffect(() => {
    fetchDonations();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fetch all donations
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await donationsApi.getAll();
      setDonations(response.data); // API returns data in 'data' field, not 'donations'
    } catch (error: any) {
      console.error('Error fetching donations:', error);
      alert(error.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  // Create donation
  const handleCreateDonation = async () => {
    try {
      // Validate required fields
      const newErrors: {[key: string]: boolean} = {};
      if (!formData.donor_name) newErrors.donor_name = true;
      if (!formData.amount || formData.amount <= 0) newErrors.amount = true;
      if (!formData.payment_mode) newErrors.payment_mode = true;
      if (!formData.purpose) newErrors.purpose = true;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        alert('Please fill all required fields');
        return;
      }

      setErrors({});
      console.log('Creating donation with data:', formData);
      const response = await donationsApi.create(formData);
      console.log('Create response:', response);
      alert(response.message || 'Donation added successfully!'); // Use message from API
      handleModalClose();
      fetchDonations(); // Refresh list
    } catch (error: any) {
      console.error('Error creating donation:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to create donation');
    }
  };

  // Update donation status only
  const handleUpdateDonationStatus = async () => {
    try {
      if (!editingDonation) return;

      // Prevent changing from Completed to Pending
      if (editingDonation.status === 'Completed' && formData.status === 'Pending') {
        alert('Cannot change status from Completed to Pending');
        return;
      }

      console.log('Updating donation ID:', editingDonation.id);
      console.log('New status:', formData.status);

      // Only send status field for update
      const response = await donationsApi.update(editingDonation.id, {
        status: formData.status
      });
      
      console.log('Update response:', response);
      alert(response.message || 'Donation status updated successfully!'); // Use message from API
      handleModalClose();
      fetchDonations(); // Refresh list
    } catch (error: any) {
      console.error('Error updating donation:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update donation status');
    }
  };

  // Open edit modal (only for status change)
  const handleEditClick = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      donor_name: donation.donor_name,
      amount: donation.amount,
      date: donation.date,
      payment_mode: donation.payment_mode,
      purpose: donation.purpose,
      status: donation.status
    });
    setShowAddModal(true);
  };

  // Modal handlers
  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingDonation(null);
    setErrors({});
    setFormData({
      donor_name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      payment_mode: '',
      purpose: '',
      status: 'Completed'
    });
  };

  // Calculate stats - Only include Completed donations in total
  const totalAmount = donations
    .filter(d => d.status === 'Completed')
    .reduce((sum, donation) => sum + parseFloat(String(donation.amount)), 0);
  const completedDonations = donations.filter(d => d.status === 'Completed').length;

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || donation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Donations</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Donation
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Count</p>
              <p className="text-2xl font-semibold text-gray-900">{donations.length}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedDonations}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{donations.length - completedDonations}</p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by donor name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-900 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading donations...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Donor Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{donation.donor_name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{donation.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(donation.date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{donation.payment_mode}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{donation.purpose}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            donation.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {donation.status === 'Pending' ? (
                            <button 
                              onClick={() => handleEditClick(donation)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Update Status
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredDonations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No donations found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDonation ? 'Update Donation Status' : 'Add New Donation'}
              </h2>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {editingDonation ? (
                // EDIT MODE - Only show status dropdown and read-only details
                <>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Donor Name</p>
                      <p className="text-sm font-medium text-gray-900">{formData.donor_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{formData.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(formData.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Mode</p>
                      <p className="text-sm font-medium text-gray-900">{formData.payment_mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Purpose</p>
                      <p className="text-sm font-medium text-gray-900">{formData.purpose}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status *
                    </label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Completed' | 'Pending'})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                      disabled={editingDonation?.status === 'Completed'}
                    >
                      <option value="Pending" disabled={editingDonation?.status === 'Completed'}>Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      {editingDonation?.status === 'Completed' 
                        ? '✓ This donation is completed and cannot be changed to pending.'
                        : 'ℹ️ Only the donation status can be updated. Once marked as completed, it cannot be changed back to pending.'}
                    </p>
                  </div>
                </>
              ) : (
                // ADD MODE - Show all input fields
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={formData.donor_name}
                      onChange={(e) => {
                        setFormData({...formData, donor_name: e.target.value});
                        setErrors({...errors, donor_name: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                        errors.donor_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    />
                    {errors.donor_name && (
                      <p className="text-xs text-red-500 mt-1">Donor name is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                    <input 
                      type="number" 
                      placeholder="5000" 
                      value={formData.amount || ''}
                      onChange={(e) => {
                        setFormData({...formData, amount: parseFloat(e.target.value) || 0});
                        setErrors({...errors, amount: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                        errors.amount 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-500 mt-1">Amount is required and must be greater than 0</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                    <select 
                      value={formData.payment_mode}
                      onChange={(e) => {
                        setFormData({...formData, payment_mode: e.target.value});
                        setErrors({...errors, payment_mode: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none ${
                        errors.payment_mode 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                    {errors.payment_mode && (
                      <p className="text-xs text-red-500 mt-1">Payment mode is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                    <input 
                      type="text" 
                      placeholder="General Fund" 
                      value={formData.purpose}
                      onChange={(e) => {
                        setFormData({...formData, purpose: e.target.value});
                        setErrors({...errors, purpose: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                        errors.purpose 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    />
                    {errors.purpose && (
                      <p className="text-xs text-red-500 mt-1">Purpose is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Completed' | 'Pending'})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button 
                onClick={handleModalClose} 
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={editingDonation ? handleUpdateDonationStatus : handleCreateDonation}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                {editingDonation ? 'Update Status' : 'Add Donation'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Donations;
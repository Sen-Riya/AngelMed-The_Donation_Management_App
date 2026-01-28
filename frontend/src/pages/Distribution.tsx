import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { distributionApi } from '../api/distributionApi';
import type { Distribution as DistributionType, CreateDistribution, DistributionStats } from '../api/distributionApi';

function Distribution() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [distributions, setDistributions] = useState<DistributionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<DistributionType | null>(null);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const [stats, setStats] = useState<DistributionStats | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateDistribution>({
    client_id: 0,
    assistance_type: 'money',
    amount: undefined,
    item_name: '',
    quantity: undefined,
    unit: '',
    strength: '',
    description: '',
    assistance_date: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  // Fetch distributions on component mount
  useEffect(() => {
    fetchDistributions();
    fetchStats();
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

  // Fetch all distributions
  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await distributionApi.getAll();
      console.log('Distributions response:', response);
      console.log('Is array?', Array.isArray(response));
      console.log('Length:', response?.length);
      // Ensure response is an array
      const distributionsArray = Array.isArray(response) ? response : [];
      console.log('Setting distributions:', distributionsArray);
      setDistributions(distributionsArray);
    } catch (error: any) {
      console.error('Error fetching distributions:', error);
      console.error('Error details:', error.response?.data);
      setDistributions([]); // Set empty array on error
      alert(error.response?.data?.message || 'Failed to fetch distributions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const statsData = await distributionApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create distribution
  const handleCreateDistribution = async () => {
    try {
      // Validate required fields
      const newErrors: {[key: string]: boolean} = {};
      if (!formData.client_id || formData.client_id <= 0) newErrors.client_id = true;
      
      if (formData.assistance_type === 'money') {
        if (!formData.amount || formData.amount <= 0) newErrors.amount = true;
      } else {
        // Medicine or Equipment
        if (!formData.item_name?.trim()) newErrors.item_name = true;
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = true;
        if (!formData.unit) newErrors.unit = true;
        
        // Medicine requires strength
        if (formData.assistance_type === 'medicine' && !formData.strength?.trim()) {
          newErrors.strength = true;
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        alert('Please fill all required fields');
        return;
      }

      setErrors({});
      
      // Prepare payload - clear unnecessary fields based on type
      const payload: any = { ...formData };
      
      if (formData.assistance_type === 'money') {
        // Clear medicine/equipment fields for money
        payload.item_name = null;
        payload.quantity = null;
        payload.unit = null;
        payload.strength = null;
      } else if (formData.assistance_type === 'equipment') {
        // Clear strength for equipment (only medicine needs it)
        payload.amount = null;
        payload.strength = null;
      } else {
        // Medicine - clear amount
        payload.amount = null;
      }
      
      // Create new distribution
      console.log('Creating distribution with data:', payload);
      await distributionApi.create(payload);
      alert('Distribution added successfully!');
      
      // Close modal and refresh data
      handleModalClose();
      await fetchDistributions();
      await fetchStats();
      
      console.log('Data refreshed after save');
    } catch (error: any) {
      console.error('Error saving distribution:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save distribution');
    }
  };

  // Update distribution status only
  const handleUpdateStatus = async () => {
    try {
      if (!editingDistribution) return;

      // Ensure status is defined
      if (!formData.status) {
        alert('Please select a status');
        return;
      }

      // Prevent changing from provided to pending/cancelled
      if (editingDistribution.status === 'provided' && formData.status !== 'provided') {
        alert('Cannot change status from Provided to Pending/Cancelled');
        return;
      }

      console.log('Updating distribution ID:', editingDistribution.id);
      console.log('New status:', formData.status);

      await distributionApi.updateStatus(editingDistribution.id, formData.status);
      
      alert('Distribution status updated successfully!');
      handleModalClose();
      await fetchDistributions();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating distribution:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update distribution status');
    }
  };



  // Open edit modal
  const handleEditClick = (distribution: DistributionType) => {
    setEditingDistribution(distribution);
    setFormData({
      client_id: distribution.client_id,
      assistance_type: distribution.assistance_type,
      amount: distribution.amount,
      item_name: distribution.item_name,
      quantity: distribution.quantity,
      unit: distribution.unit,
      strength: distribution.strength,
      description: distribution.description,
      assistance_date: distribution.assistance_date,
      status: distribution.status
    });
    setShowAddModal(true);
  };

  // Modal handlers
  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingDistribution(null);
    setErrors({});
    setFormData({
      client_id: 0,
      assistance_type: 'money',
      amount: undefined,
      item_name: '',
      quantity: undefined,
      unit: '',
      strength: '',
      description: '',
      assistance_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  // Handle assistance type change
  const handleAssistanceTypeChange = (type: 'money' | 'medicine' | 'equipment') => {
    setFormData({
      ...formData,
      assistance_type: type,
      // Clear amount if not money
      amount: type === 'money' ? formData.amount : undefined,
      // Clear item fields if money
      item_name: type !== 'money' ? formData.item_name : '',
      quantity: type !== 'money' ? formData.quantity : undefined,
      unit: type !== 'money' ? formData.unit : '',
      // Clear strength if not medicine
      strength: type === 'medicine' ? formData.strength : ''
    });
    setErrors({});
  };
  
  // Check if assistance type requires strength
  const requiresStrength = (type: string) => type === 'medicine';

  // Get assistance type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'money':
        return 'bg-green-100 text-green-800';
      case 'medicine':
        return 'bg-blue-100 text-blue-800';
      case 'equipment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'provided':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format assistance value
  const formatAssistanceValue = (distribution: DistributionType) => {
    if (distribution.assistance_type === 'money') {
      return `₹${distribution.amount?.toLocaleString() || 0}`;
    } else {
      const itemName = distribution.item_name || 'Item';
      const qty = distribution.quantity || 0;
      const unit = distribution.unit || 'units';
      
      if (distribution.assistance_type === 'medicine' && distribution.strength) {
        return `${itemName} (${distribution.strength}) - ${qty} ${unit}`;
      }
      return `${itemName} - ${qty} ${unit}`;
    }
  };

  // Filter distributions
  const filteredDistributions = (distributions || []).filter(distribution => {
    const matchesSearch = 
      distribution.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distribution.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distribution.client_city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || distribution.status === filterStatus.toLowerCase();
    const matchesType = filterType === 'All' || distribution.assistance_type === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Distribution</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Distribution
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Distributions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_distributions}</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Provided</p>
                <p className="text-2xl font-semibold text-green-600">{stats.provided_count}</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending_count}</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Money Distributed</p>
                <p className="text-2xl font-semibold text-gray-900">₹{stats.total_money_distributed.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by client name, city, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-900 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="money">Money</option>
              <option value="medicine">Medicine</option>
              <option value="equipment">Equipment</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-900 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="provided">Provided</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading distributions...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredDistributions.map((distribution) => (
                      <tr key={distribution.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{distribution.client_name || 'Unknown Client'}</p>
                            {distribution.client_phone && (
                              <p className="text-xs text-gray-500">{distribution.client_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getTypeBadgeColor(distribution.assistance_type)}`}>
                            {distribution.assistance_type.charAt(0).toUpperCase() + distribution.assistance_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatAssistanceValue(distribution)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {distribution.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(distribution.assistance_date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {distribution.client_city && distribution.client_state 
                            ? `${distribution.client_city}, ${distribution.client_state}`
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeColor(distribution.status)}`}>
                            {distribution.status.charAt(0).toUpperCase() + distribution.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleEditClick(distribution)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredDistributions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">No distributions found matching your filters.</p>
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
                {editingDistribution ? 'Update Distribution Status' : 'Add New Distribution'}
              </h2>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {editingDistribution ? (
                // EDIT MODE - Show read-only details and status dropdown
                <>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Client Name</p>
                      <p className="text-sm font-medium text-gray-900">{editingDistribution.client_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assistance Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{formData.assistance_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Details</p>
                      <p className="text-sm font-medium text-gray-900">{formatAssistanceValue(editingDistribution)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(formData.assistance_date)}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm font-medium text-gray-900">{formData.description}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'provided' | 'pending' | 'cancelled'})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                      disabled={editingDistribution?.status === 'provided'}
                    >
                      <option value="pending" disabled={editingDistribution?.status === 'provided'}>Pending</option>
                      <option value="provided">Provided</option>
                      <option value="cancelled" disabled={editingDistribution?.status === 'provided'}>Cancelled</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      {editingDistribution?.status === 'provided' 
                        ? '✓ This distribution is marked as provided and cannot be changed to pending or cancelled.'
                        : 'ℹ️ Only the distribution status can be updated. Once marked as provided, it cannot be changed back.'}
                    </p>
                  </div>
                </>
              ) : (
                // ADD MODE - Show all input fields
                <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID *</label>
                <input 
                  type="number" 
                  placeholder="Enter Client ID" 
                  value={formData.client_id || ''}
                  onChange={(e) => {
                    setFormData({...formData, client_id: parseInt(e.target.value) || 0});
                    setErrors({...errors, client_id: false});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.client_id 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.client_id && (
                  <p className="text-xs text-red-500 mt-1">Client ID is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistance Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.assistance_type}
                  onChange={(e) => handleAssistanceTypeChange(e.target.value as 'money' | 'medicine' | 'equipment')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                >
                  <option value="money">Money</option>
                  <option value="medicine">Medicine</option>
                  <option value="equipment">Equipment</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.assistance_type === 'money' 
                    ? 'Financial assistance to clients' 
                    : formData.assistance_type === 'medicine'
                    ? 'Medical supplies like tablets, syrups, etc.'
                    : 'Medical equipment like wheelchairs, walkers, etc.'}
                </p>
              </div>

              {formData.assistance_type === 'money' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="5000" 
                    value={formData.amount || ''}
                    onChange={(e) => {
                      setFormData({...formData, amount: parseFloat(e.target.value) || undefined});
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
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.assistance_type === 'medicine' ? 'Medicine Name' : 'Equipment Name'} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder={formData.assistance_type === 'medicine' ? 'e.g., Paracetamol' : 'e.g., Wheelchair'} 
                      value={formData.item_name || ''}
                      onChange={(e) => {
                        setFormData({...formData, item_name: e.target.value});
                        setErrors({...errors, item_name: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                        errors.item_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    />
                    {errors.item_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {formData.assistance_type === 'medicine' ? 'Medicine' : 'Equipment'} name is required
                      </p>
                    )}
                  </div>

                  {requiresStrength(formData.assistance_type) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Strength <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g., 500mg, 10ml" 
                        value={formData.strength || ''}
                        onChange={(e) => {
                          setFormData({...formData, strength: e.target.value});
                          setErrors({...errors, strength: false});
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                          errors.strength 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-gray-900'
                        }`}
                      />
                      {errors.strength && (
                        <p className="text-xs text-red-500 mt-1">Strength is required for medicines</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Dosage strength (e.g., 500mg, 5ml, 250mg/5ml)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="10" 
                      value={formData.quantity || ''}
                      onChange={(e) => {
                        setFormData({...formData, quantity: parseInt(e.target.value) || undefined});
                        setErrors({...errors, quantity: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                        errors.quantity 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-red-500 mt-1">Quantity is required and must be greater than 0</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Number of {formData.assistance_type === 'medicine' ? 'medicines' : 'equipment items'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.unit || ''}
                      onChange={(e) => {
                        setFormData({...formData, unit: e.target.value});
                        setErrors({...errors, unit: false});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none ${
                        errors.unit 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                    >
                      <option value="">Select Unit</option>
                      {formData.assistance_type === 'medicine' ? (
                        <>
                          <option value="tablets">Tablets</option>
                          <option value="capsules">Capsules</option>
                          <option value="bottles">Bottles</option>
                          <option value="vials">Vials</option>
                          <option value="boxes">Boxes</option>
                          <option value="strips">Strips</option>
                          <option value="syringes">Syringes</option>
                        </>
                      ) : (
                        <>
                          <option value="units">Units</option>
                          <option value="pieces">Pieces</option>
                          <option value="sets">Sets</option>
                          <option value="items">Items</option>
                        </>
                      )}
                    </select>
                    {errors.unit && (
                      <p className="text-xs text-red-500 mt-1">Unit is required</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.assistance_type === 'medicine' 
                        ? 'Unit of medicine (tablets, bottles, etc.)' 
                        : 'Unit of equipment (pieces, sets, etc.)'}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  placeholder="Enter details about the assistance provided" 
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assistance Date *</label>
                <input 
                  type="date" 
                  value={formData.assistance_date}
                  onChange={(e) => setFormData({...formData, assistance_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'provided' | 'pending' | 'cancelled'})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="provided">Provided</option>
                  <option value="cancelled">Cancelled</option>
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
                onClick={editingDistribution ? handleUpdateStatus : handleCreateDistribution}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                {editingDistribution ? 'Update Status' : 'Add Distribution'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Distribution;
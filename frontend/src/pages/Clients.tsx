import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import type { Client, CreateClientData } from '../api/clientsApi';

function Clients() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form state
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    phone: '',
    age: undefined,
    status: 'Active',
    address: '',
    city: '',
    state: '',
    zip: '',
    aadhaar: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      alert(error.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validatePhone = (phone: string): boolean => /^\d{10}$/.test(phone);
  const validateAadhaar = (aadhaar: string): boolean => /^\d{12}$/.test(aadhaar);

  const validateForm = (isEditMode: boolean = false): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (formData.age === undefined || formData.age <= 0) newErrors.age = 'Age is required and must be positive';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'ZIP is required';
    
    // Only validate aadhaar for new clients
    if (!isEditMode) {
      if (!formData.aadhaar) newErrors.aadhaar = 'Aadhaar is required';
      else if (!validateAadhaar(formData.aadhaar)) newErrors.aadhaar = 'Aadhaar must be 12 digits';
    }
    
    if (!formData.notes) newErrors.notes = 'Notes are required';
    return newErrors;
  };

  const handleSaveClient = async () => {
    // Full form validation for add/edit
    const newErrors = validateForm(!!editingClient);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fix the errors before submitting');
      return;
    }

    if (editingClient && editingClient.status === 'Dead') {
      alert('Cannot modify a Dead client');
      return;
    }

    try {
      if (editingClient) {
        // Don't send aadhaar in update
        const { aadhaar, ...updateData } = formData;
        await api.put(`/clients/${editingClient.id}`, updateData);
        alert('Client updated successfully!');
      } else {
        await api.post('/clients', formData);
        alert('Client added successfully!');
      }
      handleModalClose();
      fetchClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      alert(error.response?.data?.message || 'Failed to save client');
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setErrors({});
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingClient(null);
    setErrors({});
    setFormData({
      name: '',
      phone: '',
      age: undefined,
      status: 'Active',
      address: '',
      city: '',
      state: '',
      zip: '',
      aadhaar: '',
      notes: ''
    });
  };

  // Stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
  const deadClients = clients.filter(c => c.status === 'Dead').length;

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Clients</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all"
          >
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{totalClients}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{activeClients}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">{inactiveClients}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Dead</p>
              <p className="text-2xl font-semibold text-gray-900">{deadClients}</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          {/* Loading / Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading clients...</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Aadhaar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">#{client.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.age || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.city || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {client.aadhaar ? `****${client.aadhaar.slice(-4)}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          client.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'Inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {client.status !== 'Dead' ? (
                          <button 
                            onClick={() => handleEditClick(client)} 
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit Details
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Dead</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No clients found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingClient ? 'Edit Client Details' : 'Add New Client'}
              </h2>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: digitsOnly.slice(0,10) });
                    if (!digitsOnly || digitsOnly.length !== 10) {
                      setErrors((prev) => ({ ...prev, phone: 'Phone must be exactly 10 digits' }));
                    } else {
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholder="9876543210"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.age ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.state ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>

              {/* ZIP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.zip ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
              </div>

              {/* Aadhaar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar {!editingClient && '*'}
                </label>
                <input
                  type="text"
                  value={formData.aadhaar}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, aadhaar: digitsOnly.slice(0,12) });
                    if (!digitsOnly || digitsOnly.length !== 12) {
                      setErrors((prev) => ({ ...prev, aadhaar: 'Aadhaar must be exactly 12 digits' }));
                    } else {
                      setErrors((prev) => ({ ...prev, aadhaar: '' }));
                    }
                  }}
                  placeholder="123456789012"
                  disabled={!!editingClient}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    editingClient 
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200'
                      : errors.aadhaar 
                        ? 'border-red-500 focus:border-red-500 focus:outline-none'
                        : 'border-gray-200 focus:border-gray-900 focus:outline-none'
                  }`}
                />
                {editingClient && <p className="text-xs text-gray-500 mt-1">Aadhaar cannot be changed</p>}
                {errors.aadhaar && !editingClient && <p className="text-xs text-red-500 mt-1">{errors.aadhaar}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes *</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    errors.notes ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' | 'Dead' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gray-900 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Dead">Dead</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={handleModalClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleSaveClient} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
                {editingClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
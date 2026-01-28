import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { membersApi } from '../api/membersApi';
import type { Member, CreateMemberData, UpdateMemberData } from '../api/membersApi';

function LifeMembers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateMemberData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    aadhar_number: '',
    join_date: new Date().toISOString().split('T')[0],
    join_time: new Date().toTimeString().slice(0, 5)
  });

  const [errors, setErrors] = useState({
    phone: '',
    aadhar: '',
    email: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await membersApi.getAll();
      setMembers(response.members);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

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

  // Validations
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
  const validateAadhar = (aadhar: string) => /^\d{12}$/.test(aadhar);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, phone: digitsOnly });
    setErrors({ ...errors, phone: digitsOnly && !validatePhone(digitsOnly) ? 'Phone must be 10 digits' : '' });
  };

  const handleAadharChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setFormData({ ...formData, aadhar_number: digitsOnly });
    setErrors({ ...errors, aadhar: digitsOnly && !validateAadhar(digitsOnly) ? 'Aadhar must be 12 digits' : '' });
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    setErrors({ ...errors, email: value && !validateEmail(value) ? 'Invalid email format' : '' });
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.email || !formData.join_date) {
      alert('Name, Email, and Join Date are required');
      return;
    }

    if (errors.phone || errors.email || errors.aadhar) {
      alert('Please fix validation errors');
      return;
    }

    try {
      const response = await membersApi.create(formData);
      alert(response.message || 'Member added successfully!');
      handleModalClose();
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    if (errors.phone || errors.email) {
      alert('Please fix validation errors');
      return;
    }

    const updateData: UpdateMemberData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      membership_status: editingMember.membership_status
    };

    try {
      const response = await membersApi.update(editingMember.id, updateData);
      alert(response.message || 'Member updated successfully!');
      handleModalClose();
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update member');
    }
  };

  const handleStatusToggle = async (member: Member) => {
    const newStatus = member.membership_status === 'Active' ? 'Inactive' : 'Active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'Inactive' ? 'deactivate' : 'activate'} this member?`)) {
      return;
    }

    try {
      if (newStatus === 'Inactive') {
        await membersApi.deactivate(member.id);
      } else {
        await membersApi.update(member.id, { membership_status: 'Active' });
      }
      alert(`Member ${newStatus === 'Inactive' ? 'deactivated' : 'activated'} successfully!`);
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update member status');
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      aadhar_number: member.aadhar_number || '',
      join_date: member.join_date,
      join_time: member.join_time || ''
    });
    setErrors({ phone: '', aadhar: '', email: '' });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      aadhar_number: '',
      join_date: new Date().toISOString().split('T')[0],
      join_time: new Date().toTimeString().slice(0, 5)
    });
    setErrors({ phone: '', aadhar: '', email: '' });
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || member.membership_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeMembers = members.filter(m => m.membership_status === 'Active').length;
  const inactiveMembers = members.filter(m => m.membership_status === 'Inactive').length;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Life Members</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{activeMembers}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Inactive Members</p>
              <p className="text-2xl font-semibold text-gray-900">{inactiveMembers}</p>
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
                placeholder="Search by name or email..."
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
            </select>
          </div>

          {/* Members Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading members...</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Aadhar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.address || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {member.aadhar_number ? `****${member.aadhar_number.slice(-4)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(member.join_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          member.membership_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(member)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleStatusToggle(member)}
                            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                          >
                            {member.membership_status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        No members found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingMember ? 'Edit Member' : 'Add Member'}
              </h2>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (10 digits)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm ${
                    errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number {!editingMember && '*'}
                </label>
                <input
                  type="text"
                  value={formData.aadhar_number}
                  onChange={(e) => handleAadharChange(e.target.value)}
                  maxLength={12}
                  disabled={!!editingMember}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    editingMember 
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200' 
                      : errors.aadhar 
                        ? 'border-red-500 focus:outline-none' 
                        : 'border-gray-200 focus:border-gray-900 focus:outline-none'
                  }`}
                />
                {errors.aadhar && !editingMember && <p className="text-xs text-red-500 mt-1">{errors.aadhar}</p>}
                {editingMember && (
                  <p className="text-xs text-gray-500 mt-1">Aadhar number cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
                <input
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  disabled={!!editingMember}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${
                    editingMember ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'focus:outline-none focus:border-gray-900'
                  }`}
                />
                {editingMember && (
                  <p className="text-xs text-gray-500 mt-1">Join date cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Time</label>
                <input
                  type="time"
                  value={formData.join_time}
                  onChange={(e) => setFormData({ ...formData, join_time: e.target.value })}
                  disabled={!!editingMember}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${
                    editingMember ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'focus:outline-none focus:border-gray-900'
                  }`}
                />
                {editingMember && (
                  <p className="text-xs text-gray-500 mt-1">Join time cannot be changed</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={handleModalClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                Cancel
              </button>
              <button
                onClick={editingMember ? handleUpdateMember : handleAddMember}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LifeMembers;
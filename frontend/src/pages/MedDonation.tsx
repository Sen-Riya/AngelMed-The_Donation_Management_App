import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { medDonationApi } from '../api/medDonationApi';
import type {
  MedicalDonation,
  CreateMedicalDonation,
  MedicalDonationCategory
} from '../api/medDonationApi';

function MedDonation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [donations, setDonations] = useState<MedicalDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<MedicalDonation | null>(null);
  const [donorName, setDonorName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const [formData, setFormData] = useState<CreateMedicalDonation>({
    donor_id: 0,
    item_name: '',
    category: 'Medicine',
    strength: '',
    quantity: 0,
    expiry_date: '',
    status: 'pending',
  });

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    fetchMedicalDonations();
  }, []);

  const fetchMedicalDonations = async () => {
    try {
      setLoading(true);
      const res = await medDonationApi.getAll();
      setDonations(res);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch medical donations');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Helpers ---------------- */
  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('en-GB') : '—';

  // Check if category requires strength/expiry
  const requiresStrength = (category: MedicalDonationCategory) => 
    category === 'Medicine' || category === 'Supplement';

  /* ---------------- Stats Calculations ---------------- */
  const totalDonations = donations.length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const approvedDonations = donations.filter(d => d.status === 'approved').length;
  const collectedDonations = donations.filter(d => d.status === 'collected').length;
  const totalQuantity = donations.reduce((sum, d) => sum + d.quantity, 0);

  /* ---------------- Filter Donations ---------------- */
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || donation.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || donation.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  /* ---------------- Modal ---------------- */
  const closeModal = () => {
    setShowModal(false);
    setEditingDonation(null);
    setDonorName('');
    setFormData({
      donor_id: 0,
      item_name: '',
      category: 'Medicine',
      strength: '',
      quantity: 0,
      expiry_date: '',
      status: 'pending',
    });
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    // Validation
    if (!formData.item_name || !formData.quantity) {
      alert('Please fill required fields: Item Name and Quantity');
      return;
    }

    // Check if strength is required for Medicine/Supplement
    if (requiresStrength(formData.category) && !formData.strength?.trim()) {
      alert('Strength is required for Medicine and Supplement');
      return;
    }

    try {
      if (editingDonation) {
        await medDonationApi.update(editingDonation.id, {
          status: formData.status,
        });
      } else {
        // Check if donor_name is provided for new donations
        if (!donorName.trim()) {
          alert('Please enter donor name');
          return;
        }

        // Prepare payload - clear strength and expiry_date for Equipment
        const payload: any = {
          ...formData,
          donor_name: donorName,
        };

        // Clear strength and expiry_date for Equipment category
        if (formData.category === 'Equipment') {
          payload.strength = null;
          payload.expiry_date = null;
        }

        await medDonationApi.create(payload);
      }

      closeModal();
      fetchMedicalDonations();
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    }
  };

  const openEdit = (d: MedicalDonation) => {
    setEditingDonation(d);
    setFormData({
      donor_id: d.donor_id,
      item_name: d.item_name,
      category: d.category as MedicalDonationCategory,
      strength: d.strength ?? '',
      quantity: d.quantity,
      expiry_date: d.expiry_date ?? '',
      status: d.status,
    });
    setShowModal(true);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Medical Donations</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Medical Donation
          </button>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDonations}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Quantity</p>
              <p className="text-2xl font-semibold text-gray-900">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingDonations}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{approvedDonations}</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Collected</p>
              <p className="text-2xl font-semibold text-gray-900">{collectedDonations}</p>
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
                placeholder="Search by donor name or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-900 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Medicine">Medicine</option>
              <option value="Supplement">Supplement</option>
              <option value="Equipment">Equipment</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-900 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="collected">Collected</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading medical donations...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Strength</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {d.donor_name ?? `Donor #${d.donor_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{d.item_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            d.category === 'Medicine' ? 'bg-blue-100 text-blue-800' :
                            d.category === 'Supplement' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {d.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {d.category !== 'Equipment' ? (d.strength || '—') : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{d.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {d.category !== 'Equipment' ? formatDate(d.expiry_date) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            d.status === 'approved' ? 'bg-green-100 text-green-800' :
                            d.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                            d.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openEdit(d)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {filteredDonations.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="text-sm">No medical donations found matching your filters.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">
              {editingDonation ? 'Update Status' : 'Add Medical Donation'}
            </h2>

            {!editingDonation && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Donor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter donor name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Same donor can donate both money and medicine
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={formData.item_name}
                    onChange={(e) =>
                      setFormData({ ...formData, item_name: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCategory = e.target.value as MedicalDonationCategory;
                      setFormData({
                        ...formData,
                        category: newCategory,
                        strength: newCategory === 'Equipment' ? '' : formData.strength,
                        expiry_date: newCategory === 'Equipment' ? '' : formData.expiry_date,
                      });
                    }}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                {requiresStrength(formData.category) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Strength <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg, 10ml"
                      value={formData.strength || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, strength: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required for Medicine and Supplement
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Number(e.target.value) })
                    }
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {requiresStrength(formData.category) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, expiry_date: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only applicable for Medicine and Supplement
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="collected">Collected</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition"
              >
                {editingDonation ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedDonation;
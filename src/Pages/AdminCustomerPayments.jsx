import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function AdminPaymentForm() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: '',
    payment_date: '',
    payment_time: '',
    payment_method: '',
    amount: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('month');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;
  const token = localStorage.getItem('auth_token');

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`/admin-payments?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      toast.error('Failed to load payments');
    }
  };

  useEffect(() => {
    fetchPayments();
    setCurrentPage(1);
  }, [filter]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/admin-payments', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Payment added');
      fetchPayments();
      setFormData({
        customer_name: '',
        customer_type: '',
        payment_date: '',
        payment_time: '',
        payment_method: '',
        amount: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = payments.filter(p =>
    customerTypeFilter ? p.customer_type === customerTypeFilter : true
  );

  const totalAmount = filtered.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / paymentsPerPage);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isNaN(date)) return isoDate;
    return `${date.getDate().toString().padStart(2, '0')}/${
      (date.getMonth() + 1).toString().padStart(2, '0')
    }/${date.getFullYear()}`;
  };

  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.info('No data to export');
      return;
    }

    const headers = ['Customer', 'Type', 'Date', 'Time', 'Method', 'Amount'];
    const rows = filtered.map(p => [
      `"${p.customer_name}"`,
      `"${p.customer_type}"`,
      `"${formatDate(p.payment_date)}"`,
      `"${p.payment_time}"`,
      `"${p.payment_method}"`,
      `"Rs. ${parseFloat(p.amount).toFixed(2)}"`
    ]);

    const csvContent =
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `payments_${filter}_${customerTypeFilter || 'all'}.csv`);
  };

  const chartData = Object.entries(
    filtered.reduce((acc, p) => {
      const method = p.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + parseFloat(p.amount || 0);
      return acc;
    }, {})
  ).map(([method, total]) => ({ method, total: parseFloat(total.toFixed(2)) }));

  const customerTypeChartData = Object.entries(
    filtered.reduce((acc, p) => {
      const type = p.customer_type || 'Unknown';
      acc[type] = (acc[type] || 0) + parseFloat(p.amount || 0);
      return acc;
    }, {})
  ).map(([type, total]) => ({ type, total: parseFloat(total.toFixed(2)) }));

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Payments</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Export CSV
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              + Add Payment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mr-2 text-gray-300">Date Filter:</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-black border border-white/30 text-white px-3 py-1 rounded"
              >
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
              </select>
            </div>

            <div>
              <label className="mr-2 text-gray-300">Customer Type:</label>
              <select
                value={customerTypeFilter}
                onChange={e => setCustomerTypeFilter(e.target.value)}
                className="bg-black border border-white/30 text-white px-3 py-1 rounded"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="walk-in">Walk-in</option>
              </select>
            </div>

            <div className="text-sm text-green-400 font-medium ml-1">
              Total: <span className="text-white">Rs. {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Chart */}
        <div className="bg-white rounded-lg p-4 mb-6 text-black">
          <h2 className="text-lg font-semibold mb-2">Payments by Method</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip formatter={(value) => `Rs. ${value}`} />
              <Legend />
              <Bar dataKey="total" fill="#10B981" name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Type Chart */}
        <div className="bg-white rounded-lg p-4 mb-6 text-black">
          <h2 className="text-lg font-semibold mb-2">Payments by Customer Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customerTypeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value) => `Rs. ${value}`} />
              <Legend />
              <Bar dataKey="total" fill="#3B82F6" name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-white/20 rounded-lg">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((p, index) => (
                  <tr key={index} className="border-t border-white/10">
                    <td className="px-4 py-2">{p.customer_name}</td>
                    <td className="px-4 py-2">{p.customer_type}</td>
                    <td className="px-4 py-2">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-2">{p.payment_time}</td>
                    <td className="px-4 py-2">{p.payment_method}</td>
                    <td className="px-4 py-2">Rs. {parseFloat(p.amount).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center px-4 py-4 text-gray-400">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Customer Name"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <select
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Type --</option>
                <option value="online">Online</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="walk-in">Walk-in</option>
              </select>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="time"
                name="payment_time"
                value={formData.payment_time}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Method --</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white ${
                    isSubmitting ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
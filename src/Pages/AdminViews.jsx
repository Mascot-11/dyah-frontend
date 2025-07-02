import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

// Helper to parse location JSON string from backend
function parseLocation(locationStr, ip) {
  if (!locationStr) return ip || "N/A"
  try {
    const loc = JSON.parse(locationStr)
    if (loc.city && loc.country) return `${loc.city}, ${loc.country}`
    if (loc.region && loc.country) return `${loc.region}, ${loc.country}`
    if (loc.bogon) return `Bogon IP (private/local) ${loc.ip || ""}`.trim()
    return loc.ip || ip || "N/A"
  } catch {
    return ip || "N/A"
  }
}

// Simplified user agent parser for browser + OS
function parseUserAgent(ua) {
  if (!ua) return "Unknown browser"

  let browser = "Unknown browser"
  if (/chrome/i.test(ua)) browser = "Chrome"
  else if (/firefox/i.test(ua)) browser = "Firefox"
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari"
  else if (/edge/i.test(ua)) browser = "Edge"
  else if (/opera|opr/i.test(ua)) browser = "Opera"
  else if (/msie|trident/i.test(ua)) browser = "Internet Explorer"

  let os = "Unknown OS"
  if (/windows nt 10/i.test(ua)) os = "Windows 10"
  else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1"
  else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7"
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS"
  else if (/android/i.test(ua)) os = "Android"
  else if (/iphone|ipad/i.test(ua)) os = "iOS"
  else if (/linux/i.test(ua)) os = "Linux"

  return `${browser} on ${os}`
}

// Aggregate browser counts for PieChart from user agents list
function getBrowserDistribution(views) {
  const counts = {}
  for (const view of views) {
    const browser = parseUserAgent(view.user_agent).split(" on ")[0] // only browser part
    counts[browser] = (counts[browser] || 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// Generate cumulative data from dailyData
function getCumulativeData(dailyData) {
  let total = 0
  return dailyData.map(d => {
    total += d.views
    return { date: d.date, cumulativeViews: total }
  })
}

// Color palette for pie slices
const PIE_COLORS = ['#4F46E5', '#EF4444', '#16A34A', '#F59E0B', '#8B5CF6', '#10B981', '#E11D48']

function AdminSiteViews() {
  const [views, setViews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dailyData, setDailyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [topPathsData, setTopPathsData] = useState([])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPath, setSelectedPath] = useState("")

  const [allPaths, setAllPaths] = useState([])

  const token = localStorage.getItem('auth_token')

  const filterPath = path => !path.startsWith("/admin") && !path.startsWith("/cart")

  // Fetch detailed views with pagination and filtering
  useEffect(() => {
    setLoading(true)
    axios.get(`/all-views?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { startDate, endDate, path: selectedPath }
    })
      .then(res => {
        const filteredViews = res.data.data.filter(v => filterPath(v.path))
        setViews(filteredViews)
        setTotalPages(res.data.last_page)
        if (allPaths.length === 0) {
          const paths = [...new Set(res.data.data.map(v => v.path).filter(filterPath))].sort()
          setAllPaths(paths)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, startDate, endDate, selectedPath])

  // Fetch analytics data for charts
  useEffect(() => {
    const params = { startDate, endDate, path: selectedPath }
    const config = { headers: { Authorization: `Bearer ${token}` }, params }

    axios.get('/views-analytics/daily', config)
      .then(res => setDailyData(res.data))
      .catch(console.error)

    axios.get('/views-analytics/monthly', config)
      .then(res => setMonthlyData(res.data))
      .catch(console.error)

    axios.get('/views-analytics/top-paths', config)
      .then(res => {
        const filteredTopPaths = res.data.filter(item => filterPath(item.path))
        setTopPathsData(filteredTopPaths)
      })
      .catch(console.error)
  }, [startDate, endDate, selectedPath])

  // Compute browser distribution from current views (memoized for performance)
  const browserDist = useMemo(() => getBrowserDistribution(views), [views])

  // Compute cumulative data for area chart
  const cumulativeData = useMemo(() => getCumulativeData(dailyData), [dailyData])

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading data, please wait...</p>

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans space-y-12 bg-gray-50 rounded-lg shadow-lg">

      <h2 className="text-4xl font-bold text-center text-indigo-700 mb-6">
        Website Views Dashboard
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 justify-center items-end bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium text-gray-700 mb-1" htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-indigo-500"
            max={endDate || undefined}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1" htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-indigo-500"
            min={startDate || undefined}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1" htmlFor="pathFilter">Filter by Page</label>
          <select
            id="pathFilter"
            value={selectedPath}
            onChange={e => setSelectedPath(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 min-w-[220px] focus:outline-indigo-500"
          >
            <option value="">All Pages</option>
            {allPaths.map(path => (
              <option key={path} value={path}>{path}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setPage(1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded transition"
          title="Apply the selected filters"
        >
          Apply Filters
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Daily Views Line Chart */}
        <section className="bg-white p-5 rounded shadow">
          <h3 className="text-2xl font-semibold text-indigo-600 mb-2">Daily Views</h3>
          <p className="text-gray-600 mb-4 text-sm">Visitors per day.</p>
          {dailyData.length === 0 ? (
            <p className="text-center text-gray-500">No data for selected filters.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Monthly Views Line Chart */}
        <section className="bg-white p-5 rounded shadow">
          <h3 className="text-2xl font-semibold text-green-600 mb-2">Monthly Views</h3>
          <p className="text-gray-600 mb-4 text-sm">Summary by month.</p>
          {monthlyData.length === 0 ? (
            <p className="text-center text-gray-500">No data for selected filters.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#16A34A" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Top Visited Pages Bar Chart */}
        <section className="bg-white p-5 rounded shadow">
          <h3 className="text-2xl font-semibold text-red-600 mb-2">Top Visited Pages</h3>
          <p className="text-gray-600 mb-4 text-sm">Most popular pages.</p>
          {topPathsData.length === 0 ? (
            <p className="text-center text-gray-500">No data for selected filters.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topPathsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Browser Usage Pie Chart */}
        <section className="bg-white p-5 rounded shadow md:col-span-2">
          <h3 className="text-2xl font-semibold text-purple-600 mb-2">Browser Usage</h3>
          <p className="text-gray-600 mb-4 text-sm">Distribution of browsers visitors use.</p>
          {browserDist.length === 0 ? (
            <p className="text-center text-gray-500">No browser data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={browserDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {browserDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} views`, "Views"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Cumulative Views Area Chart */}
        <section className="bg-white p-5 rounded shadow md:col-span-1">
          <h3 className="text-2xl font-semibold text-teal-600 mb-2">Cumulative Views</h3>
          <p className="text-gray-600 mb-4 text-sm">Total views over time.</p>
          {cumulativeData.length === 0 ? (
            <p className="text-center text-gray-500">No data for selected filters.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={cumulativeData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulativeViews"
                  stroke="#14B8A6"
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* Detailed Visitors Table */}
      <section className="bg-white rounded shadow p-6">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-700">
          Recent Visitors (Page {page} of {totalPages})
        </h3>

        {views.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No visitor data found for the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700 border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Visitor IP</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Browser & OS</th>
                  <th className="px-3 py-2 font-medium">Page Visited</th>
                  <th className="px-3 py-2 font-medium">Viewed On</th>
                </tr>
              </thead>
              <tbody>
                {views.map((view, index) => (
                  <tr
                    key={view.id}
                    className="bg-white rounded shadow-sm hover:bg-indigo-50 transition"
                  >
                    <td className="px-3 py-2 align-middle">{(page - 1) * 10 + index + 1}</td>
                    <td className="px-3 py-2 font-mono">{view.ip_address}</td>
                    <td
                      className="px-3 py-2 max-w-xs truncate"
                      title={parseLocation(view.location, view.ip_address)}
                    >
                      {parseLocation(view.location, view.ip_address)}
</td>
<td className="px-3 py-2">{parseUserAgent(view.user_agent)}</td>
<td className="px-3 py-2">{view.path}</td>
<td className="px-3 py-2">{new Date(view.created_at).toLocaleString()}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
    <div className="flex justify-center mt-4 space-x-2">
      <button
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        disabled={page <= 1}
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
      >
        Previous
      </button>
      <button
        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
        disabled={page >= totalPages}
        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
      >
        Next
      </button>
    </div>
  </section>
</div>
)
}

export default AdminSiteViews

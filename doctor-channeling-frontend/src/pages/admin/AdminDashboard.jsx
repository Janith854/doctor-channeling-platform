import { useState, useEffect } from 'react';
import { userApi } from '../../api/authApi';
import { doctorApi, hospitalApi, specializationApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import {
  Users,
  Stethoscope,
  Building2,
  Layers,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    doctors: 0,
    hospitals: 0,
    specializations: 0,
    appointments: 148,
    revenue: 4250.00,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [uRes, dRes, hRes, sRes] = await Promise.allSettled([
          userApi.getAllUsers(),
          doctorApi.getAll(),
          hospitalApi.getAll(),
          specializationApi.getAll(),
        ]);

        setCounts((prev) => ({
          ...prev,
          users: uRes.status === 'fulfilled' ? uRes.value.data?.data?.length || 0 : 0,
          doctors: dRes.status === 'fulfilled' ? dRes.value.data?.data?.length || 0 : 0,
          hospitals: hRes.status === 'fulfilled' ? hRes.value.data?.data?.length || 0 : 0,
          specializations: sRes.status === 'fulfilled' ? sRes.value.data?.data?.length || 0 : 0,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const appointmentTrend = [
    { name: 'Mon', count: 18, revenue: 450 },
    { name: 'Tue', count: 24, revenue: 600 },
    { name: 'Wed', count: 32, revenue: 800 },
    { name: 'Thu', count: 28, revenue: 700 },
    { name: 'Fri', count: 36, revenue: 900 },
    { name: 'Sat', count: 42, revenue: 1100 },
    { name: 'Sun', count: 20, revenue: 500 },
  ];

  if (loading) return <Loader text="Loading administrative insights..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Admin Control Center</h1>
          <p className="text-sm text-navy-500 mt-1">Platform analytics, doctor channelings, and resource oversight</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Total Users</span>
              <h3 className="text-xl font-extrabold text-navy-900">{counts.users}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Doctors</span>
              <h3 className="text-xl font-extrabold text-navy-900">{counts.doctors}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-50 text-accent-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Hospitals</span>
              <h3 className="text-xl font-extrabold text-navy-900">{counts.hospitals}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Specialties</span>
              <h3 className="text-xl font-extrabold text-navy-900">{counts.specializations}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning-50 text-warning-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Bookings</span>
              <h3 className="text-xl font-extrabold text-navy-900">{counts.appointments}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase">Revenue</span>
              <h3 className="text-xl font-extrabold text-navy-900">${counts.revenue.toFixed(0)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-navy-100 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-600" /> Channeling Appointments Trend
              </h3>
              <p className="text-xs text-navy-400">Weekly appointment volume</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#0891b2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-600" /> Revenue & Channeling Fees
              </h3>
              <p className="text-xs text-navy-400">Total processed revenue in USD ($)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

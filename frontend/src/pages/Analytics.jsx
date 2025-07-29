import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Briefcase, Users, ClipboardCheck, AlertTriangle } from 'lucide-react';

// --- START: Reusable Components ---

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

const StatCard = ({ title, value, icon }) => (
  <Card className="stat-card">
    <div className="stat-inner">
      <div className="stat-icon">{icon}</div>
      <div className="stat-text">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  </Card>
);

// --- END: Reusable Components ---

const COLORS = ['#FFBB28', '#0088FE', '#00C49F'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalCases: 0, totalClients: 0, openTasks: 0, overdueTasks: 0 });
  const [chartData, setChartData] = useState({ monthlyCaseData: [], caseStatusData: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, chartsRes] = await Promise.all([
          axios.get('/api/reports/summary', { withCredentials: true }),
          axios.get('/api/reports/charts', { withCredentials: true })
        ]);
        setStats(summaryRes.data);
        setChartData(chartsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatSkeleton = () => <div className="skeleton stat-skeleton" />;
  const ChartSkeleton = () => <div className="skeleton chart-skeleton" />;

  if (error) return <div className="error-msg">Error: {error}</div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Overview</h1>
        <p className="analytics-subtitle">Visual insights into your firm's performance.</p>
      </div>

      <div className="stats-grid">
        {loading ? (
          <>
            <StatSkeleton /> <StatSkeleton /> <StatSkeleton /> <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Total Cases" value={stats.totalCases} icon={<Briefcase size={24} />} />
            <StatCard title="Total Clients" value={stats.totalClients} icon={<Users size={24} />} />
            <StatCard title="Open Tasks" value={stats.openTasks} icon={<ClipboardCheck size={24} />} />
            <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon={<AlertTriangle size={24} />} />
          </>
        )}
      </div>

      <div className="charts-grid">
        <Card className="bar-chart-card">
          <h2 className="chart-title">New vs. Closed Cases (Monthly)</h2>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyCaseData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="newCases" fill="#3b82f6" name="New Cases" />
                <Bar dataKey="closedCases" fill="#10b981" name="Closed Cases" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="pie-chart-card">
          <h2 className="chart-title">Case Status Distribution</h2>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.caseStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <style>{`
        .analytics-page {
          padding: 2rem;
          background: #f9fafb;
          color: #1f2937;
        }
        .analytics-header {
          margin-bottom: 2rem;
        }
        .analytics-title {
          font-size: 2rem;
          font-weight: bold;
        }
        .analytics-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        @media (min-width: 1024px) {
          .charts-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
        .card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
        }
        .stat-card {
          padding: 1.25rem;
        }
        .stat-inner {
          display: flex;
          align-items: center;
        }
        .stat-icon {
          height: 3rem;
          width: 3rem;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-text {
          margin-left: 1rem;
        }
        .stat-title {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .stat-value {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
        }
        .chart-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }
        .bar-chart-card, .pie-chart-card {
          padding: 1.5rem;
        }
        .skeleton {
          border-radius: 0.5rem;
          animation: pulse 1.5s ease-in-out infinite;
          background-color: #e5e7eb;
        }
        .stat-skeleton {
          height: 7rem;
        }
        .chart-skeleton {
          height: 18rem;
        }
        .error-msg {
          padding: 2rem;
          text-align: center;
          color: #dc2626;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

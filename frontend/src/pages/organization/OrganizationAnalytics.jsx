import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useGetCallerUserProfile, useGetOrganizationAnalytics } from '../../hooks/useQueries';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Target,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS = {
  applied: '#3b82f6',
  reviewing: '#f59e0b',
  shortlisted: '#10b981',
  rejected: '#ef4444',
  hired: '#8b5cf6',
};

export default function OrganizationAnalytics() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Analytics');
  
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: analytics, isLoading: analyticsLoading } = useGetOrganizationAnalytics();

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== 'organization') {
      navigate({ to: '/' });
    }
  }, [profileLoading, userProfile, navigate]);

  if (profileLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { applications, vacancies, metrics } = analytics || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive recruitment insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {applications?.pending || 0} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.conversion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications to hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.success_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Shortlisted to hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vacancies?.avg_applications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per vacancy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
              <CardDescription>Distribution of application statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {applications?.by_status?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={applications.by_status}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {applications.by_status.map((item, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[item.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>Monthly application volume (Last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              {applications?.timeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applications.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Vacancy Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vacancy Performance</CardTitle>
              <CardDescription>Applications per vacancy</CardDescription>
            </CardHeader>
            <CardContent>
              {vacancies?.performance?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vacancies.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No vacancies posted yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>Performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Review</p>
                    <p className="text-xs text-muted-foreground">Awaiting action</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {applications?.pending || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shortlisted</p>
                    <p className="text-xs text-muted-foreground">Under consideration</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {applications?.shortlisted || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hired</p>
                    <p className="text-xs text-muted-foreground">Successful hires</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {applications?.hired || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rejection Rate</p>
                    <p className="text-xs text-muted-foreground">Applications rejected</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {metrics?.rejection_rate || 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

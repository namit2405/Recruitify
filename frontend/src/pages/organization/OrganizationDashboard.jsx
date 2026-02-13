import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePageTitle } from '../../hooks/usePageTitle';

import {
  useGetCallerUserProfile,
  useGetOrganizationProfile,
  useGetVacanciesByOrganization,
  useGetOrganizationAnalytics,
} from '../../hooks/useQueries';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import {
  Briefcase,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  Users,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

import {
  PieChart,
  Pie,
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

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Dashboard');

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const organizationId =
    userProfile?.userType === 'organization'
      ? userProfile.entityId
      : null;

  const { data: orgProfile, isLoading: orgLoading } =
    useGetOrganizationProfile(organizationId);

  const { data: vacancies = [], isLoading: vacanciesLoading } =
    useGetVacanciesByOrganization(organizationId);

  const { data: analytics, isLoading: analyticsLoading } = 
    useGetOrganizationAnalytics();

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== 'organization') {
      navigate({ to: '/' });
    }
  }, [profileLoading, userProfile, navigate]);

  const openVacancies = vacancies.filter(v => v.status === 'open');
  const closedVacancies = vacancies.filter(v => v.status === 'closed');

  if (profileLoading || orgLoading || vacanciesLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { applications, metrics } = analytics || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {orgProfile?.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your vacancies and review candidates
          </p>
        </div>

        {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium">Open Vacancies</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openVacancies.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {closedVacancies.length} closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.shortlisted || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {applications?.hired || 0} hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  navigate({ to: '/organization/post-vacancy' })
                }
              >
                Post Vacancy
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Charts - Only 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Applications by Status - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
              <CardDescription>
                Distribution of application statuses
              </CardDescription>
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
                        <Cell
                          key={idx}
                          fill={STATUS_COLORS[item.status] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Trends - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>
                Monthly application volume (Last 6 months)
              </CardDescription>
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
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No data available yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* View More Analytics Button */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Detailed Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View comprehensive insights, metrics, and performance data
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate({ to: '/organization/analytics' })}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View More Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Vacancies */}
        <Card>
          <CardHeader className="flex justify-between flex-row items-center">
            <div>
              <CardTitle>Recent Vacancies</CardTitle>
              <CardDescription>Latest job postings</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/organization/vacancies' })}
            >
              View All
            </Button>
          </CardHeader>

          <CardContent>
            {vacancies.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No vacancies yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by posting your first job vacancy
                </p>
                <Button
                  onClick={() => navigate({ to: '/organization/post-vacancy' })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Post Vacancy
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {vacancies.slice(0, 5).map(v => (
                  <div
                    key={v.id}
                    className="p-4 border rounded-lg flex justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-1">
                        <h3 className="font-semibold">{v.title}</h3>
                        <Badge variant={v.status === 'open' ? 'default' : 'secondary'}>
                          {v.status}
                        </Badge>
                        {v.is_public && <Badge variant="outline">Public</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {v.description}
                      </p>
                      <div className="text-xs text-muted-foreground flex gap-4 mt-2">
                        {v.location && <span>📍 {v.location}</span>}
                        {v.experience_level && <span>💼 {v.experience_level}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(v.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate({ to: '/organization/vacancies' })
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>

      <Footer />
    </div>
  );
}

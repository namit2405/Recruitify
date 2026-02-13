import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetCandidateProfile,
  useGetCandidateApplications,
  useGetActiveVacancies,
  useGetCandidateAnalytics,
} from "../../hooks/useQueries";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  MapPin,
  BarChart3,
} from "lucide-react";

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

export default function CandidateDashboard() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Dashboard');
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const candidateId =
    userProfile?.userType === "candidate" ? userProfile.entityId : null;

  const { data: candidateProfile, isLoading: candidateLoading } =
    useGetCandidateProfile(candidateId);

  const { data: applications = [], isLoading: applicationsLoading } =
    useGetCandidateApplications(candidateId);

  const { data: activeVacancies = [], isLoading: vacanciesLoading } =
    useGetActiveVacancies();

  const { data: analytics, isLoading: analyticsLoading } = 
    useGetCandidateAnalytics();

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "candidate") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  const pendingApplications = applications.filter(
    (a) => a.status === "applied" || a.status === "reviewing"
  );
  const shortlistedApplications = applications.filter(
    (a) => a.status === "shortlisted"
  );
  const acceptedApplications = applications.filter(
    (a) => a.status === "hired"
  );

  if (candidateLoading || applicationsLoading || vacanciesLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
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

  const successRate = applications.length > 0 
    ? Math.round(((shortlistedApplications.length + acceptedApplications.length) / applications.length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {candidateProfile?.name}
          </h1>
          <p className="text-muted-foreground">
            Track your applications and discover new opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingApplications.length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Shortlisted
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shortlistedApplications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedApplications.length} hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Available Jobs
              </CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVacancies.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Response rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Only 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Current status of your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.applications?.by_status?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.applications.by_status}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {analytics.applications.by_status.map((item, idx) => (
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
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No applications yet</p>
                    <Button 
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate({ to: '/candidate/jobs' })}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Activity</CardTitle>
              <CardDescription>
                Your application history (Last 6 months)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.applications?.timeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.applications.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
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
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Detailed Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View comprehensive insights and performance metrics
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate({ to: '/candidate/analytics' })}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View More Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications & Available Jobs */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your latest job applications</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/candidate/applications' })}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {app.vacancy_title || 'Job Application'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {app.status}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Available Jobs</CardTitle>
                <CardDescription>Latest job openings</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/candidate/jobs' })}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {activeVacancies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeVacancies.slice(0, 5).map((vacancy) => (
                    <div
                      key={vacancy.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate({ to: '/candidate/jobs' })}
                    >
                      <h4 className="font-medium text-sm mb-1">{vacancy.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {vacancy.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vacancy.location}
                          </span>
                        )}
                        {vacancy.experience_level && (
                          <Badge variant="outline" className="text-xs">
                            {vacancy.experience_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </main>

      <Footer />
    </div>
  );
}

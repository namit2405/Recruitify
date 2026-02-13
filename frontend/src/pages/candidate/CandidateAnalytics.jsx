import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useGetCallerUserProfile, useGetCandidateAnalytics } from "../../hooks/useQueries";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Target,
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

export default function CandidateAnalytics() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('My Analytics');
  
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: analytics, isLoading: analyticsLoading } = useGetCandidateAnalytics();

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "candidate") {
      navigate({ to: "/" });
    }
  }, [profileLoading, userProfile, navigate]);

  if (profileLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
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

  const { applications, metrics } = analytics || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your job search progress</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {applications?.applied || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.response_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Employer responses
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
                Shortlisted + Hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.hire_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successful offers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Current status of your applications</CardDescription>
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
              <CardTitle>Application Activity</CardTitle>
              <CardDescription>Your application history (Last 6 months)</CardDescription>
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
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
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

        {/* Detailed Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed breakdown of your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium">Pending</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {applications?.applied || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting response
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium">Shortlisted</p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {applications?.shortlisted || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Under consideration
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium">Hired</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {applications?.hired || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successful offers
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium">Rejected</p>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {applications?.rejected || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not selected
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

      </main>

      <Footer />
    </div>
  );
}

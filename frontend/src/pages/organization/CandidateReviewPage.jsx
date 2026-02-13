import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetVacanciesByOrganization,
  useGetVacancyApplications,
  useUpdateApplicationStatus,
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
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  GitCompare,
  TrendingUp,
  Award,
} from "lucide-react";




/* ---------------- STATUS CONFIG ---------------- */

const STATUS_ACTIONS = {
  applied: [
    { label: "Review", next: "reviewing", icon: Clock },
    { label: "Reject", next: "rejected", icon: XCircle, danger: true },
  ],
  reviewing: [
    { label: "Shortlist", next: "shortlisted", icon: CheckCircle },
    { label: "Reject", next: "rejected", icon: XCircle, danger: true },
  ],
  shortlisted: [
    { label: "Hire", next: "hired", icon: CheckCircle },
    { label: "Reject", next: "rejected", icon: XCircle, danger: true },
  ],
};

const STATUS_BADGE_VARIANT = {
  applied: "secondary",
  reviewing: "secondary",
  shortlisted: "default",
  hired: "default",
  rejected: "destructive",
};

/* ---------------- COMPONENT ---------------- */

export default function CandidateReviewPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Review Candidates');

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const updateApplicationStatus = useUpdateApplicationStatus();

  const organizationId =
    userProfile?.userType === "organization"
      ? userProfile.entityId
      : null;

  const { data: vacancies = [], isLoading: vacanciesLoading } =
    useGetVacanciesByOrganization(organizationId);

  const [selectedVacancyId, setSelectedVacancyId] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState("all"); // "all" or "selected"

  const {
    data: applications = [],
    isLoading: applicationsLoading,
  } = useGetVacancyApplications(selectedVacancyId);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "organization") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  useEffect(() => {
    if (vacancies.length > 0 && !selectedVacancyId) {
      setSelectedVacancyId(vacancies[0].id);
    }
  }, [vacancies, selectedVacancyId]);

  // Reset selection when vacancy changes
  useEffect(() => {
    setSelectedCandidates([]);
  }, [selectedVacancyId]);

  /* ---------------- HANDLER ---------------- */

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus.mutateAsync({
        id: applicationId,
        status,
      });

      toast.success(`Application marked as ${status}`);
    } catch (error) {
      toast.error(error?.message || "Failed to update application");
    }
  };

  const handleToggleCandidate = (appId) => {
    setSelectedCandidates(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleCompareSelected = () => {
    if (selectedCandidates.length < 2) {
      toast.error("Please select at least 2 candidates to compare");
      return;
    }
    setComparisonMode("selected");
    setShowComparison(true);
  };

  const handleCompareAll = () => {
    if (applications.length < 2) {
      toast.error("Need at least 2 applications to compare");
      return;
    }
    setComparisonMode("all");
    setShowComparison(true);
  };

  const getComparisonData = () => {
    if (comparisonMode === "all") {
      return applications.filter(app => !app.is_self_test);
    }
    return applications.filter(app => selectedCandidates.includes(app.id));
  };

  /* ---------------- RESUME VIEW ---------------- */

  const handleViewResume = (resumePath) => {
    if (!resumePath) {
      toast.error("Resume not available");
      return;
    }

    // Fix Windows backslashes
    const cleanedPath = resumePath.replace(/\\/g, "/");

    const resumeUrl = `http://127.0.0.1:8000/media/${cleanedPath}`;

    window.open(resumeUrl, "_blank");
  };

  /* ---------------- LOADING ---------------- */

  if (vacanciesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
        </main>
        <Footer />
      </div>
    );
  }

  const selectedVacancy = vacancies.find(
    (v) => v.id === selectedVacancyId
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidate Review</h1>
          <p className="text-muted-foreground">
            Review and manage candidate applications
          </p>
        </div>

        {/* Vacancy Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Vacancy</CardTitle>
            <CardDescription>
              Choose a vacancy to view its applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedVacancyId?.toString()}
              onValueChange={(v) => setSelectedVacancyId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vacancy" />
              </SelectTrigger>
              <SelectContent>
                {vacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.title} ({v.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Applications */}
        {selectedVacancy && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Applications for {selectedVacancy.title}
                  </CardTitle>
                  <CardDescription>
                    {applications.length} application(s)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedCandidates.length > 0 && (
                    <Button
                      onClick={handleCompareSelected}
                      variant="default"
                      className="gap-2"
                    >
                      <GitCompare className="h-4 w-4" />
                      Compare Selected ({selectedCandidates.length})
                    </Button>
                  )}
                  {applications.filter(app => !app.is_self_test).length >= 2 && (
                    <Button
                      onClick={handleCompareAll}
                      variant="outline"
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Compare All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {applicationsLoading ? (
                <Skeleton className="h-32" />
              ) : applications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No applications yet
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {!app.is_self_test && (
                          <Checkbox
                            checked={selectedCandidates.includes(app.id)}
                            onCheckedChange={() => handleToggleCandidate(app.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              {app.is_self_test ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-600">
                                    {app.candidate_name}
                                  </span>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Self Test
                                  </Badge>
                                </div>
                              ) : (
                                <Link
                                  to={`/public/candidate/${app.candidate_details?.id}`}
                                  className="font-medium text-green-600 hover:underline"
                                >
                                  {app.candidate_details?.name}
                                </Link>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Applied{" "}
                                {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm">
                                Score:{" "}
                                <span className="font-semibold">
                                  {app.final_score?.toFixed(2)}%
                                </span>
                              </p>
                            </div>
                            <div className="flex gap-2 items-start">
                              <Button
                                variant="outline"
                                onClick={() => navigate({ to: `/applications/${app.id}/analysis` })}
                              >
                                View Analysis
                              </Button>
                              <Badge
                                variant={STATUS_BADGE_VARIANT[app.status]}
                              >
                                {app.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Resume Button */}
                          <div className="flex gap-2 flex-wrap mt-2">
                            {!app.is_self_test && app.candidate_details?.resume_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(app.candidate_details.resume_url, "_blank")}
                              >
                                View Resume
                              </Button>
                            )}
                          </div>

                          {/* STATUS ACTIONS */}
                          {!app.is_self_test && STATUS_ACTIONS[app.status] && (
                            <div className="flex gap-2 flex-wrap mt-2">
                              {STATUS_ACTIONS[app.status].map((action) => {
                                const Icon = action.icon;
                                return (
                                  <Button
                                    key={action.next}
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        app.id,
                                        action.next
                                      )
                                    }
                                    disabled={
                                      updateApplicationStatus.isPending
                                    }
                                    className={`gap-1 ${
                                      action.danger
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                    {action.label}
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="!max-w-none w-[90vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <GitCompare className="h-6 w-6 text-white" />
              </div>
              Candidate Comparison
            </DialogTitle>
            <DialogDescription className="text-base">
              {comparisonMode === "all" 
                ? `Comparing all ${getComparisonData().length} candidates`
                : `Comparing ${selectedCandidates.length} selected candidates`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border-2 border-blue-100 shadow-md">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Score Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getComparisonData()
                  .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
                  .map((app, index) => (
                    <Card 
                      key={app.id} 
                      className={`${
                        index === 0 
                          ? "border-4 border-green-500 shadow-xl shadow-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50" 
                          : index === 1
                          ? "border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50"
                          : index === 2
                          ? "border-2 border-purple-300 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50"
                          : "border border-slate-200 shadow-md"
                      } transition-all hover:scale-105`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-bold">
                            {app.candidate_details?.name || app.candidate_name}
                          </CardTitle>
                          {index === 0 && (
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md">
                              🏆 Top
                            </Badge>
                          )}
                          {index === 1 && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md">
                              🥈 2nd
                            </Badge>
                          )}
                          {index === 2 && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md">
                              🥉 3rd
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Final Score</span>
                          </div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {app.final_score?.toFixed(2)}%
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <Badge variant={STATUS_BADGE_VARIANT[app.status]} className="shadow-sm">
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Category</span>
                          <span className="text-sm font-bold">{app.category || "—"}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Experience</span>
                          <span className="text-sm font-bold">
                            {(app.ml_result && typeof app.ml_result === 'object' && app.ml_result.experience_years) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Skills Match</span>
                          <span className="text-sm font-bold text-green-600">
                            {(app.ml_result && typeof app.ml_result === 'object' && app.ml_result.skill_match_pct) ? `${app.ml_result.skill_match_pct}%` : 'N/A'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 bg-white hover:bg-blue-50 border-2 border-blue-200 font-semibold"
                          onClick={() => {
                            setShowComparison(false);
                            navigate({ to: `/applications/${app.id}/analysis` });
                          }}
                        >
                          View Full Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Skills Comparison */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-100 shadow-md">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Skills Overview
              </h3>
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                      <th className="text-left p-4 font-bold text-slate-700">Candidate</th>
                      <th className="text-center p-4 font-bold text-slate-700">Score</th>
                      <th className="text-center p-4 font-bold text-slate-700">Experience</th>
                      <th className="text-center p-4 font-bold text-slate-700">Skills Match</th>
                      <th className="text-center p-4 font-bold text-slate-700">Semantic</th>
                      <th className="text-center p-4 font-bold text-slate-700">Status</th>
                      <th className="text-center p-4 font-bold text-slate-700">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getComparisonData()
                      .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
                      .map((app, index) => (
                        <tr 
                          key={app.id} 
                          className={`border-b hover:bg-blue-50/50 transition-colors ${
                            index === 0 ? "bg-green-50/30" : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-lg">🏆</span>}
                              {index === 1 && <span className="text-lg">🥈</span>}
                              {index === 2 && <span className="text-lg">🥉</span>}
                              <span className="font-semibold">
                                {app.candidate_details?.name || app.candidate_name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {app.final_score?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium">
                            {(app.ml_result && typeof app.ml_result === 'object' && app.ml_result.experience_years) 
                              ? `${app.ml_result.experience_years} years` 
                              : 'N/A'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-green-600">
                              {(app.ml_result && typeof app.ml_result === 'object' && app.ml_result.skill_match_pct) 
                                ? `${app.ml_result.skill_match_pct}%` 
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-purple-600">
                              {(app.ml_result && typeof app.ml_result === 'object' && app.ml_result.semantic_similarity) 
                                ? `${app.ml_result.semantic_similarity}%` 
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={STATUS_BADGE_VARIANT[app.status]} className="shadow-sm">
                              {app.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-center text-sm text-muted-foreground font-medium">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border-2 border-amber-100 shadow-md">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Quick Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {getComparisonData().length}
                      </div>
                      <div className="text-sm font-semibold text-slate-600 mt-1">Total Candidates</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {(getComparisonData().reduce((sum, app) => sum + (app.final_score || 0), 0) / getComparisonData().length).toFixed(2)}%
                      </div>
                      <div className="text-sm font-semibold text-slate-600 mt-1">Average Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {Math.max(...getComparisonData().map(app => app.final_score || 0)).toFixed(2)}%
                      </div>
                      <div className="text-sm font-semibold text-slate-600 mt-1">Highest Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {Math.min(...getComparisonData().map(app => app.final_score || 0)).toFixed(2)}%
                      </div>
                      <div className="text-sm font-semibold text-slate-600 mt-1">Lowest Score</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

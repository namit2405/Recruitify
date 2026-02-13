import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Award, Clock, Star, CheckCircle2, XCircle, TrendingUp, Briefcase, Target, Lightbulb, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ApplicationAnalysis() {
  const { id } = useParams({ from: "/applications/$id/analysis" });
  
  // Set page title
  usePageTitle('Application Analysis');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/applications/${id}/analysis/`);
      setData(res);
    } catch (err) {
      console.error("Failed to load analysis", err);
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-40 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  const analysis = data.analysis || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <main className="flex-1 container mx-auto p-6">
      <Card className="shadow-xl border-t-4 border-t-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                {data.candidate_name} — ML Analysis
              </CardTitle>
              <CardDescription className="mt-2 text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {data.vacancy_title}
              </CardDescription>
            </div>
            <div className="text-right bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Number(data.final_score || 0).toFixed(2)}%
              </div>
              <Badge className="mt-2" variant={
                data.category === 'highly_preferred' ? 'default' : 
                data.category === 'mid_preference' ? 'secondary' : 
                'outline'
              }>
                {data.category || '—'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* Matched Skills */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-green-900 dark:text-green-100">Matched Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analysis.matched_skills || []).map((s) => (
                    <Badge key={s} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                      {s}
                    </Badge>
                  ))}
                  {!(analysis.matched_skills || []).length && (
                    <div className="text-sm text-muted-foreground">No matched skills.</div>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-red-500 rounded-lg shadow-md">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-red-900 dark:text-red-100">Missing Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analysis.missing_skills || []).map((s) => (
                    <Badge key={s} variant="destructive" className="px-3 py-1.5 shadow-sm">
                      {s}
                    </Badge>
                  ))}
                  {!(analysis.missing_skills || []).length && (
                    <div className="text-sm text-muted-foreground">No missing skills detected.</div>
                  )}
                </div>
              </div>

              {/* Experience & Scores */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Experience & Metrics</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900">
                    <p className="text-sm text-muted-foreground mb-1">Experience</p>
                    <p className="text-2xl font-bold text-blue-600">{analysis.experience_years ?? 0} years</p>
                    <p className="text-xs text-muted-foreground mt-1">Score: {analysis.experience_score ?? 0}%</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900">
                    <p className="text-sm text-muted-foreground mb-1">Semantic Match</p>
                    <p className="text-2xl font-bold text-purple-600">{analysis.semantic_similarity ?? 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">AI Analysis</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                    <p className="text-sm text-muted-foreground mb-1">Skill Match</p>
                    <p className="text-2xl font-bold text-indigo-600">{analysis.skill_match_pct ?? 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Required Skills</p>
                  </div>
                </div>
              </div>

              {/* AI Recruiter Summary - Moved here */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">AI Recruiter Summary</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900">
                  {analysis.fit_summary ? (
                    <div className="prose max-w-none text-sm whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                      {analysis.fit_summary}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      AI summary unavailable (GROQ_API_KEY not configured).
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-4">
              {/* Quick Summary */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-5 rounded-xl border-2 border-amber-200 dark:border-amber-800 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base font-bold text-amber-900 dark:text-amber-100">Quick Summary</div>
                </div>
                
                {/* Title Matching */}
                <div className="mb-4 pb-4 border-b-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide">Title Matching</div>
                  </div>
                  <div className="text-sm">
                    {analysis.job_title_match ? (
                      <div className="flex items-start gap-2 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-semibold">Title matches JD aliases</span>
                          {(analysis.matched_job_titles || []).length > 0 && (
                            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                              {analysis.matched_job_titles.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300 font-medium">Title does not match JD aliases</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Keywords Match */}
                <div className="mb-4 pb-4 border-b-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide">Keywords</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(analysis.matched_keywords || []).length}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 font-medium">Matched</div>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {(analysis.missing_keywords || []).length}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 font-medium">Missing</div>
                    </div>
                  </div>
                  {(analysis.matched_keywords || []).length > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-xs text-green-700 dark:text-green-300 mb-1">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {analysis.matched_keywords.slice(0, 3).join(', ')}
                      {analysis.matched_keywords.length > 3 && ` +${analysis.matched_keywords.length - 3} more`}
                    </div>
                  )}
                  {(analysis.missing_keywords || []).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs text-red-700 dark:text-red-300">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      {analysis.missing_keywords.slice(0, 3).join(', ')}
                      {analysis.missing_keywords.length > 3 && ` +${analysis.missing_keywords.length - 3} more`}
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Recommendation</div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-100">{analysis.recommendation || '—'}</div>
                </div>
                
                {/* Info about Title Matching */}
                <div className="mt-4 pt-4 border-t-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Title matches JD aliases</strong> means the candidate's job titles from their resume match the job title variations specified in the job description.
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-slate-500 rounded-lg shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Application Status</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                  <Badge className="text-base px-4 py-2" variant={
                    data.status === 'accepted' ? 'default' : 
                    data.status === 'shortlisted' ? 'secondary' : 
                    'outline'
                  }>
                    {data.status}
                  </Badge>
                </div>
              </div>
            </aside>
          </div>
        </CardContent>
      </Card>
      </main>
      <Footer />
    </div>
  );
}

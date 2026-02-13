import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "../hooks/usePageTitle";
import { fetchApi } from "@/lib/api";
import { useGetCallerUserProfile, useApplyForVacancy, useGetCandidateApplications } from "../hooks/useQueries";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar,
  Users,
  Edit,
  Bell,
  XCircle,
  CheckCircle,
  Building2,
  Clock,
  Copy,
  Lock,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VacancyDetailPage() {
  const { id } = useParams({ from: "/vacancy/$id" });
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Job Details');
  
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: applications = [] } = useGetCandidateApplications();
  const applyForVacancy = useApplyForVacancy();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyPasscode, setApplyPasscode] = useState("");
  const [selfTestDialogOpen, setSelfTestDialogOpen] = useState(false);
  const [selfTestFile, setSelfTestFile] = useState(null);
  const [selfTestResult, setSelfTestResult] = useState(null);
  const [selfTestLoading, setSelfTestLoading] = useState(false);

  // Fetch vacancy details
  const { data: vacancy, isLoading } = useQuery({
    queryKey: ["vacancy", id],
    queryFn: () => fetchApi(`/vacancies/${id}/`),
  });

  // Fetch applications for this vacancy (if organization)
  const { data: orgApplications = [] } = useQuery({
    queryKey: ["vacancy-applications", id],
    queryFn: async () => {
      const allApps = await fetchApi('/applications/');
      return allApps.filter(app => app.vacancy === parseInt(id));
    },
    enabled: userProfile?.userType === 'organization',
  });

  const hasApplied = applications.some(app => app.vacancy === parseInt(id));

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    required_skills: [],
    location: '',
    salary_range: '',
    experience_level: '',
    benefits: '',
    status: 'open',
  });

  const [notifyMessage, setNotifyMessage] = useState('');

  // Update vacancy mutation
  const updateVacancy = useMutation({
    mutationFn: async (data) => {
      return fetchApi(`/vacancies/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', id] });
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      setEditDialogOpen(false);
      toast.success('Vacancy updated successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update vacancy');
    },
  });

  // Notify candidates mutation
  const notifyCandidates = useMutation({
    mutationFn: async (message) => {
      // This would be a backend endpoint to send notifications
      return fetchApi(`/vacancies/${id}/notify/`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: () => {
      setNotifyDialogOpen(false);
      setNotifyMessage('');
      toast.success('Candidates notified successfully');
    },
    onError: () => {
      toast.error('Failed to notify candidates');
    },
  });

  const handleEdit = () => {
    if (vacancy) {
      setEditForm({
        title: vacancy.title,
        description: vacancy.description,
        required_skills: Array.isArray(vacancy.required_skills) ? vacancy.required_skills : [],
        location: vacancy.location || '',
        salary_range: vacancy.salary_range || '',
        experience_level: vacancy.experience_level || '',
        benefits: vacancy.benefits || '',
        status: vacancy.status,
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    updateVacancy.mutate(editForm);
  };

  const handleNotify = () => {
    if (notifyMessage.trim()) {
      notifyCandidates.mutate(notifyMessage);
    }
  };

  const handleCloseVacancy = () => {
    if (confirm('Are you sure you want to close this vacancy? Candidates will be notified.')) {
      updateVacancy.mutate({ status: 'closed' });
    }
  };

  const handleSelfTest = async () => {
    if (!selfTestFile) {
      toast.error("Please select a resume file");
      return;
    }

    setSelfTestLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', selfTestFile);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/vacancies/${id}/self-test/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to run self-test');
      }

      const result = await response.json();
      setSelfTestResult(result);
      toast.success('Self-test completed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to run self-test');
    } finally {
      setSelfTestLoading(false);
    }
  };

  const handleDownloadResumes = async () => {
    try {
      toast.info('Preparing download...');
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/vacancies/${id}/download-resumes/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to download resumes');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resumes.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Resumes downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download resumes');
    }
  };

  const handleApply = async () => {
    if (!vacancy) {
      toast.error("Vacancy information not available");
      return;
    }

    // Check if private vacancy requires passcode
    if (!vacancy.is_public && !applyPasscode.trim()) {
      toast.error("Please enter the passcode for this private vacancy");
      return;
    }

    try {
      const payload = {
        vacancyId: parseInt(id),
      };
      
      // Add passcode if it's a private vacancy
      if (!vacancy.is_public) {
        payload.passcode = applyPasscode.trim();
      }

      await applyForVacancy.mutateAsync(payload);
      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      setApplyPasscode("");
      queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
    } catch (error) {
      toast.error(error?.message || 'Failed to submit application');
    }
  };

  const isOrganization = userProfile?.userType === 'organization';
  const isOwner = isOrganization && vacancy?.organization?.id === userProfile?.entityId;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 mb-4" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Vacancy not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{vacancy.title}</h1>
                  <Badge variant={vacancy.status === 'open' ? 'default' : 'secondary'}>
                    {vacancy.status}
                  </Badge>
                  {vacancy.is_public ? (
                    <Badge variant="outline">Public</Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  {vacancy.organization?.name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{vacancy.organization.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {new Date(vacancy.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Organization */}
              {isOwner && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Dialog open={selfTestDialogOpen} onOpenChange={(open) => {
                    setSelfTestDialogOpen(open);
                    if (!open) {
                      // Reset state when dialog closes
                      setSelfTestResult(null);
                      setSelfTestFile(null);
                      setSelfTestLoading(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Self Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Self Test Resume</DialogTitle>
                        <DialogDescription>
                          Upload a test resume to see how the ML scoring works for this vacancy
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!selfTestResult ? (
                          <>
                            <div>
                              <Label>Upload Resume (PDF)</Label>
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setSelfTestFile(e.target.files?.[0] || null)}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload a PDF resume to test the ML scoring system
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelfTestDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSelfTest}
                                disabled={!selfTestFile || selfTestLoading}
                              >
                                {selfTestLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running Test...
                                  </>
                                ) : (
                                  'Run Test'
                                )}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-900">Test Completed!</p>
                                <p className="text-xs text-green-700 mt-1">
                                  Self Test #{selfTestResult.test_number}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">Score</p>
                                  <p className="text-2xl font-bold">{selfTestResult.final_score?.toFixed(2)}%</p>
                                </div>
                                <div className="border rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">Category</p>
                                  <Badge className="mt-1">{selfTestResult.category}</Badge>
                                </div>
                              </div>

                              {selfTestResult.ml_result && (
                                <div className="border rounded-lg p-3 max-h-96 overflow-y-auto">
                                  <p className="text-sm font-medium mb-2">AI Analysis</p>
                                  {typeof selfTestResult.ml_result === 'string' ? (
                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                      {selfTestResult.ml_result}
                                    </p>
                                  ) : (
                                    <div className="space-y-3 text-xs">
                                      {selfTestResult.ml_result.fit_summary && (
                                        <div>
                                          <p className="font-medium text-sm mb-1">Summary</p>
                                          <p className="text-muted-foreground">{selfTestResult.ml_result.fit_summary}</p>
                                        </div>
                                      )}
                                      
                                      {selfTestResult.ml_result.recommendation && (
                                        <div>
                                          <p className="font-medium text-sm mb-1">Recommendation</p>
                                          <Badge variant={
                                            selfTestResult.ml_result.recommendation.includes('Strongly') ? 'default' :
                                            selfTestResult.ml_result.recommendation.includes('Consider') ? 'secondary' :
                                            'outline'
                                          }>
                                            {selfTestResult.ml_result.recommendation}
                                          </Badge>
                                        </div>
                                      )}
                                      
                                      {selfTestResult.ml_result.strengths && selfTestResult.ml_result.strengths.length > 0 && (
                                        <div>
                                          <p className="font-medium text-sm mb-1">Strengths</p>
                                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {selfTestResult.ml_result.strengths.map((strength, idx) => (
                                              <li key={idx}>{strength}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {selfTestResult.ml_result.weaknesses && selfTestResult.ml_result.weaknesses.length > 0 && (
                                        <div>
                                          <p className="font-medium text-sm mb-1">Weaknesses</p>
                                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {selfTestResult.ml_result.weaknesses.map((weakness, idx) => (
                                              <li key={idx}>{weakness}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        <div>
                                          <p className="text-muted-foreground">Skill Match</p>
                                          <p className="font-medium">{selfTestResult.ml_result.skill_match_pct}%</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Experience</p>
                                          <p className="font-medium">{selfTestResult.ml_result.experience_years} years</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button 
                                onClick={() => {
                                  setSelfTestResult(null);
                                  setSelfTestFile(null);
                                  setSelfTestLoading(false);
                                }}
                              >
                                Test Another
                              </Button>
                              <Button 
                                onClick={() => {
                                  setSelfTestDialogOpen(false);
                                  setSelfTestResult(null);
                                  setSelfTestFile(null);
                                  setSelfTestLoading(false);
                                  queryClient.invalidateQueries({ queryKey: ['vacancy-applications', id] });
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    onClick={handleDownloadResumes}
                    disabled={orgApplications.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Resumes
                  </Button>
                  
                  <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Bell className="mr-2 h-4 w-4" />
                        Notify
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Notify Candidates</DialogTitle>
                        <DialogDescription>
                          Send a notification to all candidates who applied for this position
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Message</Label>
                          <Textarea
                            value={notifyMessage}
                            onChange={(e) => setNotifyMessage(e.target.value)}
                            placeholder="Enter your message to candidates..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleNotify}
                            disabled={!notifyMessage.trim() || notifyCandidates.isPending}
                          >
                            {notifyCandidates.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Send Notification'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {vacancy.status === 'open' && (
                    <Button
                      variant="destructive"
                      onClick={handleCloseVacancy}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Close Vacancy
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Key Information Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {vacancy.location && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{vacancy.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {vacancy.salary_range && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary Range</p>
                      <p className="font-medium">{vacancy.salary_range}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {vacancy.experience_level && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-medium">{vacancy.experience_level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Applications</p>
                      <p className="font-medium">{orgApplications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Left Column - Details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {vacancy.description}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              {vacancy.required_skills && Array.isArray(vacancy.required_skills) && vacancy.required_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {vacancy.required_skills.map((skill, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {vacancy.benefits && vacancy.benefits.trim() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {vacancy.benefits}
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              
              {/* Apply Card for Candidates */}
              {!isOrganization && (
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for this position</CardTitle>
                    <CardDescription>
                      {vacancy.status === 'open' 
                        ? 'Submit your application now' 
                        : 'This position is currently closed'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasApplied ? (
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Already Applied
                      </Button>
                    ) : vacancy.status === 'open' ? (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setApplyDialogOpen(true)}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Position Closed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Applications Card for Organization */}
              {isOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>
                      {orgApplications.length} candidate{orgApplications.length !== 1 ? 's' : ''} applied
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => navigate({ to: '/organization/candidates' })}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Applications
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={vacancy.status === 'open' ? 'default' : 'secondary'}>
                      {vacancy.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility</span>
                    <Badge variant="outline">
                      {vacancy.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  {isOwner && !vacancy.is_public && vacancy.passcode && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Passcode</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded font-mono font-bold">
                            {vacancy.passcode}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(vacancy.passcode);
                              toast.success("Passcode copied!");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Posted on</p>
                      <p className="font-medium">
                        {new Date(vacancy.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vacancy</DialogTitle>
            <DialogDescription>
              Update vacancy details. Use the Notify button to inform candidates about changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={6}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>
            <div>
              <Label>Required Skills (one per line)</Label>
              <Textarea
                value={Array.isArray(editForm.required_skills) ? editForm.required_skills.join('\n') : ''}
                onChange={(e) => setEditForm({
                  ...editForm, 
                  required_skills: e.target.value.split('\n').filter(r => r.trim())
                })}
                rows={4}
                placeholder="JavaScript&#10;React&#10;Node.js&#10;SQL"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter each skill on a new line
              </p>
            </div>
            <div>
              <Label>Benefits</Label>
              <Textarea
                value={editForm.benefits}
                onChange={(e) => setEditForm({
                  ...editForm, 
                  benefits: e.target.value
                })}
                rows={4}
                placeholder="Health insurance, dental, and vision coverage&#10;401(k) matching&#10;Remote work options&#10;Professional development budget"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe the benefits offered
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input
                  value={editForm.salary_range}
                  onChange={(e) => setEditForm({...editForm, salary_range: e.target.value})}
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Experience Level</Label>
                <Select
                  value={editForm.experience_level}
                  onValueChange={(value) => setEditForm({...editForm, experience_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={updateVacancy.isPending || !editForm.title || !editForm.description}
              >
                {updateVacancy.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {vacancy?.title}</DialogTitle>
            <DialogDescription>
              Confirm your application for this position
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {vacancy && !vacancy.is_public && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Private Vacancy</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This is a private job posting. Please enter the passcode provided by the organization.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Your profile information and resume will be submitted with this application.
            </p>

            {vacancy && !vacancy.is_public && (
              <div className="space-y-2">
                <Label>Passcode *</Label>
                <Input
                  type="text"
                  value={applyPasscode}
                  onChange={(e) => setApplyPasscode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character passcode"
                  maxLength={6}
                  className="font-mono text-lg tracking-wider uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the passcode shared by the organization
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                disabled={applyForVacancy.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {applyForVacancy.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Confirm Application'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

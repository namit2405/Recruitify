import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetActiveVacancies,
  useApplyForVacancy,
  useGetCandidateProfile,
  useUploadResume,
  useGetCandidateApplications,
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
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Loader2,
  Lock,
} from "lucide-react";

export default function JobListingsPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Browse Jobs');

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const { data: vacancies = [], isLoading: vacanciesLoading } =
    useGetActiveVacancies();

  const { data: applications = [] } = useGetCandidateApplications();

  const applyForVacancy = useApplyForVacancy();
  const uploadResume = useUploadResume();

  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [passcode, setPasscode] = useState("");

  const candidateId =
    userProfile?.userType === "candidate" ? userProfile.entityId : null;

  const { data: candidateProfile } = useGetCandidateProfile(candidateId);

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "candidate") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  const handleApply = async () => {
    if (!candidateId || !selectedVacancy) {
      toast.error("Unable to apply");
      return;
    }

    if (!candidateProfile?.resumePath) {
      toast.error("Please upload your resume in PDF format before applying.");
      return;
    }

    // Check if private vacancy requires passcode
    if (!selectedVacancy.is_public && !passcode.trim()) {
      toast.error("Please enter the passcode for this private vacancy");
      return;
    }

    try {
      const payload = {
        vacancyId: selectedVacancy.id,
      };
      
      // Add passcode if it's a private vacancy
      if (!selectedVacancy.is_public) {
        payload.passcode = passcode.trim();
      }

      await applyForVacancy.mutateAsync(payload);

      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      setSelectedVacancy(null);
      setPasscode("");
    } catch (error) {
      toast.error(error?.message || "Failed to submit application");
    }
  };

  if (vacanciesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover opportunities that match your skills and preferences
          </p>
        </div>

        {vacancies.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No jobs available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new opportunities
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vacancies.map((vacancy, index) => (
              <Card
                key={vacancy?.id?.toString() || Math.random().toString()}
                className={`hover-lift transition-smooth border-t-4 border-t-green-500 animate-fade-in ${
                  index % 4 === 0 ? 'stagger-1' : 
                  index % 4 === 1 ? 'stagger-2' : 
                  index % 4 === 2 ? 'stagger-3' : 'stagger-4'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    {vacancy?.title}
                    {!vacancy?.is_public && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {vacancy?.description}
                  </CardDescription>
                  {vacancy?.organization && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Posted by{" "}
                        <Link
                          to={`/public/organization/${vacancy.organization.id}`}
                          className="font-medium text-green-600 hover:underline"
                        >
                          {vacancy.organization.name}
                        </Link>
                      </p>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {vacancy?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {vacancy.location}
                        </span>
                      )}

                      {vacancy?.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {vacancy.salary_range}
                        </span>
                      )}

                      {vacancy?.experience_level && (
                        <Badge variant="outline">
                          {vacancy.experience_level}
                        </Badge>
                      )}
                    </div>

                    {vacancy?.requirements?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Requirements:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {vacancy.requirements
                            .slice(0, 3)
                            .map((req, idx) => (
                              <li key={idx}>• {req}</li>
                            ))}
                          {vacancy.requirements.length > 3 && (
                            <li className="text-xs">
                              + {vacancy.requirements.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      Posted{" "}
                      {vacancy?.created_at && new Date(vacancy.created_at).toLocaleDateString()}
                    </div>

                    {applications.some(app => app.vacancy === vacancy.id) ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate({ to: `/vacancy/${vacancy.id}` })}
                          className="flex-1"
                          variant="outline"
                        >
                          View Details
                        </Button>
                        <Button
                          disabled
                          className="flex-1"
                          variant="outline"
                        >
                          Already Applied
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate({ to: `/vacancy/${vacancy.id}` })}
                          className="flex-1"
                          variant="outline"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedVacancy(vacancy);
                            setShowApplyDialog(true);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Apply Now
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Apply for {selectedVacancy?.title}
            </DialogTitle>
            <DialogDescription>
              Confirm your application for this position
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedVacancy?.is_public && (
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
              Your profile information will be submitted with this
              application.
            </p>

            {!selectedVacancy?.is_public && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Passcode *</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character passcode"
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded-md font-mono text-lg tracking-wider uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the passcode shared by the organization
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Resume (PDF only)</p>
              {candidateProfile?.resumePath ? (
                <p className="text-sm text-muted-foreground">
                  A resume is already uploaded to your profile and will be used
                  for this application.
                </p>
              ) : (
                <>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      if (
                        file.type !== "application/pdf" &&
                        !file.name.toLowerCase().endsWith(".pdf")
                      ) {
                        toast.error("Only PDF files are allowed.");
                        return;
                      }

                      try {
                        await uploadResume.mutateAsync(file);
                        toast.success("Resume uploaded successfully.");
                      } catch (error) {
                        const backendMessage =
                          error?.body?.detail || error?.message;
                        toast.error(
                          backendMessage ||
                            "Failed to upload resume. Please try again."
                        );
                      }
                    }}
                    disabled={uploadResume.isPending}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your resume in PDF format to continue.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                disabled={applyForVacancy.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {applyForVacancy.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Application"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowApplyDialog(false);
                  setSelectedVacancy(null);
                }}
                disabled={applyForVacancy.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

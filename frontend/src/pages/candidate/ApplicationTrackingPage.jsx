import { useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  useGetCallerUserProfile,
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
import { Skeleton } from "@/components/ui/skeleton";

import { FileText, Clock } from "lucide-react";

export default function ApplicationTrackingPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('My Applications');
  
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const candidateId =
    userProfile?.userType === "candidate" ? userProfile.entityId : null;

  const {
    data: applications = [],
    isLoading: applicationsLoading,
  } = useGetCandidateApplications(candidateId);

  // Debug logging
  useEffect(() => {
    if (applications.length > 0) {
      console.log('Candidate Applications:', applications);
      console.log('Candidate ID:', candidateId);
    }
  }, [applications, candidateId]);

  if (applicationsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userProfile?.userType === 'candidate' ? 'My Applications' : 'All Applications'}
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.userType === 'candidate' 
              ? 'Track the status of your job applications'
              : 'View all applications in the system (Admin View)'}
          </p>
          {candidateId && (
            <p className="text-xs text-muted-foreground mt-2">
              Candidate ID: {candidateId}
            </p>
          )}
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start applying to jobs to see your applications here
              </p>
              <Button
                onClick={() => navigate({ to: "/candidate/jobs" })}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card
                key={
                  application.id?.toString() ??
                  `vacancy-${application.vacancy ?? "unknown"}`
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>
                        {application.vacancy_title
                          ? application.vacancy_title
                          : `Vacancy #${application.vacancy}`}
                      </CardTitle>
                      <CardDescription>
                        Applied on{" "}
                        {application.applied_at
                          ? new Date(application.applied_at).toLocaleDateString()
                          : "N/A"}
                      </CardDescription>
                      {application.candidate_details && (
                        <p className="text-sm font-medium text-foreground mt-2">
                          Applicant:{" "}
                          <Link
                            to={`/public/candidate/${application.candidate_details.id}`}
                            className="text-green-600 hover:underline"
                          >
                            {application.candidate_details.name}
                          </Link>
                        </p>
                      )}
                      {application.organization_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Posted by{" "}
                          <Link
                            to={`/public/organization/${application.organization_id}`}
                            className="text-green-600 hover:underline font-medium"
                          >
                            {application.organization_name}
                          </Link>
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        application.status === "rejected"
                          ? "destructive"
                          : application.status === "hired" ||
                            application.status === "shortlisted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last updated:{" "}
                        {application.updated_at
                          ? new Date(
                              application.updated_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    {application.feedback && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Feedback:</p>
                        <p className="text-sm text-muted-foreground">
                          {application.feedback}
                        </p>
                      </div>
                    )}

                    {application.matchScore !== undefined &&
                      application.matchScore !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Match Score:
                          </span>
                          <Badge variant="outline">
                            {application.matchScore.toString()}%
                          </Badge>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

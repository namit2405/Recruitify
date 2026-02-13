import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetVacanciesByOrganization,
  useUpdateVacancyStatus,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Lock,
  Unlock,
} from "lucide-react";

export default function VacancyManagementPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Manage Vacancies');

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const updateStatus = useUpdateVacancyStatus();

  const organizationId =
    userProfile?.userType === "organization"
      ? userProfile.entityId
      : null;

  const { data: vacancies = [], isLoading: vacanciesLoading } =
    useGetVacanciesByOrganization(organizationId);

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "organization") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  const openVacancies = vacancies.filter(
    (v) => v.status === "open"
  );
  const closedVacancies = vacancies.filter(
    (v) => v.status === "closed"
  );

  const handleToggleStatus = async (vacancyId, currentStatus) => {
    const newStatus =
      currentStatus === "open" ? "closed" : "open";

    try {
      await updateStatus.mutateAsync({
        id: vacancyId,
        status: newStatus,
      });

      toast.success(
        `Vacancy ${
          newStatus === "open" ? "opened" : "closed"
        } successfully`
      );
    } catch (error) {
      toast.error(
        error?.message || "Failed to update vacancy status"
      );
    }
  };

  const VacancyCard = ({ vacancy }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">
                {vacancy.title}
              </CardTitle>
              <Badge
                variant={
                  vacancy.status === "open"
                    ? "default"
                    : "secondary"
                }
              >
                {vacancy.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {vacancy.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {vacancy.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {vacancy.location}
              </span>
            )}

            {vacancy.salary_range && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {vacancy.salary_range}
              </span>
            )}

            {vacancy.experience_level && (
              <Badge variant="outline">
                {vacancy.experience_level}
              </Badge>
            )}

            {vacancy.is_public ? (
              <Badge variant="outline" className="gap-1">
                <Unlock className="h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>

          {vacancy.requirements?.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">
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
            {new Date(vacancy.created_at).toLocaleDateString()}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                navigate({ to: `/vacancy/${vacancy.id}` })
              }
            >
              View Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleToggleStatus(
                  vacancy.id,
                  vacancy.status
                )
              }
              disabled={updateStatus.isPending}
            >
              {vacancy.status === "open"
                ? "Close"
                : "Reopen"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({ to: "/organization/candidates" })
              }
            >
              Applications
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (vacanciesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Vacancy Management
            </h1>
            <p className="text-muted-foreground">
              Manage your job postings and track applications
            </p>
          </div>

          <Button
            onClick={() =>
              navigate({ to: "/organization/post-vacancy" })
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post Vacancy
          </Button>
        </div>

        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open">
              Open ({openVacancies.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({closedVacancies.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({vacancies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            {openVacancies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No open vacancies
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {openVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id.toString()}
                    vacancy={vacancy}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed">
            {closedVacancies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No closed vacancies
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {closedVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id.toString()}
                    vacancy={vacancy}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {vacancies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No vacancies yet
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {vacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id.toString()}
                    vacancy={vacancy}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

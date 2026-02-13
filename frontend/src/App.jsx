import { useAuth } from "./hooks/useAuth";
import { useGetCallerUserProfile } from "./hooks/useQueries";

import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";

import { Toaster } from "./components/ui/sonner";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterOrganizationPage from "./pages/RegisterOrganizationPage";
import RegisterCandidatePage from "./pages/RegisterCandidatePage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DocumentationPage from "./pages/DocumentationPage";
import NotFoundPage from "./pages/NotFoundPage";

import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
import PostVacancyPage from "./pages/organization/PostVacancyPage";
import VacancyManagementPage from "./pages/organization/VacancyManagementPage";
import CandidateReviewPage from "./pages/organization/CandidateReviewPage";
import OrganizationProfilePage from "./pages/organization/OrganizationProfilePage";
import OrganizationAnalytics from "./pages/organization/OrganizationAnalytics";
import BrowseResumesPage from "./pages/organization/BrowseResumesPage";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import JobListingsPage from "./pages/candidate/JobListingsPage";
import ApplicationTrackingPage from "./pages/candidate/ApplicationTrackingPage";
import CandidateProfilePage from "./pages/candidate/CandidateProfilePage";
import CandidateAnalytics from "./pages/candidate/CandidateAnalytics";
import ApplicationAnalysis from "./pages/organization/ApplicationAnalysis";

import PublicCandidateProfile from "./pages/PublicCandidateProfile";
import PublicOrganizationProfile from "./pages/PublicOrganizationProfile";
import VacancyDetailPage from "./pages/VacancyDetailPage";
import ChatTestPage from "./pages/ChatTestPage";
import ChatPage from "./pages/ChatPage";

import ProfileSetupModal from "./components/ProfileSetupModal";
import LoadingScreen from "./components/LoadingScreen";

/* ---------------- ROOT ---------------- */

function RootComponent() {
  const { user, loginStatus } = useAuth();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = Boolean(user);
  const needsProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    isFetched &&
    userProfile &&
    ((userProfile.userType === "organization" && !userProfile.organization) ||
      (userProfile.userType === "candidate" && !userProfile.candidate));

  if (loginStatus === "logging-in" && !user) {
    return <LoadingScreen />;
  }
  if (isAuthenticated && profileLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {needsProfileSetup && <ProfileSetupModal />}
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

/* ---------------- ROUTES ---------------- */

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const registerOrgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/organization",
  component: RegisterOrganizationPage,
});

const registerCandidateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/candidate",
  component: RegisterCandidatePage,
});

const verifyOTPRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-otp",
  component: VerifyOTPPage,
});

const orgDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/dashboard",
  component: OrganizationDashboard,
});

const postVacancyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/post-vacancy",
  component: PostVacancyPage,
});

const vacancyManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/vacancies",
  component: VacancyManagementPage,
});

const candidateReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/candidates",
  component: CandidateReviewPage,
});

const orgProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/profile",
  component: OrganizationProfilePage,
});

const orgAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/analytics",
  component: OrganizationAnalytics,
});

const browseResumesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organization/resumes",
  component: BrowseResumesPage,
});

const candidateDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/dashboard",
  component: CandidateDashboard,
});

const jobListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/jobs",
  component: JobListingsPage,
});

const applicationTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/applications",
  component: ApplicationTrackingPage,
});

const candidateProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/profile",
  component: CandidateProfilePage,
});

const candidateAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/analytics",
  component: CandidateAnalytics,
});

const publicCandidateProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/public/candidate/$id",
  component: PublicCandidateProfile,
});

const publicOrganizationProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/public/organization/$id",
  component: PublicOrganizationProfile,
});

const vacancyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vacancy/$id",
  component: VacancyDetailPage,
});

const applicationAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications/$id/analysis",
  component: ApplicationAnalysis,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchResultsPage,
  validateSearch: (search) => ({
    q: search.q || "",
  }),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const chatTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat-test",
  component: ChatTestPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatPage,
  validateSearch: (search) => ({
    conversation: search.conversation || null,
  }),
});

const documentationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/documentation",
  component: DocumentationPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  registerOrgRoute,
  registerCandidateRoute,
  verifyOTPRoute,
  orgDashboardRoute,
  postVacancyRoute,
  vacancyManagementRoute,
  candidateReviewRoute,
  orgProfileRoute,
  orgAnalyticsRoute,
  browseResumesRoute,
  candidateDashboardRoute,
  jobListingsRoute,
  applicationTrackingRoute,
  candidateProfileRoute,
  candidateAnalyticsRoute,
  publicCandidateProfileRoute,
  publicOrganizationProfileRoute,
  vacancyDetailRoute,
  applicationAnalysisRoute,
  searchRoute,
  notificationsRoute,
  chatTestRoute,
  chatRoute,
  documentationRoute,
]);

const router = createRouter({ routeTree });

/* ---------------- APP ---------------- */

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

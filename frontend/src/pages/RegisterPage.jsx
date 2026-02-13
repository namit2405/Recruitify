import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../hooks/usePageTitle";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "../hooks/useAuth";
import { useGetCallerUserProfile } from "../hooks/useQueries";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { Building2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  // Set page title
  usePageTitle('Register');
  
  const { user } = useAuth();
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const navigate = useNavigate();

  useEffect(() => {
    if (!profileLoading && user && userProfile) {
      if (userProfile.userType === "organization") {
        navigate({ to: "/organization/dashboard" });
      } else if (userProfile.userType === "candidate") {
        navigate({ to: "/candidate/dashboard" });
      }
    }
  }, [user, userProfile, profileLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Create Your Account
            </CardTitle>
            <CardDescription>
              Choose how you want to join TalentHub
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate({ to: "/register/organization" })}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Register as Organization
            </Button>
            <Button
              onClick={() => navigate({ to: "/register/candidate" })}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register as Candidate
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign in here
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

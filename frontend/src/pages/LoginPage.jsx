import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  // Set page title
  usePageTitle('Login');
  
  const { login, user, loginStatus } = useAuth();
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      const result = await login(email.trim(), password);
      
      // Check if MFA is required
      if (result?.requires_mfa) {
        toast.info("Verification code sent to your email");
        navigate({ 
          to: "/verify-otp", 
          search: { email: result.email, purpose: "login" } 
        });
        return;
      }
      
      toast.success("Signed in successfully");
    } catch (err) {
      const msg =
        err?.body?.detail ||
        (typeof err?.body === "object" && err.body !== null
          ? JSON.stringify(err.body)
          : err?.message) ||
        "Login failed";
      toast.error(msg);
    }
  };

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your email to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                />
              </div>
              <Button
                type="submit"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate({ to: "/register" })}
              >
                Register here
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

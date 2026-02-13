import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { usePageTitle } from "../hooks/usePageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OTPInput from "../components/OTPInput";
import { fetchApi } from "@/lib/api";
import { useAuth } from "../hooks/useAuth";

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Verify OTP');
  
  const { setUser } = useAuth();
  const search = useSearch({ from: "/verify-otp" });
  
  const email = search.email || "";
  const purpose = search.purpose || "registration"; // 'registration' or 'login'
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!email) {
    navigate({ to: "/login" });
    return null;
  }

  const handleOTPComplete = async (otpCode) => {
    setIsVerifying(true);
    
    try {
      const endpoint = purpose === "registration" 
        ? "/auth/register/verify-otp/"
        : "/auth/login/verify-otp/";
      
      const response = await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      // Store tokens
      if (response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        setUser(response.user);
        
        toast.success(purpose === "registration" ? "Email verified successfully!" : "Login successful!");
        
        // Navigate based on user type
        if (response.user.user_type === "organization") {
          navigate({ to: "/organization/dashboard" });
        } else {
          navigate({ to: "/candidate/dashboard" });
        }
      }
    } catch (error) {
      const msg = error?.body?.detail || "Verification failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      await fetchApi("/auth/resend-otp/", {
        method: "POST",
        body: JSON.stringify({ email, purpose }),
      });
      
      toast.success("Verification code sent!");
    } catch (error) {
      const msg = error?.body?.detail || "Failed to resend code";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              {purpose === "registration" ? (
                <Mail className="h-6 w-6 text-blue-600" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <CardTitle>
              {purpose === "registration" ? "Verify Your Email" : "Two-Factor Authentication"}
            </CardTitle>
            <CardDescription>
              {purpose === "registration" 
                ? `We've sent a 6-digit code to ${email}`
                : `Enter the verification code sent to ${email}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onResend={handleResend}
              isLoading={isVerifying || isResending}
            />

            {isVerifying && (
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </div>
            )}

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate({ to: "/login" })}
                className="text-sm"
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

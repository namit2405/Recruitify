import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { usePageTitle } from '../hooks/usePageTitle';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Briefcase, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useGetCallerUserProfile();
  
  // Set page title
  usePageTitle('Home');

  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.userType === 'organization') {
        navigate({ to: '/organization/dashboard' });
      } else if (userProfile.userType === 'candidate') {
        navigate({ to: '/candidate/dashboard' });
      }
    }
  }, [user, userProfile, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50/50 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-green-950/10 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Connect Talent with Opportunity
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in stagger-1">
                The modern recruitment platform that brings organizations and candidates together seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-2">
                <Button
                  size="lg"
                  onClick={() => navigate({ to: '/register/organization' })}
                  className="bg-blue-600 hover:bg-blue-700 hover-lift shadow-lg"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  For Organizations
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: '/register/candidate' })}
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 hover-lift shadow-md"
                >
                  <Users className="mr-2 h-5 w-5" />
                  For Candidates
                </Button>
              </div>
            </div>
            <div className="relative animate-scale-in stagger-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
              <img
                src="assets\images\hero-homepage.avif"
                alt="Recruitment Platform"
                className="rounded-2xl shadow-2xl w-full relative z-10 hover-scale transition-smooth"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/10">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4 animate-pulse-subtle">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Organizations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect candidates for your team with powerful tools and insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift transition-smooth border-t-4 border-t-blue-500 animate-fade-in stagger-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Post Vacancies</CardTitle>
                <CardDescription>
                  Create detailed job postings with custom requirements and visibility settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Public or private listings</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom requirements</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Application deadlines</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-t-4 border-t-purple-500 animate-fade-in stagger-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Review Candidates</CardTitle>
                <CardDescription>
                  Access candidate profiles and resumes with intelligent matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Smart candidate matching</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Resume preview</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Application management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-t-4 border-t-indigo-500 animate-fade-in stagger-3">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Track Analytics</CardTitle>
                <CardDescription>
                  Monitor vacancy performance and application statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Application insights</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Vacancy statistics</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Performance tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8 animate-fade-in stagger-4">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/register/organization' })}
              className="bg-blue-600 hover:bg-blue-700 hover-lift shadow-lg"
            >
              Get Started as Organization
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Candidates Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-4 animate-pulse-subtle">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Candidates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover your next career opportunity and showcase your skills
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift transition-smooth border-t-4 border-t-green-500 animate-fade-in stagger-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Browse Jobs</CardTitle>
                <CardDescription>
                  Explore opportunities that match your skills and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Personalized recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Detailed job descriptions</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Easy application process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-t-4 border-t-emerald-500 animate-fade-in stagger-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Manage Profile</CardTitle>
                <CardDescription>
                  Build a comprehensive profile that showcases your expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Skills and experience</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Resume management</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Job preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-t-4 border-t-teal-500 animate-fade-in stagger-3">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Track Applications</CardTitle>
                <CardDescription>
                  Monitor your application status and receive feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Real-time status updates</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Employer feedback</span>
                  </li>
                  <li className="flex items-start gap-2 transition-smooth hover:translate-x-1">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Application history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8 animate-fade-in stagger-4">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/register/candidate' })}
              className="bg-green-600 hover:bg-green-700 hover-lift shadow-lg"
            >
              Get Started as Candidate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

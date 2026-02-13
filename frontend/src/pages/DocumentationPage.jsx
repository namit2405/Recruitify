import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  UserCircle, 
  FileText, 
  Search, 
  MessageSquare, 
  BarChart3,
  Upload,
  CheckCircle,
  ArrowRight,
  Users,
  Building2,
  Mail,
  Bell,
  Settings,
  Eye,
  Heart,
  Trash2,
  Reply
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('candidate');
  
  // Set page title
  usePageTitle('Documentation');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How to Use Recruitify
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to help you get started with Recruitify, whether you're looking for your dream job or searching for the perfect candidate.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <TabsTrigger value="candidate" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <UserCircle className="h-4 w-4" />
              For Candidates
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Building2 className="h-4 w-4" />
              For Organizations
            </TabsTrigger>
          </TabsList>

          {/* Candidate Guide */}
          <TabsContent value="candidate" className="space-y-8">
            {/* Getting Started */}
            <Card className="border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/10">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Getting Started as a Candidate
                </CardTitle>
                <CardDescription>Create your account and set up your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                      Sign Up
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                      <li>• Click "Register" in the top right corner</li>
                      <li>• Select "I'm a Candidate"</li>
                      <li>• Enter your email and create a password</li>
                      <li>• Verify your email with the OTP sent</li>
                    </ul>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Registration Page]</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                      Complete Your Profile
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                      <li>• Add your full name and contact information</li>
                      <li>• Upload a professional profile picture</li>
                      <li>• Add your skills and experience</li>
                      <li>• Upload your resume (PDF format)</li>
                    </ul>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Profile Setup]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Jobs */}
            <Card className="border-l-4 border-l-green-500 shadow-lg shadow-green-500/10">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  Finding and Applying for Jobs
                </CardTitle>
                <CardDescription>Discover opportunities that match your skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Browse Job Listings</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Navigate to "Browse Jobs" from the dashboard or header menu to see all available positions.
                    </p>
                    <div className="p-4 bg-muted rounded-lg mb-4">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Job Listings Page]</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 border rounded-lg">
                        <Search className="h-4 w-4 mb-2 text-primary" />
                        <p className="font-medium">Search & Filter</p>
                        <p className="text-xs text-muted-foreground">Use keywords, location, and filters</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <Eye className="h-4 w-4 mb-2 text-primary" />
                        <p className="font-medium">View Details</p>
                        <p className="text-xs text-muted-foreground">Click on any job to see full description</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <Heart className="h-4 w-4 mb-2 text-primary" />
                        <p className="font-medium">Save Jobs</p>
                        <p className="text-xs text-muted-foreground">Bookmark interesting positions</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Applying for a Job</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">1</span>
                        <div>
                          <p className="font-medium text-sm">Review Job Requirements</p>
                          <p className="text-xs text-muted-foreground">Make sure you meet the qualifications</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">2</span>
                        <div>
                          <p className="font-medium text-sm">Click "Apply Now"</p>
                          <p className="text-xs text-muted-foreground">Your profile and resume will be submitted</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">3</span>
                        <div>
                          <p className="font-medium text-sm">AI Analysis</p>
                          <p className="text-xs text-muted-foreground">Our AI will analyze your fit for the role</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">4</span>
                        <div>
                          <p className="font-medium text-sm">Track Your Application</p>
                          <p className="text-xs text-muted-foreground">Monitor status in "My Applications"</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Application Process]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Track Applications */}
            <Card className="border-l-4 border-l-orange-500 shadow-lg shadow-orange-500/10">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Tracking Your Applications
                </CardTitle>
                <CardDescription>Monitor your job application status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View all your applications in one place and track their progress through the hiring process.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Applications Dashboard]</p>
                </div>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 border rounded-lg text-center">
                    <Badge variant="secondary" className="mb-2">Pending</Badge>
                    <p className="text-xs text-muted-foreground">Under review</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Badge variant="default" className="mb-2">Shortlisted</Badge>
                    <p className="text-xs text-muted-foreground">You're a match!</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Badge variant="default" className="mb-2 bg-green-600">Accepted</Badge>
                    <p className="text-xs text-muted-foreground">Congratulations!</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Badge variant="destructive" className="mb-2">Rejected</Badge>
                    <p className="text-xs text-muted-foreground">Keep trying</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Feature */}
            <Card className="border-l-4 border-l-purple-500 shadow-lg shadow-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Communicating with Employers
                </CardTitle>
                <CardDescription>Chat directly with hiring managers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect with employers through our built-in messaging system.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Starting a Conversation</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Visit an organization's profile</li>
                      <li>• Click the "Message" button</li>
                      <li>• Start chatting instantly</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Chat Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Send text messages</li>
                      <li>• Share images and files</li>
                      <li>• Reply to specific messages</li>
                      <li>• Delete your messages</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Chat Interface]</p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-l-4 border-l-pink-500 shadow-lg shadow-pink-500/10">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Your Analytics Dashboard
                </CardTitle>
                <CardDescription>Track your job search progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View insights about your applications, profile views, and success rate.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Candidate Analytics]</p>
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">24</p>
                    <p className="text-xs text-muted-foreground">Applications Sent</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">156</p>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">8</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Guide */}
          <TabsContent value="organization" className="space-y-8">
            {/* Getting Started */}
            <Card className="border-l-4 border-l-indigo-500 shadow-lg shadow-indigo-500/10">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Getting Started as an Organization
                </CardTitle>
                <CardDescription>Set up your company profile and start hiring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                      Register Your Organization
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                      <li>• Click "Register" and select "I'm an Employer"</li>
                      <li>• Enter your company email</li>
                      <li>• Create a secure password</li>
                      <li>• Verify your email</li>
                    </ul>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Organization Registration]</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                      Build Your Company Profile
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                      <li>• Add company name and description</li>
                      <li>• Upload company logo and cover photo</li>
                      <li>• Add location and contact details</li>
                      <li>• Describe your company culture</li>
                    </ul>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Company Profile]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Jobs */}
            <Card className="border-l-4 border-l-teal-500 shadow-lg shadow-teal-500/10">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-teal-500 rounded-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  Posting Job Vacancies
                </CardTitle>
                <CardDescription>Create compelling job listings to attract top talent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Creating a Job Posting</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">1</span>
                        <div>
                          <p className="font-medium text-sm">Navigate to "Post a Job"</p>
                          <p className="text-xs text-muted-foreground">Click the button in your dashboard or header</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">2</span>
                        <div>
                          <p className="font-medium text-sm">Fill in Job Details</p>
                          <p className="text-xs text-muted-foreground">Title, description, requirements, salary range</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">3</span>
                        <div>
                          <p className="font-medium text-sm">Add Required Skills</p>
                          <p className="text-xs text-muted-foreground">List technical and soft skills needed</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm shrink-0">4</span>
                        <div>
                          <p className="font-medium text-sm">Publish Your Vacancy</p>
                          <p className="text-xs text-muted-foreground">Make it live for candidates to see</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">[Screenshot: Post Job Form]</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <FileText className="h-4 w-4 mb-2 text-primary" />
                      <p className="font-medium">Clear Description</p>
                      <p className="text-xs text-muted-foreground">Write detailed job requirements</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Users className="h-4 w-4 mb-2 text-primary" />
                      <p className="font-medium">Target Audience</p>
                      <p className="text-xs text-muted-foreground">Specify experience level</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Settings className="h-4 w-4 mb-2 text-primary" />
                      <p className="font-medium">Job Settings</p>
                      <p className="text-xs text-muted-foreground">Set location, type, and salary</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Applications */}
            <Card className="border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-500/10">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Reviewing Applications
                </CardTitle>
                <CardDescription>AI-powered candidate screening and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes each application and provides a compatibility score based on job requirements.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Applications Review]</p>
                </div>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">AI Compatibility Score</h4>
                      <Badge>85%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Each candidate receives a score based on skills match, experience, and qualifications.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-1">Strengths</p>
                      <p className="text-xs text-muted-foreground">Key matching skills</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-1">Weaknesses</p>
                      <p className="text-xs text-muted-foreground">Areas for improvement</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-1">Recommendation</p>
                      <p className="text-xs text-muted-foreground">AI hiring suggestion</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Application Actions</h4>
                  <div className="grid md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="default" size="sm" className="w-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Shortlist
                    </Button>
                    <Button variant="default" size="sm" className="w-full bg-green-600">
                      Accept
                    </Button>
                    <Button variant="destructive" size="sm" className="w-full">
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Resumes */}
            <Card className="border-l-4 border-l-amber-500 shadow-lg shadow-amber-500/10">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  Browse Candidate Resumes
                </CardTitle>
                <CardDescription>Proactively search for talent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Search through our database of candidates and reach out to potential hires directly.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Resume Browser]</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <Search className="h-4 w-4 mb-2 text-primary" />
                    <p className="font-medium mb-1">Advanced Search</p>
                    <p className="text-xs text-muted-foreground">Filter by skills, experience, location</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <MessageSquare className="h-4 w-4 mb-2 text-primary" />
                    <p className="font-medium mb-1">Direct Contact</p>
                    <p className="text-xs text-muted-foreground">Message candidates instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat & Communication */}
            <Card className="border-l-4 border-l-violet-500 shadow-lg shadow-violet-500/10">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-violet-500 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Communicating with Candidates
                </CardTitle>
                <CardDescription>Built-in messaging system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Chat with candidates directly through our platform with rich messaging features.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Messaging Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        Text messages
                      </li>
                      <li className="flex items-center gap-2">
                        <Upload className="h-3 w-3" />
                        Share files and images
                      </li>
                      <li className="flex items-center gap-2">
                        <Reply className="h-3 w-3" />
                        Reply to messages
                      </li>
                      <li className="flex items-center gap-2">
                        <Trash2 className="h-3 w-3" />
                        Delete messages
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Best Practices</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Respond promptly to candidates</li>
                      <li>• Be professional and courteous</li>
                      <li>• Share interview details clearly</li>
                      <li>• Provide feedback when possible</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Organization Chat]</p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-l-4 border-l-rose-500 shadow-lg shadow-rose-500/10">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-950/30">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Analytics & Insights
                </CardTitle>
                <CardDescription>Track your hiring performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor your job postings, applications, and hiring metrics in real-time.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-center text-muted-foreground">[Screenshot: Organization Analytics]</p>
                </div>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">248</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">45</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">8</p>
                    <p className="text-xs text-muted-foreground">Hired</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Pro Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">For Candidates</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Keep your profile updated with latest skills</li>
                  <li>✓ Upload a professional, well-formatted resume</li>
                  <li>✓ Apply to jobs that match your qualifications</li>
                  <li>✓ Respond quickly to employer messages</li>
                  <li>✓ Check your dashboard regularly for updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">For Organizations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Write clear, detailed job descriptions</li>
                  <li>✓ Review applications within 48 hours</li>
                  <li>✓ Use AI insights to identify top candidates</li>
                  <li>✓ Maintain active communication with applicants</li>
                  <li>✓ Keep your company profile attractive and updated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need Help */}
        <div className="mt-8 text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">Need More Help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

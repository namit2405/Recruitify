import { Heart, Briefcase, Mail, MapPin, Phone, Linkedin, Twitter, Facebook, Instagram, Github } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: userProfile } = useGetCallerUserProfile();
  const userType = userProfile?.userType;

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Recruitify</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting talented professionals with amazing opportunities. Your dream job is just a click away.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - User Type Specific */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How to Use
                </Link>
              </li>
              {userType === 'candidate' ? (
                <>
                  <li>
                    <Link to="/candidate/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/candidate/applications" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      My Applications
                    </Link>
                  </li>
                  <li>
                    <Link to="/candidate/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      My Analytics
                    </Link>
                  </li>
                </>
              ) : userType === 'organization' ? (
                <>
                  <li>
                    <Link to="/organization/candidates" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Find Candidates
                    </Link>
                  </li>
                  <li>
                    <Link to="/organization/resumes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Browse Resumes
                    </Link>
                  </li>
                  <li>
                    <Link to="/organization/post-vacancy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Post a Job
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/candidate/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Resources - User Type Specific */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  📖 How to Use Recruitify
                </Link>
              </li>
              {userType === 'organization' ? (
                <>
                  <li>
                    <Link to="/organization/vacancies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Manage Vacancies
                    </Link>
                  </li>
                  <li>
                    <Link to="/organization/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link to="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Messages
                    </Link>
                  </li>
                </>
              ) : userType === 'candidate' ? (
                <>
                  <li>
                    <Link to="/candidate/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Search
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/candidate/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Job Listings
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Get Started
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/notifications" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Suranussi, Jalandhar,144027</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +91 6239881326
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:support@recruitify.com" className="hover:text-primary transition-colors">
                  recruitify26@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Recruitify. Built with{" "}
              <Heart className="inline h-4 w-4 text-red-500 fill-red-500" />{" "}
              by passionate developers. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


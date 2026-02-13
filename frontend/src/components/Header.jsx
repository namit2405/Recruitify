import { useState, useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, User, LogOut, Briefcase, UserCircle, ArrowLeft, Search, Bell, Building2, Users, MapPin, MessageCircle, BookOpen, Moon, Sun } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme.jsx";
import { useGetCallerUserProfile, useSearchSuggestions, useGetUnreadNotificationCount } from "../hooks/useQueries";
import { useGetUnreadCount } from "../hooks/useChatQueries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Get search suggestions
  const { data: suggestionsData } = useSearchSuggestions(searchQuery);
  const suggestions = suggestionsData?.suggestions || [];

  // Get unread notification count
  const { data: notificationData } = useGetUnreadNotificationCount();
  const notificationCount = notificationData?.unread_count || 0;

  // Get unread chat count
  const { data: chatUnreadData } = useGetUnreadCount();
  const chatUnreadCount = chatUnreadData?.unread_count || 0;

  const isAuthenticated = !!user;
  const isOrganization = userProfile?.userType === "organization";
  const isCandidate = userProfile?.userType === "candidate";
  const displayName =
    userProfile?.organization?.name ||
    userProfile?.candidate?.name ||
    user?.email ||
    "User";

  // Check if we're on the home page
  const currentPath = routerState.location.pathname;
  const isHomePage = currentPath === "/";

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show suggestions when typing
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleBack = () => {
    window.history.back();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery } });
      setShowSearch(false); // Close mobile search
      setShowSuggestions(false); // Close suggestions
      setSearchQuery(""); // Clear search input
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'vacancy') {
      navigate({ to: "/candidate/jobs" });
    } else if (suggestion.type === 'candidate') {
      navigate({ to: `/public/candidate/${suggestion.id}` });
    } else if (suggestion.type === 'organization') {
      navigate({ to: `/public/organization/${suggestion.id}` });
    } else if (suggestion.type === 'skill' || suggestion.type === 'location' || suggestion.type === 'experience') {
      // Search for the skill/location/experience
      navigate({ to: "/search", search: { q: suggestion.text } });
    }
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'vacancy':
        return <Briefcase className="h-4 w-4" />;
      case 'candidate':
        return <User className="h-4 w-4" />;
      case 'organization':
        return <Building2 className="h-4 w-4" />;
      case 'skill':
        return <Search className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'experience':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = () => {
    navigate({ to: "/notifications" });
  };

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const handleDashboard = () => {
    if (isOrganization) navigate({ to: "/organization/dashboard" });
    else if (isCandidate) navigate({ to: "/candidate/dashboard" });
  };

  const handleProfile = () => {
    if (isOrganization) navigate({ to: "/organization/profile" });
    else if (isCandidate) navigate({ to: "/candidate/profile" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={isHomePage}
              className={isHomePage ? "opacity-50 cursor-not-allowed" : ""}
              title={isHomePage ? "Already on home page" : "Go back"}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate({ to: "/" })}
            >
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Recruitify</span>
            </div>
          </div>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Search Bar */}
            {isAuthenticated && (
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs, people, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="pl-9 w-80 h-9"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                      >
                        <span className="text-gray-500 dark:text-gray-400">
                          {getSuggestionIcon(suggestion.type)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{suggestion.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.subtitle}</p>
                        </div>
                      </button>
                    ))}
                    {searchQuery.trim() && (
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd> to search for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Navigation Links */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 border-l pl-4">
                {isOrganization ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/organization/post-vacancy" })}
                    >
                      Post Job
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/organization/candidates" })}
                    >
                      Candidates
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/organization/vacancies" })}
                    >
                      My Jobs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/organization/resumes" })}
                    >
                      Resumes
                    </Button>
                  </>
                ) : isCandidate ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/candidate/jobs" })}
                    >
                      Browse Jobs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/candidate/applications" })}
                    >
                      Applications
                    </Button>
                  </>
                ) : null}
              </div>
            )}

            {/* Notification Icon */}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate({ to: "/chat" })}
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5" />
                  {chatUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
                  Home
                </Button>
                <Button variant="ghost" onClick={() => navigate({ to: "/documentation" })}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  How to Use
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: "/register/organization" })}
                >
                  For Organizations
                </Button>
                <Button
                  onClick={() => navigate({ to: "/register/candidate" })}
                >
                  For Candidates
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate({ to: "/documentation" })}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Help
                </Button>
                <Button variant="ghost" onClick={handleDashboard}>
                  Dashboard
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {displayName}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Search Toggle */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                title="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Notification Icon */}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate({ to: "/chat" })}
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5" />
                  {chatUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {!isAuthenticated ? (
                    <>
                      <Button onClick={() => {
                        navigate({ to: "/" });
                        setMobileMenuOpen(false);
                      }}>
                        Home
                      </Button>
                      <Button onClick={() => {
                        navigate({ to: "/documentation" });
                        setMobileMenuOpen(false);
                      }}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        How to Use
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => {
                        handleDashboard();
                        setMobileMenuOpen(false);
                      }}>
                        Dashboard
                      </Button>
                      <Button onClick={() => {
                        handleProfile();
                        setMobileMenuOpen(false);
                      }}>
                        Profile
                      </Button>
                      <Button onClick={() => {
                        navigate({ to: "/documentation" });
                        setMobileMenuOpen(false);
                      }}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Help
                      </Button>
                      <Button onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}>
                        Logout
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isAuthenticated && showSearch && (
          <div className="md:hidden pb-4">
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs, people, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="pl-9 w-full"
                  autoFocus
                />
              </form>

              {/* Mobile Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        setShowSearch(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{suggestion.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.subtitle}</p>
                      </div>
                    </button>
                  ))}
                  {searchQuery.trim() && (
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd> to search for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

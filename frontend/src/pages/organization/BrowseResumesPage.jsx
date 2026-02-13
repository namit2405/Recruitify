import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  Briefcase,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function BrowseResumesPage() {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Browse Resumes');
  
  const [expandedVacancies, setExpandedVacancies] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ["organization-resumes"],
    queryFn: () => fetchApi("/resumes/browse/"),
  });

  const toggleVacancy = (vacancyId) => {
    setExpandedVacancies(prev => ({
      ...prev,
      [vacancyId]: !prev[vacancyId]
    }));
  };

  const toggleCategory = (key) => {
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategoryLabel = (categoryName) => {
    const labels = {
      'highly_preferred': 'Highly Preferred (60-100)',
      'mid_preference': 'Mid Preference (50-60)',
      'low_preference': 'Low Preference (25-50)',
      'no_visit': "Don't Need to Visit (0-25)",
    };
    return labels[categoryName] || categoryName;
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'highly_preferred': 'bg-green-100 text-green-800 border-green-300',
      'mid_preference': 'bg-blue-100 text-blue-800 border-blue-300',
      'low_preference': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'no_visit': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleViewResume = (url) => {
    window.open(`http://localhost:8000${url}`, '_blank');
  };

  const handleDownloadResume = (url, filename) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000${url}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Resumes</h1>
          <p className="text-muted-foreground">
            View all candidate resumes organized by vacancy and preference category
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{resumeData?.total_vacancies || 0}</p>
                  <p className="text-sm text-muted-foreground">Vacancies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{resumeData?.total_resumes || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{resumeData?.organization_name}</p>
                  <p className="text-sm text-muted-foreground">Organization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Folder Structure */}
        {!resumeData?.vacancies || resumeData.vacancies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resumes found</h3>
              <p className="text-muted-foreground">
                Resumes will appear here once candidates apply to your vacancies
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumeData.vacancies.map((vacancy) => (
              <Card key={vacancy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        {vacancy.title}
                      </CardTitle>
                      <CardDescription>
                        {vacancy.total_resumes} resume{vacancy.total_resumes !== 1 ? 's' : ''} across {vacancy.categories.length} categor{vacancy.categories.length !== 1 ? 'ies' : 'y'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVacancy(vacancy.id)}
                    >
                      <ChevronRight 
                        className={`h-5 w-5 transition-transform ${expandedVacancies[vacancy.id] ? 'rotate-90' : ''}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>

                {expandedVacancies[vacancy.id] && (
                  <CardContent>
                    <div className="space-y-3">
                      {vacancy.categories.map((category) => {
                        const categoryKey = `${vacancy.id}-${category.name}`;
                        return (
                          <div key={categoryKey} className="border rounded-lg">
                            <button
                              onClick={() => toggleCategory(categoryKey)}
                              className={`w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg ${getCategoryColor(category.name)} border`}
                            >
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                <span className="font-medium">{getCategoryLabel(category.name)}</span>
                                <Badge variant="secondary">{category.count}</Badge>
                              </div>
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform ${expandedCategories[categoryKey] ? 'rotate-90' : ''}`} 
                              />
                            </button>

                            {expandedCategories[categoryKey] && (
                              <div className="p-3 bg-muted/20 space-y-2">
                                {category.resumes.map((resume, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <FileText className="h-5 w-5 text-red-600" />
                                      <div>
                                        <p className="font-medium">{resume.candidate_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatFileSize(resume.size)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewResume(resume.url)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadResume(resume.url, resume.filename)}
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

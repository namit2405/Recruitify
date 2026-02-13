import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "../hooks/usePageTitle";
import { fetchApi } from "@/lib/api";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageLightbox from "../components/ImageLightbox";
import FollowButton from "../components/FollowButton";
import MessageButton from "../components/MessageButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Mail, Calendar, Briefcase, GraduationCap, Target } from "lucide-react";
import { useState } from "react";

export default function PublicCandidateProfile() {
  const { id } = useParams({ from: "/public/candidate/$id" });
  
  // Set page title
  usePageTitle('Candidate Profile');
  
  const [lightboxImage, setLightboxImage] = useState(null);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["public-candidate", id],
    queryFn: () => fetchApi(`/auth/public/candidate/${id}/`),
  });

  // Debug: Check skills data structure
  if (candidate) {
    console.log('Candidate skills:', candidate.skills);
    console.log('Is array?', Array.isArray(candidate.skills));
    console.log('Type:', typeof candidate.skills);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Candidate not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
          {candidate.cover_photo_url ? (
            <img
              src={candidate.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setLightboxImage(candidate.cover_photo_url)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/20 text-6xl font-bold">
                {candidate.name?.charAt(0) || "C"}
              </div>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Profile Picture & Name */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
              <div 
                className="relative w-40 h-40 rounded-full border-4 border-background bg-background shadow-xl overflow-hidden cursor-pointer group"
                onClick={() => candidate.profile_picture_url && setLightboxImage(candidate.profile_picture_url)}
              >
                {candidate.profile_picture_url ? (
                  <img
                    src={candidate.profile_picture_url}
                    alt={candidate.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                    <span className="text-5xl font-bold text-green-600 dark:text-green-400">
                      {candidate.name?.charAt(0) || "C"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-background rounded-lg p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{candidate.name}</h1>
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      {candidate.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{candidate.email}</span>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.address}</span>
                        </div>
                      )}
                    </div>
                    {candidate.availability && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{candidate.availability}</span>
                      </div>
                    )}
                  </div>
                  
                  {candidate.user_id && (
                    <div className="flex flex-col gap-2">
                      <FollowButton userId={candidate.user_id} />
                      <MessageButton userId={candidate.user_id} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Skills & Preferences */}
              <div className="space-y-6">
                {/* Summary */}
                {candidate.summary && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-3">About</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {candidate.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(candidate.skills) ? candidate.skills : [candidate.skills]).map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-sm whitespace-normal max-w-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Job Preferences */}
                {candidate.job_preferences && candidate.job_preferences.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Job Preferences</h2>
                      <div className="flex flex-wrap gap-2">
                        {candidate.job_preferences.map((pref, i) => (
                          <Badge key={i} variant="outline" className="text-sm">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Experience & Education */}
              <div className="md:col-span-2 space-y-6">
                {/* Experience */}
                {candidate.experience && candidate.experience.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        Experience
                      </h2>
                      <div className="space-y-3">
                        {candidate.experience.map((exp, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <p className="text-sm leading-relaxed">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {candidate.education && candidate.education.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                        Education
                      </h2>
                      <div className="space-y-3">
                        {candidate.education.map((edu, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <p className="text-sm leading-relaxed">{edu}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}

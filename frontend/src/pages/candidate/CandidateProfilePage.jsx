import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetCandidateProfile,
  useUpdateCandidateProfile,
  useRegisterCandidate,
  useUploadCandidateProfilePicture,
  useUploadCandidateCoverPhoto,
  useUploadResume,
} from "../../hooks/useQueries";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ImageUpload from "../../components/ImageUpload";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { Loader2, Plus, X, FileText, Upload, Eye, Download } from "lucide-react";

export default function CandidateProfilePage() {
  // Set page title
  usePageTitle('My Profile');
  
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const navigate = useNavigate();

  const candidateId =
    userProfile?.userType === "candidate" ? userProfile.entityId : null;

  const { data: candidateProfile, isLoading: candidateLoading } =
    useGetCandidateProfile(candidateId);

  const updateProfile = useUpdateCandidateProfile();
  const registerCandidate = useRegisterCandidate();
  const uploadProfilePicture = useUploadCandidateProfilePicture();
  const uploadCoverPhoto = useUploadCandidateCoverPhoto();
  const uploadResume = useUploadResume();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [availability, setAvailability] = useState("");
  const [summary, setSummary] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const [experienceInput, setExperienceInput] = useState("");
  const [experience, setExperience] = useState([]);

  const [educationInput, setEducationInput] = useState("");
  const [education, setEducation] = useState([]);

  const [preferenceInput, setPreferenceInput] = useState("");
  const [jobPreferences, setJobPreferences] = useState([]);

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "candidate") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  useEffect(() => {
    if (candidateProfile) {
      setName(candidateProfile.name);
      setPhone(candidateProfile.phone || "");
      setAddress(candidateProfile.address || "");
      setAvailability(candidateProfile.availability || "");
      setSummary(candidateProfile.summary || "");
      setSkills(candidateProfile.skills || []);
      setExperience(candidateProfile.experience || []);
      setEducation(candidateProfile.education || []);
      setJobPreferences(candidateProfile.jobPreferences || []);
    }
  }, [candidateProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!candidateId) {
        await registerCandidate.mutateAsync({
          name: name.trim(),
          phone: phone.trim() || '',
          address: address.trim() || '',
          skills,
          experience,
          education,
          availability: availability.trim() || '',
          summary: summary.trim() || '',
          jobPreferences,
        });
        toast.success("Profile created successfully!");
      } else {
        await updateProfile.mutateAsync({
          candidateId,
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          skills,
          experience,
          education,
          availability: availability.trim() || null,
          summary: summary.trim() || null,
          jobPreferences,
        });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage = error?.body?.detail 
        || error?.body?.message 
        || JSON.stringify(error?.body)
        || error?.message 
        || "Failed to save profile";
      toast.error(errorMessage);
    }
  };

  const addItem = (value, list, setList, setInput) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setInput("");
    }
  };

  const removeItem = (index, list, setList) => {
    setList(list.filter((_, idx) => idx !== index));
  };

  if (candidateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-500/5 to-green-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Images */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Images</CardTitle>
                <CardDescription>
                  Upload your profile picture and cover photo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ImageUpload
                  currentImageUrl={candidateProfile?.cover_photo_url}
                  onUpload={uploadCoverPhoto.mutateAsync}
                  isUploading={uploadCoverPhoto.isPending}
                  type="cover"
                  label="Cover Photo"
                />

                <ImageUpload
                  currentImageUrl={candidateProfile?.profile_picture_url}
                  onUpload={uploadProfilePicture.mutateAsync}
                  isUploading={uploadProfilePicture.isPending}
                  type="profile"
                  label="Profile Picture"
                />
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Keep your profile updated to get better job matches
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name"
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g., Immediate, 2 weeks notice, Remote only"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      placeholder="Write a brief summary about yourself, your experience, and career goals..."
                    />
                  </div>

                  {/* Resume Upload Section */}
                  <div className="space-y-2">
                    <Label>Resume (PDF only)</Label>
                    {candidateProfile?.resumePath ? (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-red-600" />
                            <div>
                              <p className="font-medium">Resume uploaded</p>
                              <p className="text-sm text-muted-foreground">
                                {candidateProfile.resumePath.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`http://localhost:8000${candidateProfile.resumePath}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `http://localhost:8000${candidateProfile.resumePath}`;
                                link.download = candidateProfile.resumePath.split('/').pop();
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Label htmlFor="resume-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <Upload className="h-4 w-4" />
                              <span>Upload new resume to replace current one</span>
                            </div>
                          </Label>
                          <input
                            id="resume-upload"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;

                              if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                                toast.error("Only PDF files are allowed.");
                                return;
                              }

                              try {
                                await uploadResume.mutateAsync(file);
                                toast.success("Resume uploaded successfully.");
                              } catch (error) {
                                toast.error(error?.message || "Failed to upload resume.");
                              }
                            }}
                            disabled={uploadResume.isPending}
                            className="hidden"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <Label htmlFor="resume-upload-initial" className="cursor-pointer">
                          <div className="space-y-2">
                            <p className="font-medium">Upload your resume</p>
                            <p className="text-sm text-muted-foreground">
                              PDF format only, max 10MB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadResume.isPending}
                              className="mt-2"
                            >
                              {uploadResume.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Choose File
                                </>
                              )}
                            </Button>
                          </div>
                        </Label>
                        <input
                          id="resume-upload-initial"
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                              toast.error("Only PDF files are allowed.");
                              return;
                            }

                            try {
                              await uploadResume.mutateAsync(file);
                              toast.success("Resume uploaded successfully.");
                            } catch (error) {
                              toast.error(error?.message || "Failed to upload resume.");
                            }
                          }}
                          disabled={uploadResume.isPending}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem(skillInput, skills, setSkills, setSkillInput);
                          }
                        }}
                        placeholder="Add a skill (e.g., Python, React, SQL)"
                      />
                      <Button 
                        type="button" 
                        onClick={() => addItem(skillInput, skills, setSkills, setSkillInput)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeItem(i, skills, setSkills)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={experienceInput}
                        onChange={(e) => setExperienceInput(e.target.value)}
                        placeholder="e.g., Software Engineer at ABC Corp (2020-2023)"
                        rows={2}
                      />
                      <Button 
                        type="button" 
                        onClick={() => addItem(experienceInput, experience, setExperience, setExperienceInput)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {experience.map((exp, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <p className="flex-1 text-sm">{exp}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(i, experience, setExperience)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Education</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={educationInput}
                        onChange={(e) => setEducationInput(e.target.value)}
                        placeholder="e.g., Bachelor's in Computer Science, XYZ University (2016-2020)"
                        rows={2}
                      />
                      <Button 
                        type="button" 
                        onClick={() => addItem(educationInput, education, setEducation, setEducationInput)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {education.map((edu, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <p className="flex-1 text-sm">{edu}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(i, education, setEducation)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Preferences</Label>
                    <div className="flex gap-2">
                      <Input
                        value={preferenceInput}
                        onChange={(e) => setPreferenceInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem(preferenceInput, jobPreferences, setJobPreferences, setPreferenceInput);
                          }
                        }}
                        placeholder="e.g., Remote work, Full-time, Flexible hours"
                      />
                      <Button 
                        type="button" 
                        onClick={() => addItem(preferenceInput, jobPreferences, setJobPreferences, setPreferenceInput)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobPreferences.map((pref, i) => (
                        <Badge key={i} variant="secondary">
                          {pref}
                          <button
                            type="button"
                            onClick={() => removeItem(i, jobPreferences, setJobPreferences)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

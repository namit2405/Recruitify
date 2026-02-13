import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

import {
  useGetCallerUserProfile,
  useGetOrganizationProfile,
  useUpdateOrganizationProfile,
  useUploadOrganizationProfilePicture,
  useUploadOrganizationCoverPhoto,
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
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OrganizationProfilePage() {
  // Set page title
  usePageTitle('Company Profile');
  
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  const navigate = useNavigate();

  const organizationId =
    userProfile?.userType === "organization"
      ? userProfile.entityId
      : null;

  const { data: orgProfile, isLoading: orgLoading } =
    useGetOrganizationProfile(organizationId);

  const updateProfile = useUpdateOrganizationProfile();
  const uploadProfilePicture = useUploadOrganizationProfilePicture();
  const uploadCoverPhoto = useUploadOrganizationCoverPhoto();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [established, setEstablished] = useState("");

  useEffect(() => {
    if (!profileLoading && userProfile?.userType !== "organization") {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  useEffect(() => {
    if (orgProfile) {
      setName(orgProfile.name);
      setDescription(orgProfile.description);
      setContactEmail(orgProfile.contactEmail);
      setWebsite(orgProfile.website || "");
      setLocation(orgProfile.location || "");
      setPhone(orgProfile.phone || "");
      setEstablished(
        orgProfile.established
          ? orgProfile.established.toString()
          : ""
      );
    }
  }, [orgProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        organizationId,
        name: name.trim(),
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        website: website.trim() || null,
        location: location.trim() || null,
        phone: phone.trim() || null,
        established: established ? parseInt(established, 10) : null,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/5 to-blue-600/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Organization Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your organization information
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Images */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Images</CardTitle>
                <CardDescription>
                  Upload your organization logo and cover photo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ImageUpload
                  currentImageUrl={orgProfile?.cover_photo_url}
                  onUpload={uploadCoverPhoto.mutateAsync}
                  isUploading={uploadCoverPhoto.isPending}
                  type="cover"
                  label="Cover Photo"
                />

                <ImageUpload
                  currentImageUrl={orgProfile?.profile_picture_url}
                  onUpload={uploadProfilePicture.mutateAsync}
                  isUploading={uploadProfilePicture.isPending}
                  type="profile"
                  label="Organization Logo"
                />
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your organization details
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Tell us about your organization..."
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) =>
                          setContactEmail(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="established">
                        Year Established
                      </Label>
                      <Input
                        id="established"
                        type="number"
                        value={established}
                        onChange={(e) =>
                          setEstablished(e.target.value)
                        }
                        placeholder="2020"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State, Country"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
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

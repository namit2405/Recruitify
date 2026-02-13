import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGetCallerUserProfile } from "../hooks/useQueries";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function ProfileSetupModal() {
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isOrganization = userProfile?.userType === "organization";
  const isCandidate = userProfile?.userType === "candidate";

  // compute whether the app considers the profile incomplete
  const needsProfileSetup =
    userProfile &&
    ((userProfile.userType === "organization" && !userProfile.organization) ||
      (userProfile.userType === "candidate" && !userProfile.candidate));

  // local open state so user can dismiss UI while debugging; will auto-close
  // when `needsProfileSetup` becomes false (profile created)
  const [open, setOpen] = useState(Boolean(needsProfileSetup));

  useEffect(() => {
    // if profile becomes complete, ensure modal is closed
    if (!needsProfileSetup) setOpen(false);
    // if profile needs setup, open the modal
    if (needsProfileSetup) setOpen(true);
  }, [needsProfileSetup]);

  const handleGoToProfile = () => {
    // close modal first to avoid it sticking on navigation
    setOpen(false);
    if (isOrganization) {
      navigate({ to: "/organization/profile" });
    } else if (isCandidate) {
      navigate({ to: "/candidate/profile" });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            {isOrganization
              ? "Add your organization details to get started."
              : isCandidate
              ? "Add your candidate profile to get started."
              : "Please complete your profile to continue."}
          </DialogDescription>
          {/* small close control */}
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="ml-auto text-muted-foreground hover:opacity-80"
            style={{ background: 'transparent', border: 'none' }}
          >
            ✕
          </button>
        </DialogHeader>

        <Button onClick={handleGoToProfile} className="w-full">
          Go to profile
        </Button>
      </DialogContent>
    </Dialog>
  );
}

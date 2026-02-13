// src/hooks/useQueries.jsx
// Backend API integration

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { getToken } from '@/lib/api';

/* =========================
   USER PROFILE
========================= */
export function useGetCallerUserProfile() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await fetchApi('/auth/profile/');
      return {
        user: data.user,
        userType: data.user.user_type,
        organization: data.organization,
        candidate: data.candidate,
        entityId: data.user.user_type === 'organization' ? data.organization?.id : data.candidate?.id,
      };
    },
    enabled: !!token,
    retry: false,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}

export function useSaveCallerUserProfile() {
  return {
    isPending: false,
    mutateAsync: async (profile) => {
      console.log("saveCallerUserProfile:", profile);
      await new Promise((r) => setTimeout(r, 400));
      return true;
    },
  };
}

/* =========================
   ORGANIZATION
========================= */
export function useRegisterOrganization() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        name: data.name,
        description: data.description ?? '',
        contact_email: data.contactEmail,
        website: data.website ?? '',
        location: data.location ?? '',
        phone: data.phone ?? '',
        established: data.established ?? null,
      };
      return fetchApi('/auth/profile/organization/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useGetOrganizationProfile(organizationId) {
  const token = getToken();
  const query = useQuery({
    queryKey: ['organization-profile', organizationId],
    queryFn: async () => {
      try {
        const data = await fetchApi('/auth/profile/organization/');
        return {
          name: data.name,
          description: data.description,
          contactEmail: data.contact_email,
          website: data.website,
          location: data.location,
          phone: data.phone,
          established: data.established,
          logoPath: data.logo_path,
          profile_picture_url: data.profile_picture_url,
          cover_photo_url: data.cover_photo_url,
        };
      } catch (error) {
        // Return null if profile doesn't exist (404), let other errors bubble up
        if (error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!token && !!organizationId,
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}

export function useUpdateOrganizationProfile() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        name: data.name,
        description: data.description ?? '',
        contact_email: data.contactEmail,
        website: data.website ?? '',
        location: data.location ?? '',
        phone: data.phone ?? '',
        established: data.established ?? null,
      };
      return fetchApi('/auth/profile/organization/', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

/* =========================
   CANDIDATE
========================= */
export function useRegisterCandidate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        name: data.name,
        phone: data.phone ?? '',
        address: data.address ?? '',
        skills: data.skills ?? [],
        experience: data.experience ?? [],
        education: data.education ?? [],
        availability: data.availability ?? '',
        summary: data.summary ?? '',
        job_preferences: data.jobPreferences ?? [],
      };
      return fetchApi('/auth/profile/candidate/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useGetCandidateProfile(candidateId) {
  const token = getToken();
  const query = useQuery({
    queryKey: ['candidate-profile', candidateId],
    queryFn: async () => {
      try {
        const data = await fetchApi('/auth/profile/candidate/');
        return {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          availability: data.availability,
          summary: data.summary,
          jobPreferences: data.job_preferences || [],
          resumePath: data.resume_url,
          profile_picture_url: data.profile_picture_url,
          cover_photo_url: data.cover_photo_url,
        };
      } catch (error) {
        // Return null if profile doesn't exist (404), let other errors bubble up
        if (error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!token && !!candidateId,
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        name: data.name,
        phone: data.phone ?? '',
        address: data.address ?? '',
        skills: data.skills ?? [],
        experience: data.experience ?? [],
        education: data.education ?? [],
        availability: data.availability ?? '',
        summary: data.summary ?? '',
        job_preferences: data.jobPreferences ?? [],
      };
      return fetchApi('/auth/profile/candidate/', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      return fetchApi('/auth/profile/candidate/resume/', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useUploadCandidateProfilePicture() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('profile_picture', file);
      return fetchApi('/auth/profile/candidate/profile-picture/', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useUploadCandidateCoverPhoto() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cover_photo', file);
      return fetchApi('/auth/profile/candidate/cover-photo/', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useUploadOrganizationProfilePicture() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('profile_picture', file);
      return fetchApi('/auth/profile/organization/profile-picture/', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useUploadOrganizationCoverPhoto() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cover_photo', file);
      return fetchApi('/auth/profile/organization/cover-photo/', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

/* =========================
   VACANCIES / APPLICATIONS
========================= */
export function useGetActiveVacancies() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['vacancies', 'active'],
    queryFn: async () => {
      const data = await fetchApi('/vacancies/');
      return data;
    },
    enabled: !!token,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}

export function useApplyForVacancy() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        vacancy: data.vacancyId,
        cover_letter: data.coverLetter,
      };
      
      // Add passcode if provided (for private vacancies)
      if (data.passcode) {
        body.passcode = data.passcode;
      }
      
      return fetchApi('/applications/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useGetVacanciesByOrganization() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['vacancies', 'organization'],
    queryFn: async () => {
      const data = await fetchApi('/vacancies/');
      return data;
    },
    enabled: !!token,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}

export function useGetVacancyApplications(vacancyId) {
  const token = getToken();

  return useQuery({
    queryKey: ['applications', 'vacancy', vacancyId],
    queryFn: async () => {
      const data = await fetchApi('/applications/');
      return vacancyId
        ? data.filter(app => app.vacancy === Number(vacancyId))
        : data;
    },
    enabled: !!token && !!vacancyId,
  });
}


export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      return fetchApi(`/applications/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    onSuccess: (_, __, variables) => {
      // ✅ invalidate ALL application queries
      queryClient.invalidateQueries({
        queryKey: ['applications'],
        exact: false,
      });
    },
  });
}


export function useUpdateVacancyStatus() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return fetchApi(`/vacancies/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vacancies'] }),
  });
  
  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function usePostVacancy() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        title: data.title,
        description: data.description,
        requirements: data.requirements, // ensure array
        location: data.location,
        salary_range: data.salaryRange,
        is_public: data.isPublic,
        status: 'open',
        experience_level: data.experienceLevel,
        benefits: data.benefits,
      };
      return fetchApi('/vacancies/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vacancies'] }),
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useGetCandidateApplications() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['applications', 'candidate'],
    queryFn: async () => {
      const data = await fetchApi('/applications/');
      return data;
    },
    enabled: !!token,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
  };
}

export function useGlobalSearch(searchQuery) {
  const token = getToken();
  const query = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim() === '') {
        return {
          vacancies: [],
          candidates: [],
          organizations: [],
          total_results: 0,
        };
      }
      const data = await fetchApi(`/search/?q=${encodeURIComponent(searchQuery)}`);
      return data;
    },
    enabled: !!token && !!searchQuery && searchQuery.trim() !== '',
  });

  return {
    data: query.data || { vacancies: [], candidates: [], organizations: [], total_results: 0 },
    isLoading: query.isLoading,
  };
}

export function useSearchSuggestions(searchQuery) {
  const token = getToken();
  const query = useQuery({
    queryKey: ['search-suggestions', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return { suggestions: [] };
      }
      const data = await fetchApi(`/search/suggestions/?q=${encodeURIComponent(searchQuery)}`);
      return data;
    },
    enabled: !!token && !!searchQuery && searchQuery.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    data: query.data || { suggestions: [] },
    isLoading: query.isLoading,
  };
}

/* =========================
   NOTIFICATIONS
========================= */
export function useGetNotifications() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await fetchApi('/notifications/');
      return data;
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useGetUnreadNotificationCount() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const data = await fetchApi('/notifications/unread-count/');
      return data;
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    data: query.data || { unread_count: 0 },
    isLoading: query.isLoading,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (notificationId) => {
      return fetchApi(`/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      return fetchApi('/notifications/mark-all-read/', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (notificationId) => {
      return fetchApi(`/notifications/${notificationId}/delete/`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    isPending: mutation.isPending,
    mutateAsync: mutation.mutateAsync,
  };
}

/* =========================
   ANALYTICS
========================= */
export function useGetOrganizationAnalytics() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['organization-analytics'],
    queryFn: async () => {
      return await fetchApi('/analytics/organization/');
    },
    enabled: !!token,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useGetCandidateAnalytics() {
  const token = getToken();
  const query = useQuery({
    queryKey: ['candidate-analytics'],
    queryFn: async () => {
      return await fetchApi('/analytics/candidate/');
    },
    enabled: !!token,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}


from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("register/", views.RegisterView.as_view(), name="register"),
    path("register/verify-otp/", views.VerifyRegistrationOTPView.as_view(), name="verify_registration_otp"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("login/verify-otp/", views.VerifyLoginOTPView.as_view(), name="verify_login_otp"),
    path("resend-otp/", views.ResendOTPView.as_view(), name="resend_otp"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Profile (read-only combined)
    path("profile/", views.ProfileView.as_view(), name="profile"),

    # Profile updates
    path(
        "profile/organization/",
        views.OrganizationProfileView.as_view(),
        name="organization_profile",
    ),
    path(
        "profile/candidate/",
        views.CandidateProfileView.as_view(),
        name="candidate_profile",
    ),

    # Resume upload
    path(
        "profile/candidate/resume/",
        views.CandidateResumeUploadView.as_view(),
        name="candidate_resume_upload",
    ),
    
    # Profile picture & cover photo uploads
    path(
        "profile/candidate/profile-picture/",
        views.CandidateProfilePictureUploadView.as_view(),
        name="candidate_profile_picture_upload",
    ),
    path(
        "profile/candidate/cover-photo/",
        views.CandidateCoverPhotoUploadView.as_view(),
        name="candidate_cover_photo_upload",
    ),
    path(
        "profile/organization/profile-picture/",
        views.OrganizationProfilePictureUploadView.as_view(),
        name="organization_profile_picture_upload",
    ),
    path(
        "profile/organization/cover-photo/",
        views.OrganizationCoverPhotoUploadView.as_view(),
        name="organization_cover_photo_upload",
    ),
    
    # Public profiles
    path(
    "public/candidate/<int:pk>/",
    views.PublicCandidateView.as_view(),
    name="public_candidate",
    ),

    path(
        "public/organization/<int:pk>/",
        views.PublicOrganizationView.as_view(),
        name="public_organization",
    ),
    
    # Follow/Unfollow
    path(
        "follow/<int:user_id>/",
        views.FollowUserView.as_view(),
        name="follow_user",
    ),
    path(
        "unfollow/<int:user_id>/",
        views.UnfollowUserView.as_view(),
        name="unfollow_user",
    ),
    path(
        "follow-status/<int:user_id>/",
        views.FollowStatusView.as_view(),
        name="follow_status",
    ),
    path(
        "followers/<int:user_id>/",
        views.FollowersListView.as_view(),
        name="followers_list",
    ),
    path(
        "following/<int:user_id>/",
        views.FollowingListView.as_view(),
        name="following_list",
    ),

]

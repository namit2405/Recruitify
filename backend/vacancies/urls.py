from django.urls import path
from .views import (
    ApplicationAnalysisView,
    VacancyListCreateView,
    VacancyDetailView,
    VacancyNotifyView,
    VacancyPasscodeVerifyView,
    ApplicationListCreateView,
    ApplicationDetailView,
    OrganizationDashboardAnalyticsView,
    GlobalSearchView,
    SearchSuggestionsView,
    DownloadVacancyResumesView,
    BrowseOrganizationResumesView,
    SelfTestVacancyView,
)
from .analytics_views import (
    OrganizationAnalyticsView,
    CandidateAnalyticsView,
)

urlpatterns = [
    # =========================
    # VACANCIES
    # =========================
    # Organization creates & lists vacancies
    path(
        'vacancies/',
        VacancyListCreateView.as_view(),
        name='vacancy-list-create',
    ),

    path(
        'vacancies/<int:pk>/',
        VacancyDetailView.as_view(),
        name='vacancy-detail',
    ),
    
    path(
        'vacancies/<int:pk>/notify/',
        VacancyNotifyView.as_view(),
        name='vacancy-notify',
    ),
    
    path(
        'vacancies/<int:pk>/verify-passcode/',
        VacancyPasscodeVerifyView.as_view(),
        name='vacancy-verify-passcode',
    ),
    
    path(
        'vacancies/<int:pk>/download-resumes/',
        DownloadVacancyResumesView.as_view(),
        name='vacancy-download-resumes',
    ),
    
    path(
        'resumes/browse/',
        BrowseOrganizationResumesView.as_view(),
        name='browse-organization-resumes',
    ),
    
    path(
        'vacancies/<int:pk>/self-test/',
        SelfTestVacancyView.as_view(),
        name='vacancy-self-test',
    ),
    path(
        "organization/dashboard/",
        OrganizationDashboardAnalyticsView.as_view(),
        name="organization-dashboard",
    ),

    # =========================
    # APPLICATIONS
    # =========================
    # Candidate applies & sees own applications
    path(
        'applications/',
        ApplicationListCreateView.as_view(),
        name='application-list-create',
    ),

    path(
        'applications/<int:pk>/',
        ApplicationDetailView.as_view(),
        name='application-detail',
    ),
    
    path(
    "applications/<int:pk>/analysis/",
    ApplicationAnalysisView.as_view(),
    name="application_analysis",
    ),
    
    # =========================
    # GLOBAL SEARCH
    # =========================
    path(
        'search/',
        GlobalSearchView.as_view(),
        name='global-search',
    ),
    
    path(
        'search/suggestions/',
        SearchSuggestionsView.as_view(),
        name='search-suggestions',
    ),
    
    # =========================
    # ANALYTICS
    # =========================
    path(
        'analytics/organization/',
        OrganizationAnalyticsView.as_view(),
        name='organization-analytics',
    ),
    
    path(
        'analytics/candidate/',
        CandidateAnalyticsView.as_view(),
        name='candidate-analytics',
    ),

    # =========================
    # ORGANIZATION VIEWS (ML)
    # =========================
    # Organization lists applications for a vacancy
    # path(
    #     'organizations/applications/',
    #     OrganizationApplicationsView.as_view(),
    #     name='organization-applications',
    # ),

    # # Trigger ML scoring for an application
    # path(
    #     'applications/<int:pk>/score/',
    #     ScoreApplicationView.as_view(),
    #     name='application-score',
    # ),
]

from django.db import models
from accounts.models import Organization, Candidate


class Vacancy(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='vacancies'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    # --- ML-relevant structured fields
    required_skills = models.JSONField(default=list)
    education_required = models.JSONField(default=list)
    job_title_aliases = models.JSONField(default=list)
    keywords = models.JSONField(default=list)

    min_experience_years = models.FloatField(default=0)
    max_experience_years = models.FloatField(null=True, blank=True)

    # --- General vacancy fields
    location = models.CharField(max_length=255, blank=True, null=True)
    salary_range = models.CharField(max_length=255, blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)
    experience_level = models.CharField(max_length=100, blank=True, null=True)

    is_public = models.BooleanField(default=True)
    passcode = models.CharField(max_length=10, blank=True, null=True)  # For private vacancies
    status = models.CharField(
        max_length=20,
        default='open',
        choices=[('open', 'Open'), ('closed', 'Closed')]
    )

    allowed_candidates = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    )

    CATEGORY_CHOICES = (
        ('highly_preferred', 'Highly Preferred (60-100)'),
        ('mid_preference', 'Mid Preference (50-60)'),
        ('low_preference', 'Low Preference (25-50)'),
        ('no_visit', "Don't Need to Visit (0-25)"),
    )

    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )

    # 🔥 ML OUTPUT FIELDS (CRITICAL)
    final_score = models.FloatField(default=0.0)
    category = models.CharField(
        max_length=32,
        choices=CATEGORY_CHOICES,
        default='no_visit'
    )
    
    ml_result = models.JSONField(null=True, blank=True)
    
    # Self-test field
    is_self_test = models.BooleanField(default=False)
    self_test_number = models.IntegerField(null=True, blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Allow multiple applications from same candidate only for self-tests
        # For regular applications, enforce uniqueness
        constraints = [
            models.UniqueConstraint(
                fields=['vacancy', 'candidate'],
                condition=models.Q(is_self_test=False),
                name='unique_application_per_candidate'
            )
        ]

    def __str__(self):
        if self.is_self_test:
            return f"Self Test #{self.self_test_number} - {self.vacancy.title}"
        return f"{self.candidate.name} - {self.vacancy.title}"

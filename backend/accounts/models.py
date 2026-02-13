from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'organization')
        extra_fields.setdefault('email_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)



class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('organization', 'Organization'),
        ('candidate', 'Candidate'),
    ]
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    mfa_enabled = models.BooleanField(default=True)  # MFA enabled by default
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type']

    def __str__(self):
        return self.email
    
    def follow(self, user):
        """Follow another user"""
        if self != user:
            Follow.objects.get_or_create(follower=self, following=user)
    
    def unfollow(self, user):
        """Unfollow a user"""
        Follow.objects.filter(follower=self, following=user).delete()
    
    def is_following(self, user):
        """Check if following a user"""
        return Follow.objects.filter(follower=self, following=user).exists()
    
    def get_followers_count(self):
        """Get count of followers"""
        return self.followers.count()
    
    def get_following_count(self):
        """Get count of users being followed"""
        return self.following.count()


class OTPVerification(models.Model):
    PURPOSE_CHOICES = [
        ('registration', 'Registration'),
        ('login', 'Login'),
    ]
    
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'purpose', 'is_verified']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.purpose} - {self.otp_code}"


class Organization(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='organization_profile')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    contact_email = models.EmailField()
    website = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    established = models.IntegerField(null=True, blank=True)
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    
    # Profile and cover photos
    profile_picture = models.ImageField(upload_to='organizations/profile_pictures/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='organizations/cover_photos/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Candidate(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='candidate_profile'
    )

    name = models.CharField(max_length=255)
    email = models.EmailField(default="")
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    availability = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True, help_text="Professional summary or bio")

    skills = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    education = models.JSONField(default=list)
    job_preferences = models.JSONField(default=list)

    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    
    # Profile and cover photos
    profile_picture = models.ImageField(upload_to='candidates/profile_pictures/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='candidates/cover_photos/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name




class Follow(models.Model):
    """
    Generic follow relationship between users
    Allows candidates to follow organizations and vice versa
    """
    follower = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='following'
    )
    following = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')
        indexes = [
            models.Index(fields=['follower', 'following']),
            models.Index(fields=['following', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.follower.email} follows {self.following.email}"

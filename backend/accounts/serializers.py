from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Organization, Candidate

User = get_user_model()


# ==================================================
# USER
# ==================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "user_type", "date_joined")
        read_only_fields = ("id", "date_joined")


# ==================================================
# REGISTER
# ==================================================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "user_type")

    def validate_user_type(self, value):
        if value not in ("organization", "candidate"):
            raise serializers.ValidationError("Invalid user type")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data.pop("password")
        user_type = validated_data["user_type"]
        user = User.objects.create_user(email=email, password=password, user_type=user_type,)

        # 🔴 CRITICAL FIX: auto-create profile
        if user.user_type == "organization":
            Organization.objects.create(
                user=user,
                name="",
                contact_email=user.email,
            )
        else:  # candidate
            Candidate.objects.create(
                user=user,
                name="",
                email=user.email,
            )   

        return user


# ==================================================
# ORGANIZATION
# ==================================================

class OrganizationSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "description",
            "contact_email",
            "website",
            "location",
            "phone",
            "established",
            "logo_path",
            "profile_picture",
            "profile_picture_url",
            "cover_photo",
            "cover_photo_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "profile_picture_url", "cover_photo_url", "profile_picture", "cover_photo")
    
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def get_cover_photo_url(self, obj):
        request = self.context.get('request')
        if obj.cover_photo and request:
            return request.build_absolute_uri(obj.cover_photo.url)
        return None


# ==================================================
# CANDIDATE
# ==================================================

class CandidateSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = (
            "id",
            "name",
            "email",
            "phone",
            "address",
            "availability",
            "summary",
            "skills",
            "experience",
            "education",
            "job_preferences",
            "resume",
            "resume_url",
            "profile_picture",
            "profile_picture_url",
            "cover_photo",
            "cover_photo_url",
            "created_at",
        )
        read_only_fields = ("id", "created_at", "resume_url", "profile_picture_url", "cover_photo_url", "resume", "profile_picture", "cover_photo", "email")

    def get_resume_url(self, obj):
        request = self.context.get('request')
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None
    
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def get_cover_photo_url(self, obj):
        request = self.context.get('request')
        if obj.cover_photo and request:
            return request.build_absolute_uri(obj.cover_photo.url)
        return None



# ==================================================
# PROFILE (READ-ONLY RESPONSE SERIALIZER)
# ==================================================

class ProfileSerializer(serializers.Serializer):
    """
    Response-only serializer.
    Used to return full profile in one API call.
    """

    user = UserSerializer()
    organization = OrganizationSerializer(allow_null=True)
    candidate = CandidateSerializer(allow_null=True)

class PublicCandidateSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = (
            "id",
            "user_id",
            "name",
            "email",
            "phone",
            "address",
            "availability",
            "summary",
            "skills",
            "experience",
            "education",
            "resume_url",
            "profile_picture_url",
            "cover_photo_url",
            "followers_count",
            "following_count",
        )

    def get_resume_url(self, obj):
        request = self.context.get("request")
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None
    
    def get_profile_picture_url(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def get_cover_photo_url(self, obj):
        request = self.context.get("request")
        if obj.cover_photo and request:
            return request.build_absolute_uri(obj.cover_photo.url)
        return None
    
    def get_followers_count(self, obj):
        return obj.user.get_followers_count()
    
    def get_following_count(self, obj):
        return obj.user.get_following_count()

class PublicOrganizationSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = (
            "id",
            "user_id",
            "name",
            "description",
            "location",
            "website",
            "profile_picture_url",
            "cover_photo_url",
            "followers_count",
            "following_count",
        )
    
    def get_profile_picture_url(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def get_cover_photo_url(self, obj):
        request = self.context.get("request")
        if obj.cover_photo and request:
            return request.build_absolute_uri(obj.cover_photo.url)
        return None
    
    def get_followers_count(self, obj):
        return obj.user.get_followers_count()
    
    def get_following_count(self, obj):
        return obj.user.get_following_count()

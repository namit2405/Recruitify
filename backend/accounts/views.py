from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
import os

from .models import Organization, Candidate, Follow
from .serializers import (
    RegisterSerializer,
    OrganizationSerializer,
    CandidateSerializer,
    PublicCandidateSerializer,
    PublicOrganizationSerializer, 
)
from .otp_manager import create_otp, send_otp_email, verify_otp

User = get_user_model()


# ==================================================
# JWT HELPER
# ==================================================

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "email": user.email,
            "user_type": user.user_type,
            "email_verified": user.email_verified,
            "mfa_enabled": user.mfa_enabled,
        },
    }


# ==================================================
# AUTH VIEWS
# ==================================================

class RegisterView(APIView):
    """
    Step 1: Register user and send OTP
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user but don't activate yet
        user = serializer.save()
        user.is_active = False  # Will be activated after OTP verification
        user.save()
        
        # Generate and send OTP
        otp_obj = create_otp(user.email, purpose='registration')
        email_sent = send_otp_email(user.email, otp_obj.otp_code, purpose='registration')
        
        if not email_sent:
            return Response(
                {"detail": "Failed to send verification email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "Registration successful. Please check your email for verification code.",
            "email": user.email,
            "requires_verification": True
        }, status=status.HTTP_201_CREATED)


class VerifyRegistrationOTPView(APIView):
    """
    Step 2: Verify OTP and activate user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp_code")
        
        if not email or not otp_code:
            return Response(
                {"detail": "Email and OTP code required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        success, message = verify_otp(email, otp_code, purpose='registration')
        
        if not success:
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        
        # Activate user and mark email as verified
        try:
            user = User.objects.get(email=email)
            user.is_active = True
            user.email_verified = True
            user.save()
            
            # Return tokens for immediate login
            return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ResendOTPView(APIView):
    """
    Resend OTP for registration or login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        purpose = request.data.get("purpose", "registration")  # 'registration' or 'login'
        
        if not email:
            return Response(
                {"detail": "Email required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate and send new OTP
        otp_obj = create_otp(email, purpose=purpose)
        email_sent = send_otp_email(email, otp_obj.otp_code, purpose=purpose)
        
        if not email_sent:
            return Response(
                {"detail": "Failed to send verification email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "Verification code sent successfully"
        }, status=status.HTTP_200_OK)


class LoginView(APIView):
    """
    Step 1: Authenticate credentials and send MFA OTP if enabled
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Check if email is verified
        if not user.email_verified:
            return Response(
                {"detail": "Email not verified. Please verify your email first."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if MFA is enabled
        if user.mfa_enabled:
            # Generate and send OTP
            otp_obj = create_otp(user.email, purpose='login')
            email_sent = send_otp_email(user.email, otp_obj.otp_code, purpose='login')
            
            if not email_sent:
                return Response(
                    {"detail": "Failed to send verification code. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response({
                "message": "Verification code sent to your email",
                "email": user.email,
                "requires_mfa": True
            }, status=status.HTTP_200_OK)
        
        # MFA not enabled, return tokens directly
        return Response(get_tokens_for_user(user))


class VerifyLoginOTPView(APIView):
    """
    Step 2: Verify MFA OTP and return tokens
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp_code")
        
        print(f"[VIEW DEBUG] VerifyLoginOTPView called")
        print(f"  Email: {email}")
        print(f"  OTP Code: {otp_code}")
        
        if not email or not otp_code:
            print(f"[VIEW DEBUG] Missing email or OTP code")
            return Response(
                {"detail": "Email and OTP code required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        print(f"[VIEW DEBUG] Calling verify_otp...")
        success, message = verify_otp(email, otp_code, purpose='login')
        print(f"[VIEW DEBUG] verify_otp returned: success={success}, message={message}")
        
        if not success:
            print(f"[VIEW DEBUG] Verification failed, returning error")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user and return tokens
        try:
            user = User.objects.get(email=email)
            print(f"[VIEW DEBUG] User found, generating tokens")
            return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            print(f"[VIEW DEBUG] User not found")
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================================================
# PROFILE (COMBINED READ)
# ==================================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "user_type": user.user_type,
            },
            "organization": (
                OrganizationSerializer(user.organization_profile, context={"request": request}).data
                if hasattr(user, "organization_profile")
                else None
            ),
            "candidate": (
                CandidateSerializer(user.candidate_profile, context={"request": request}).data
                if hasattr(user, "candidate_profile")
                else None
            ),
        })


# ==================================================
# ORGANIZATION PROFILE
# ==================================================

class OrganizationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "organization":
            return Response({"detail": "Forbidden"}, status=403)

        org, _ = Organization.objects.get_or_create(user=request.user)
        return Response(OrganizationSerializer(org, context={"request": request}).data)

    def post(self, request):
        if request.user.user_type != "organization":
            return Response({"detail": "Forbidden"}, status=403)

        org, _ = Organization.objects.get_or_create(user=request.user)
        serializer = OrganizationSerializer(org, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def patch(self, request):
        if request.user.user_type != "organization":
            return Response({"detail": "Forbidden"}, status=403)

        org, _ = Organization.objects.get_or_create(user=request.user)
        serializer = OrganizationSerializer(org, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ==================================================
# CANDIDATE PROFILE
# ==================================================

class CandidateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        serializer = CandidateSerializer(
            cand,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        serializer = CandidateSerializer(
            cand,
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def patch(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        serializer = CandidateSerializer(
            cand,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



# ==================================================
# RESUME UPLOAD (ML-READY)
# ==================================================

class CandidateResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        file = request.FILES.get("resume")
        if not file:
            return Response({"detail": "Resume required"}, status=400)

        if not file.name.lower().endswith(".pdf"):
            return Response({"detail": "Only PDF allowed"}, status=400)

        # 🔥 THIS IS THE IMPORTANT PART
        cand.resume = file
        cand.save()

        serializer = CandidateSerializer(
            cand,
            context={"request": request}
        )

        return Response(serializer.data, status=200)

class PublicCandidateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            candidate = Candidate.objects.get(pk=pk)
        except Candidate.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = PublicCandidateSerializer(
            candidate,
            context={"request": request}
        )
        return Response(serializer.data)
    
class PublicOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = PublicOrganizationSerializer(org, context={"request": request})
        return Response(serializer.data)




# ==================================================
# PROFILE PICTURE & COVER PHOTO UPLOAD
# ==================================================

class CandidateProfilePictureUploadView(APIView):
    """
    Upload profile picture for candidate
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        file = request.FILES.get("profile_picture")
        if not file:
            return Response({"detail": "Profile picture required"}, status=400)

        # Validate image file
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_ext = os.path.splitext(file.name)[1].lower()
        if file_ext not in allowed_extensions:
            return Response(
                {"detail": f"Only image files allowed: {', '.join(allowed_extensions)}"},
                status=400
            )

        cand.profile_picture = file
        cand.save()

        serializer = CandidateSerializer(cand, context={"request": request})
        return Response(serializer.data, status=200)


class CandidateCoverPhotoUploadView(APIView):
    """
    Upload cover photo for candidate
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != "candidate":
            return Response({"detail": "Forbidden"}, status=403)

        cand, _ = Candidate.objects.get_or_create(user=request.user)

        file = request.FILES.get("cover_photo")
        if not file:
            return Response({"detail": "Cover photo required"}, status=400)

        # Validate image file
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_ext = os.path.splitext(file.name)[1].lower()
        if file_ext not in allowed_extensions:
            return Response(
                {"detail": f"Only image files allowed: {', '.join(allowed_extensions)}"},
                status=400
            )

        cand.cover_photo = file
        cand.save()

        serializer = CandidateSerializer(cand, context={"request": request})
        return Response(serializer.data, status=200)


class OrganizationProfilePictureUploadView(APIView):
    """
    Upload profile picture for organization
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != "organization":
            return Response({"detail": "Forbidden"}, status=403)

        org, _ = Organization.objects.get_or_create(user=request.user)

        file = request.FILES.get("profile_picture")
        if not file:
            return Response({"detail": "Profile picture required"}, status=400)

        # Validate image file
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_ext = os.path.splitext(file.name)[1].lower()
        if file_ext not in allowed_extensions:
            return Response(
                {"detail": f"Only image files allowed: {', '.join(allowed_extensions)}"},
                status=400
            )

        org.profile_picture = file
        org.save()

        serializer = OrganizationSerializer(org, context={"request": request})
        return Response(serializer.data, status=200)


class OrganizationCoverPhotoUploadView(APIView):
    """
    Upload cover photo for organization
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != "organization":
            return Response({"detail": "Forbidden"}, status=403)

        org, _ = Organization.objects.get_or_create(user=request.user)

        file = request.FILES.get("cover_photo")
        if not file:
            return Response({"detail": "Cover photo required"}, status=400)

        # Validate image file
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_ext = os.path.splitext(file.name)[1].lower()
        if file_ext not in allowed_extensions:
            return Response(
                {"detail": f"Only image files allowed: {', '.join(allowed_extensions)}"},
                status=400
            )

        org.cover_photo = file
        org.save()

        serializer = OrganizationSerializer(org, context={"request": request})
        return Response(serializer.data, status=200)



# ======================================================
# FOLLOW/UNFOLLOW FUNCTIONALITY
# ======================================================

class FollowUserView(APIView):
    """Follow a user (candidate or organization)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            user_to_follow = User.objects.get(id=user_id)
            
            if request.user == user_to_follow:
                return Response(
                    {"detail": "Cannot follow yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Follow the user
            request.user.follow(user_to_follow)
            
            # Send notification
            try:
                from notifications.models import Notification
                
                # Get the follower's name
                if request.user.user_type == 'candidate':
                    follower_name = request.user.candidate_profile.name
                else:
                    follower_name = request.user.organization_profile.name
                
                Notification.objects.create(
                    user=user_to_follow,
                    title="New Follower",
                    message=f"{follower_name} started following you",
                    notification_type='follow',
                )
            except Exception as e:
                # Don't fail if notification fails
                print(f"Failed to send follow notification: {e}")
            
            return Response({
                "detail": "Followed successfully",
                "followers_count": user_to_follow.get_followers_count(),
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class UnfollowUserView(APIView):
    """Unfollow a user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            user_to_unfollow = User.objects.get(id=user_id)
            request.user.unfollow(user_to_unfollow)
            
            return Response({
                "detail": "Unfollowed successfully",
                "followers_count": user_to_unfollow.get_followers_count(),
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class FollowStatusView(APIView):
    """Get follow status and counts for a user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            is_following = request.user.is_following(user)
            followers_count = user.get_followers_count()
            following_count = user.get_following_count()
            
            return Response({
                "is_following": is_following,
                "followers_count": followers_count,
                "following_count": following_count,
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )



class FollowersListView(APIView):
    """Get list of followers for a user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Get all followers
            followers = Follow.objects.filter(following=user).select_related(
                'follower'
            ).order_by('-created_at')
            
            followers_data = []
            for follow in followers:
                follower_user = follow.follower
                
                if follower_user.user_type == 'candidate':
                    try:
                        profile = Candidate.objects.get(user=follower_user)
                        followers_data.append({
                            'user_id': follower_user.id,
                            'type': 'candidate',
                            'id': profile.id,
                            'name': profile.name,
                            'email': follower_user.email,
                            'profile_picture_url': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                        })
                    except Candidate.DoesNotExist:
                        # Skip if candidate profile doesn't exist
                        continue
                    except Exception as e:
                        print(f"Error processing candidate follower {follower_user.id}: {e}")
                        continue
                else:  # organization
                    try:
                        profile = Organization.objects.get(user=follower_user)
                        followers_data.append({
                            'user_id': follower_user.id,
                            'type': 'organization',
                            'id': profile.id,
                            'name': profile.name,
                            'email': follower_user.email,
                            'profile_picture_url': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                        })
                    except Organization.DoesNotExist:
                        # Skip if organization profile doesn't exist
                        continue
                    except Exception as e:
                        print(f"Error processing organization follower {follower_user.id}: {e}")
                        continue
            
            return Response({
                'followers': followers_data,
                'count': len(followers_data),
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in FollowersListView: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Internal server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FollowingListView(APIView):
    """Get list of users that a user is following"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            print(f"[DEBUG] FollowingListView called for user_id: {user_id}")
            user = User.objects.get(id=user_id)
            print(f"[DEBUG] User found: {user.email}, type: {user.user_type}")
            
            # Get all following
            following = Follow.objects.filter(follower=user).select_related(
                'following'
            ).order_by('-created_at')
            print(f"[DEBUG] Found {following.count()} following relationships")
            
            following_data = []
            for follow in following:
                following_user = follow.following
                print(f"[DEBUG] Processing following_user: {following_user.email}, type: {following_user.user_type}")
                
                if following_user.user_type == 'candidate':
                    try:
                        profile = Candidate.objects.get(user=following_user)
                        print(f"[DEBUG] Found candidate profile: {profile.name}")
                        following_data.append({
                            'user_id': following_user.id,
                            'type': 'candidate',
                            'id': profile.id,
                            'name': profile.name,
                            'email': following_user.email,
                            'profile_picture_url': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                        })
                    except Candidate.DoesNotExist:
                        print(f"[DEBUG] Candidate profile not found for user {following_user.id}")
                        continue
                    except Exception as e:
                        print(f"[ERROR] Error processing candidate following {following_user.id}: {e}")
                        import traceback
                        traceback.print_exc()
                        continue
                else:  # organization
                    try:
                        profile = Organization.objects.get(user=following_user)
                        print(f"[DEBUG] Found organization profile: {profile.name}")
                        following_data.append({
                            'user_id': following_user.id,
                            'type': 'organization',
                            'id': profile.id,
                            'name': profile.name,
                            'email': following_user.email,
                            'profile_picture_url': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                        })
                    except Organization.DoesNotExist:
                        print(f"[DEBUG] Organization profile not found for user {following_user.id}")
                        continue
                    except Exception as e:
                        print(f"[ERROR] Error processing organization following {following_user.id}: {e}")
                        import traceback
                        traceback.print_exc()
                        continue
            
            print(f"[DEBUG] Returning {len(following_data)} following entries")
            return Response({
                'following': following_data,
                'count': len(following_data),
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            print(f"[ERROR] User {user_id} not found")
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"[ERROR] Error in FollowingListView: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Internal server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

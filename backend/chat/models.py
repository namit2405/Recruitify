from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """
    Represents a chat conversation between two users
    """
    participant1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant1'
    )
    participant2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant2'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('participant1', 'participant2')
        indexes = [
            models.Index(fields=['participant1', 'participant2']),
            models.Index(fields=['updated_at']),
        ]
    
    def __str__(self):
        return f"Conversation between {self.participant1.email} and {self.participant2.email}"
    
    def get_other_participant(self, user):
        """Get the other participant in the conversation"""
        return self.participant2 if self.participant1 == user else self.participant1
    
    def get_last_message(self):
        """Get the most recent message in this conversation"""
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """
    Represents a single message in a conversation
    """
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
    ]
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)
    attachment_size = models.IntegerField(null=True, blank=True)  # Size in bytes
    
    # Reply functionality
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.email} at {self.created_at}"
    
    def get_attachment_url(self):
        """Get the full URL for the attachment"""
        if self.attachment:
            return self.attachment.url
        return None
    
    def is_image(self):
        """Check if attachment is an image"""
        if self.attachment and self.attachment_name:
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
            return any(self.attachment_name.lower().endswith(ext) for ext in image_extensions)
        return False


class UserStatus(models.Model):
    """
    Tracks user online/offline status
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='chat_status'
    )
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        status = "Online" if self.is_online else "Offline"
        return f"{self.user.email} - {status}"

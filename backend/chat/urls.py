from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation_list'),
    path('conversations/<int:user_id>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    
    # Messages
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message_list'),
    path('conversations/<int:conversation_id>/send-file/', views.SendFileMessageView.as_view(), name='send_file'),
    path('conversations/<int:conversation_id>/mark-read/', views.MarkMessagesReadView.as_view(), name='mark_read'),
    path('messages/<int:message_id>/delete/', views.DeleteMessageView.as_view(), name='delete_message'),
    
    # Unread count
    path('unread-count/', views.UnreadCountView.as_view(), name='unread_count'),
    
    # User status
    path('status/<int:user_id>/', views.UserStatusView.as_view(), name='user_status'),
]

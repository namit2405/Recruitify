import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@tanstack/react-router';
import { usePageTitle } from '../hooks/usePageTitle';
import { useGetConversations, useGetMessages, useGetUnreadCount } from '../hooks/useChatQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { sendFileMessage, sendMessage, markMessagesRead, deleteMessage } from '../lib/chatApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Send, ArrowLeft, Paperclip, Image as ImageIcon, X, Download, Reply, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

export default function ChatPage() {
  // Set page title
  usePageTitle('Messages');
  
  const search = useSearch({ from: '/chat' });
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: conversations, isLoading: conversationsLoading } = useGetConversations();
  const { data: messagesData, isLoading: messagesLoading } = useGetMessages(selectedConversation?.id);
  const { data: unreadData } = useGetUnreadCount();
  
  // WebSocket connection
  const { 
    isConnected, 
    sendMessage: sendWsMessage, 
    sendTypingIndicator,
    markMessagesRead: markWsMessagesRead,
    lastMessage
  } = useChatWebSocket();

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (search?.conversation && conversations) {
      const conv = conversations.find(c => c.id === parseInt(search.conversation));
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [search?.conversation, conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;
    
    const markAsRead = async () => {
      try {
        if (isConnected) {
          // Use WebSocket if available
          markWsMessagesRead(selectedConversation.id);
        } else {
          // Use REST API when WebSocket is not available
          await markMessagesRead(selectedConversation.id);
          // Refresh unread count
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    
    markAsRead();
  }, [selectedConversation?.id, isConnected, markWsMessagesRead, queryClient]);

  // Handle typing indicator from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'typing' && lastMessage.conversation_id === selectedConversation?.id) {
      setIsTyping(lastMessage.is_typing);
      
      // Clear typing indicator after 3 seconds
      if (lastMessage.is_typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    }
  }, [lastMessage, selectedConversation?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const content = messageInput.trim();
    const replyToId = replyingTo?.id || null;
    setMessageInput('');
    setReplyingTo(null);

    // Try WebSocket first, fallback to REST API
    if (isConnected) {
      sendWsMessage(selectedConversation.id, content);
      sendTypingIndicator(selectedConversation.id, false);
    } else {
      // Use REST API when WebSocket is not available
      try {
        await sendMessage(selectedConversation.id, content, replyToId);
        // Refresh messages to show the new message
        queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch (error) {
        console.error('Error sending message:', error);
        // Check if message was actually sent despite the error
        queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // Only show alert if it's a real error (not just a response parsing issue)
        if (!error.message.includes('Internal Server Error')) {
          setMessageInput(content); // Restore the message
          alert(`Failed to send message: ${error.message || 'Unknown error'}`);
        }
      }
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (selectedConversation && isConnected) {
      sendTypingIndicator(selectedConversation.id, e.target.value.length > 0);
    }
  };

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleTimeString();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation) return;

    setIsUploading(true);
    try {
      await sendFileMessage(selectedConversation.id, selectedFile, messageInput);
      
      // Clear inputs
      setSelectedFile(null);
      setFilePreview(null);
      setMessageInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      console.error('Error sending file:', error);
      // Refresh anyway in case file was sent despite error
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Only show alert for real errors
      if (!error.message.includes('JSON')) {
        alert(error.message || 'Failed to send file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus on input (optional)
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage(messageId);
      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
          <div className="grid md:grid-cols-3 gap-4 h-full">
            {/* Conversations List */}
            <Card className="md:col-span-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </h2>
                  {unreadData && unreadData.unread_count > 0 && (
                    <Badge variant="destructive">
                      {unreadData.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={conv.other_participant?.profile_picture_url} />
                            <AvatarFallback>
                              {conv.other_participant?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-semibold truncate">
                                {conv.other_participant?.name || conv.other_participant?.email}
                              </p>
                              {conv.unread_count > 0 && (
                                <Badge variant="destructive" className="ml-2 shrink-0">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message?.content || 'No messages yet'}
                            </p>
                            {conv.last_message?.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatMessageTime(conv.last_message.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                    <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Visit a user profile and click "Message" to start chatting</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Messages */}
            <Card className="md:col-span-2 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    <Avatar>
                      <AvatarImage src={selectedConversation.other_participant?.profile_picture_url} />
                      <AvatarFallback>
                        {selectedConversation.other_participant?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {selectedConversation.other_participant?.name || selectedConversation.other_participant?.email}
                      </h3>
                      {isTyping && (
                        <p className="text-sm text-muted-foreground">typing...</p>
                      )}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : messagesData?.results && messagesData.results.length > 0 ? (
                      <>
                        {[...messagesData.results].reverse().map((message) => {
                          // Compare message sender ID with current user ID
                          const currentUserId = userProfile?.user?.id;
                          const isOwnMessage = message.sender.id === currentUserId;
                          const isDeleted = message.is_deleted;
                          
                          return (
                            <div
                              key={message.id}
                              className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isOwnMessage && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.sender.profile_picture_url} />
                                    <AvatarFallback>{message.sender.name?.charAt(0) || '?'}</AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className="flex-1">
                                  <div
                                    className={`rounded-2xl px-4 py-2 ${
                                      isOwnMessage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-background border'
                                    } ${isDeleted ? 'opacity-60 italic' : ''}`}
                                  >
                                    {/* Reply preview */}
                                    {message.reply_to_message && !isDeleted && (
                                      <div className={`mb-2 p-2 rounded border-l-2 ${
                                        isOwnMessage ? 'bg-blue-700 border-blue-400' : 'bg-muted border-gray-400'
                                      }`}>
                                        <p className="text-xs opacity-75 mb-1">
                                          {message.reply_to_message.sender.name || message.reply_to_message.sender.email}
                                        </p>
                                        <p className="text-xs opacity-90 truncate">
                                          {message.reply_to_message.message_type === 'image' && '📷 Image'}
                                          {message.reply_to_message.message_type === 'file' && `📎 ${message.reply_to_message.attachment_name}`}
                                          {message.reply_to_message.message_type === 'text' && message.reply_to_message.content}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Deleted message */}
                                    {isDeleted ? (
                                      <p className="text-sm">Message deleted</p>
                                    ) : (
                                      <>
                                        {/* Image message */}
                                        {message.message_type === 'image' && message.attachment_url && (
                                          <div className="space-y-2">
                                            <img
                                              src={message.attachment_url}
                                              alt={message.attachment_name}
                                              className="rounded-lg max-w-full h-auto max-h-64 object-contain cursor-pointer"
                                              onClick={() => window.open(message.attachment_url, '_blank')}
                                            />
                                            {message.content && (
                                              <p className="text-sm break-words">{message.content}</p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* File message */}
                                        {message.message_type === 'file' && message.attachment_url && (
                                          <div className="space-y-2">
                                            <a
                                              href={message.attachment_url}
                                              download={message.attachment_name}
                                              className={`flex items-center gap-2 p-2 rounded ${
                                                isOwnMessage ? 'bg-blue-700' : 'bg-muted'
                                              } hover:opacity-80 transition-opacity`}
                                            >
                                              <Paperclip className="h-4 w-4" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{message.attachment_name}</p>
                                                {message.attachment_size && (
                                                  <p className="text-xs opacity-75">{formatFileSize(message.attachment_size)}</p>
                                                )}
                                              </div>
                                              <Download className="h-4 w-4" />
                                            </a>
                                            {message.content && (
                                              <p className="text-sm break-words">{message.content}</p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Text message */}
                                        {message.message_type === 'text' && (
                                          <p className="text-sm break-words">{message.content}</p>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Message actions and timestamp */}
                                  <div className={`flex items-center gap-2 mt-1 px-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <p className="text-xs text-muted-foreground">
                                      {formatMessageTime(message.created_at)}
                                    </p>
                                    
                                    {/* Action buttons - show on hover */}
                                    {!isDeleted && (
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleReply(message)}
                                          title="Reply"
                                        >
                                          <Reply className="h-3 w-3" />
                                        </Button>
                                        {isOwnMessage && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-600"
                                            onClick={() => handleDeleteMessage(message.id)}
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-2">Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                    {/* Reply preview */}
                    {replyingTo && (
                      <div className="mb-3 p-3 bg-muted rounded-lg flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Reply className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              Replying to {replyingTo.sender.name || replyingTo.sender.email}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {replyingTo.message_type === 'image' && '📷 Image'}
                            {replyingTo.message_type === 'file' && `📎 ${replyingTo.attachment_name}`}
                            {replyingTo.message_type === 'text' && replyingTo.content}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelReply}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* File preview */}
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-3">
                          {filePreview ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-background rounded flex items-center justify-center">
                              <Paperclip className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        value={messageInput}
                        onChange={handleTyping}
                        placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."}
                        disabled={isUploading}
                        className="flex-1"
                      />
                      <Button
                        type={selectedFile ? "button" : "submit"}
                        onClick={selectedFile ? handleSendFile : undefined}
                        disabled={(!messageInput.trim() && !selectedFile) || isUploading}
                        size="icon"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {!isConnected && (
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Real-time messaging disabled. Refresh page to see new messages.
                      </p>
                    )}
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-2">Choose a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

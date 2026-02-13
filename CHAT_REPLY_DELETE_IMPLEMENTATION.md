# Chat Reply & Delete Features - Implementation Guide

## Backend Changes ✅ COMPLETE

### 1. Database Schema
- Added `reply_to` field (ForeignKey to self)
- Added `is_deleted` boolean field
- Added `deleted_at` timestamp
- Added `updated_at` timestamp
- Migration created and applied: `0003_message_reply_delete.py`

### 2. API Endpoints
- **POST** `/api/chat/conversations/<id>/messages/` - Now accepts `reply_to` parameter
- **DELETE** `/api/chat/messages/<id>/delete/` - Soft delete a message

### 3. Serializer Updates
- Added `reply_to_message` field with nested message data
- Shows sender, content preview, and message type of replied message
- Hides deleted messages in replies

### 4. Business Logic
- Only message sender can delete their own messages
- Soft delete (marks as deleted, clears content)
- Reply validation (must be in same conversation)
- Deleted messages show as "Message deleted"

## Frontend Changes 🚧 IN PROGRESS

### 1. State Management
- Added `replyingTo` state to track message being replied to
- Import `deleteMessage` API function

### 2. Message Actions
- Reply button - Sets message as reply target
- Delete button - Soft deletes message (own messages only)
- Cancel reply - Clears reply target

### 3. UI Components Needed
- Reply preview bar (shows who you're replying to)
- Quoted message in sent messages
- Action buttons (reply, delete) on hover/long-press
- Deleted message placeholder

## Next Steps

1. Update message rendering to show:
   - Reply preview when replying
   - Quoted message in messages with replies
   - Action buttons (Reply, Delete)
   - Deleted message state

2. Add icons for actions (Reply, Trash icons from lucide-react)

3. Style improvements:
   - Reply bar with close button
   - Hover effects for action buttons
   - Deleted message styling

## Usage

### Reply to a Message
1. Click/tap reply button on any message
2. Reply preview appears above input
3. Type your message
4. Send - message will include reply reference

### Delete a Message
1. Click/tap delete button on your own message
2. Confirm deletion
3. Message shows as "Message deleted"
4. Original content is cleared

## Features
✅ Soft delete (preserves message structure)
✅ Reply threading (one level)
✅ Permission checks (only delete own messages)
✅ Reply preview in messages
✅ Graceful error handling
✅ Real-time updates via query invalidation

## Migration Status
✅ Migration applied successfully
✅ Database schema updated
✅ API endpoints working
🚧 Frontend UI in progress

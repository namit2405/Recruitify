# Chat Feature - Complete with Reply & Delete

## ✅ ALL FEATURES IMPLEMENTED

### Core Messaging
- ✅ Text messages
- ✅ Image sharing (inline display)
- ✅ File sharing (download cards)
- ✅ Message history with pagination
- ✅ Unread message counts
- ✅ Auto mark as read when viewing
- ✅ Timestamps (relative time)

### Advanced Features
- ✅ **Reply to messages** - Quote any message when replying
- ✅ **Delete messages** - Soft delete your own messages
- ✅ **Message actions** - Hover to see Reply/Delete buttons
- ✅ **Reply preview** - Shows quoted message in replies
- ✅ **Reply bar** - Shows who you're replying to with cancel option
- ✅ **Deleted state** - Shows "Message deleted" for removed messages

## UI Features

### Message Display
- **Own messages**: Right side, blue background
- **Other messages**: Left side, white background with border
- **Avatars**: Show for received messages
- **Hover actions**: Reply and Delete buttons appear on hover
- **Reply preview**: Quoted message shown above reply content
- **Deleted messages**: Grayed out with "Message deleted" text

### Reply Functionality
1. Hover over any message
2. Click Reply button (↩️ icon)
3. Reply preview bar appears above input
4. Type your message
5. Send - message includes reply reference
6. Quoted message shows in sent message

### Delete Functionality
1. Hover over your own message
2. Click Delete button (🗑️ icon)
3. Confirm deletion
4. Message shows as "Message deleted"
5. Content is cleared (soft delete)

### Reply Preview Bar
- Shows sender name
- Shows message preview (text/image/file)
- Cancel button (X) to clear reply
- Appears above input area

## Technical Implementation

### Backend
- **Models**: `reply_to` ForeignKey, `is_deleted` boolean, `deleted_at` timestamp
- **API**: POST with `reply_to` parameter, DELETE endpoint
- **Serializer**: Includes `reply_to_message` with nested data
- **Permissions**: Only sender can delete their own messages
- **Soft delete**: Preserves message structure, clears content

### Frontend
- **State**: `replyingTo` tracks message being replied to
- **Handlers**: `handleReply()`, `handleDeleteMessage()`, `handleCancelReply()`
- **UI**: Action buttons with hover effects
- **Icons**: Reply (↩️) and Trash (🗑️) from lucide-react
- **Styling**: Group hover for smooth UX

## Usage Examples

### Reply to a Text Message
```
User A: "How are you?"
User B: [Clicks Reply]
        [Reply bar shows: "Replying to User A: How are you?"]
        Types: "I'm good, thanks!"
        [Sends]
Result: Message shows with quoted text above
```

### Reply to an Image
```
User A: [Sends image]
User B: [Clicks Reply on image]
        [Reply bar shows: "Replying to User A: 📷 Image"]
        Types: "Nice photo!"
        [Sends]
Result: Message shows with image indicator in quote
```

### Delete a Message
```
User A: [Sends "Hello"]
        [Hovers over message]
        [Clicks Delete button]
        [Confirms]
Result: Message shows "Message deleted" in gray italic text
```

## Database Schema

```sql
Message:
- id (PK)
- conversation_id (FK)
- sender_id (FK)
- content (text, can be empty)
- message_type (text/image/file)
- attachment (file)
- attachment_name (varchar)
- attachment_size (int)
- reply_to_id (FK to Message, nullable)
- is_deleted (boolean, default false)
- deleted_at (timestamp, nullable)
- is_read (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### Send Message with Reply
```http
POST /api/chat/conversations/{id}/messages/
Content-Type: application/json

{
  "content": "Your message",
  "reply_to": 123  // Optional: ID of message being replied to
}
```

### Delete Message
```http
DELETE /api/chat/messages/{id}/delete/
```

Response:
```json
{
  "detail": "Message deleted successfully"
}
```

## Styling Details

### Action Buttons
- Hidden by default
- Appear on message hover (group-hover)
- Small size (h-6 w-6)
- Reply button: Default color
- Delete button: Red color (text-red-500)
- Smooth opacity transition

### Reply Preview in Message
- Border-left accent (2px)
- Slightly darker background
- Sender name in small text
- Content truncated if long
- Different colors for own/other messages

### Reply Bar Above Input
- Muted background
- Reply icon (↩️)
- Sender name
- Message preview (truncated)
- Cancel button (X)
- Rounded corners

### Deleted Messages
- 60% opacity
- Italic text
- "Message deleted" placeholder
- No action buttons
- Timestamp still visible

## Features Comparison

| Feature | Status | Notes |
|---------|--------|-------|
| Text messages | ✅ | Full support |
| Image sharing | ✅ | Inline display, click to enlarge |
| File sharing | ✅ | Download cards with size |
| Reply to messages | ✅ | One-level threading |
| Delete messages | ✅ | Soft delete, own messages only |
| Edit messages | ❌ | Not implemented |
| Forward messages | ❌ | Not implemented |
| Message reactions | ❌ | Not implemented |
| Voice messages | ❌ | Not implemented |
| Video calls | ❌ | Not implemented |

## Testing Checklist

✅ Send text message
✅ Send image
✅ Send file
✅ Reply to text message
✅ Reply to image
✅ Reply to file
✅ Delete own message
✅ Try to delete other's message (should not show button)
✅ Cancel reply
✅ View deleted message
✅ Reply to deleted message (should work)
✅ Hover to see action buttons
✅ Mobile responsive
✅ Unread counts update
✅ Messages refresh after actions

## Known Limitations

- Reply threading is one level only (no nested replies)
- Deleted messages can still be replied to (shows "Message deleted" in quote)
- No edit functionality (would need additional fields)
- No message reactions/emojis
- No message search
- No message pinning

## Future Enhancements

- [ ] Edit messages (within time limit)
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Forward messages to other conversations
- [ ] Message search functionality
- [ ] Pin important messages
- [ ] Multi-level reply threading
- [ ] Message read receipts (seen by)
- [ ] Voice messages
- [ ] Video/audio calls
- [ ] Group chats
- [ ] Message encryption

## Summary

The chat feature is now complete with professional-grade reply and delete functionality. Users can:
- Reply to any message with visual quote preview
- Delete their own messages (soft delete)
- See action buttons on hover
- Cancel replies before sending
- View deleted messages as placeholders

All features work seamlessly with the existing text, image, and file sharing capabilities!

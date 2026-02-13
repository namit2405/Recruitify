# WebSocket Setup Guide

## Current Status

✅ File sharing feature is fully implemented and working
✅ Migration applied successfully
✅ REST API endpoints working

⚠️ WebSocket real-time features are temporarily disabled (requires package installation)

## To Enable WebSocket Features

WebSocket support requires `channels` and `daphne` packages. Follow these steps:

### 1. Install Required Packages

```bash
cd ProjectCode/backend
pip install daphne channels
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### 2. Enable WebSocket Configuration

After installing the packages, uncomment these lines in `ProjectCode/backend/recruitify_backend/settings.py`:

**INSTALLED_APPS** (around line 20):
```python
INSTALLED_APPS = [
    'daphne',  # Uncomment this line
    'django.contrib.admin',
    # ... other apps ...
    'channels',  # Uncomment this line
    # ... rest of apps ...
]
```

**ASGI Configuration** (around line 148):
```python
ASGI_APPLICATION = 'recruitify_backend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}
```

### 3. Restart the Server

```bash
python manage.py runserver
```

Or use Daphne for better WebSocket support:
```bash
daphne -b 0.0.0.0 -p 8000 recruitify_backend.asgi:application
```

## What Works Without WebSocket

Even without WebSocket packages installed, the following features work perfectly:

✅ **Text messaging** - Send and receive text messages
✅ **File sharing** - Upload and download images/files
✅ **Image display** - View images inline in chat
✅ **File downloads** - Download shared files
✅ **Message history** - View all past messages
✅ **Conversations list** - See all your conversations
✅ **Unread counts** - Track unread messages

The only difference is that you need to refresh the page to see new messages instead of receiving them in real-time.

## What Requires WebSocket

These features require WebSocket to be enabled:

- ⏱️ Real-time message delivery (instant updates without refresh)
- ⏱️ Typing indicators ("User is typing...")
- ⏱️ Online/offline status
- ⏱️ Read receipts (instant notification when messages are read)
- ⏱️ Automatic reconnection

## Testing Without WebSocket

You can still test the chat feature:

1. Open chat in two different browsers/windows
2. Send messages from one window
3. Refresh the other window to see new messages
4. Upload files and images - they work immediately
5. Download shared files

## Production Recommendations

For production deployment with WebSocket support:

1. **Use Redis for Channel Layers** (better performance):
   ```python
   CHANNEL_LAYERS = {
       'default': {
           'BACKEND': 'channels_redis.core.RedisChannelLayer',
           'CONFIG': {
               "hosts": [('127.0.0.1', 6379)],
           },
       },
   }
   ```

2. **Install Redis**:
   ```bash
   pip install channels-redis
   ```

3. **Use Daphne or Uvicorn** as ASGI server instead of Django's development server

4. **Configure proper WebSocket URL** in production (wss:// instead of ws://)

## Troubleshooting

**Error: "ModuleNotFoundError: No module named 'daphne'"**
- Solution: Run `pip install daphne channels`

**Error: "WebSocket connection failed"**
- Make sure daphne and channels are installed
- Check that ASGI_APPLICATION is uncommented in settings
- Verify server is running

**Messages not appearing in real-time**
- This is expected without WebSocket packages
- Simply refresh the page to see new messages
- Or install the packages to enable real-time updates

## Summary

The chat feature with file sharing is fully functional. WebSocket packages are optional and only needed for real-time features. You can use the chat perfectly fine without them by refreshing to see new messages.

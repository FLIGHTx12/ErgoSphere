# Casino Real-Time Synchronization Implementation

## Overview
This implementation adds real-time synchronization to the ErgoSphere Casino system, ensuring that all users see the same bet log data regardless of which browser they're using. The system uses WebSockets for real-time communication with a fallback to polling for reliability.

## Architecture

### Server-Side Components

#### 1. WebSocket Server (server.js)
- **WebSocket Server**: Added using the `ws` library
- **Connection Management**: Tracks connected clients in a `Set`
- **Broadcasting**: `broadcastToClients()` function sends messages to all connected clients
- **Health Checks**: Ping/pong mechanism for connection monitoring

#### 2. Enhanced API Routes (routes/bets.js)
- **Bet Creation**: Broadcasts `bet_created` messages when new bets are added
- **Bet Updates**: Broadcasts `bet_updated` messages when bet status changes
- **Bet Deletion**: Broadcasts `bet_deleted` messages when bets are removed
- **Message Format**: Consistent JSON structure with type, data, weekKey, and timestamp

### Client-Side Components

#### 1. Casino Sync Manager (js/casino-sync.js)
- **WebSocket Connection**: Primary real-time communication method
- **Fallback Polling**: 5-second intervals when WebSocket unavailable
- **Auto-Reconnection**: Exponential backoff strategy for failed connections
- **Visual Notifications**: Toast-style notifications for updates and connection status
- **Week-Specific Updates**: Only processes updates for the current betting week
- **Page Visibility**: Pauses/resumes based on tab focus to save resources

#### 2. Integration Points (js/casino.js)
- **Bet Submission**: `logSubmittedBet()` notifies sync manager of new bets
- **Status Updates**: Local and database bet status changes trigger sync notifications
- **Bet Deletion**: Individual and bulk bet deletions notify sync manager
- **Auto-Refresh**: `renderBetLog()` called automatically when updates received

## Key Features

### Real-Time Updates
- **Instant Synchronization**: Changes appear immediately across all connected browsers
- **Multi-User Support**: All users see the same data simultaneously
- **Cross-Session Sync**: Works across different user sessions and devices

### Reliability
- **Hybrid Storage**: Maintains both localStorage and database storage
- **Connection Resilience**: Automatic reconnection with exponential backoff
- **Graceful Degradation**: Falls back to polling if WebSocket fails
- **Error Handling**: Comprehensive error handling and logging

### User Experience
- **Visual Feedback**: Connection status indicators and update notifications
- **Non-Intrusive**: Updates happen seamlessly without user interaction
- **Performance Optimized**: Efficient message handling and resource management

## Message Types

### WebSocket Messages

#### bet_created
```json
{
  "type": "bet_created",
  "data": {
    "id": "123",
    "user_name": "FLIGHTx12!",
    "league": "NFL",
    "away_team": "Team A",
    "home_team": "Team B",
    "bet_data": { /* bet details */ }
  },
  "weekKey": "2024-12-01",
  "timestamp": "2024-12-01T10:30:00.000Z"
}
```

#### bet_updated
```json
{
  "type": "bet_updated",
  "data": {
    "id": "123",
    "bet_status": { "0": "won", "1": "lost" },
    "payout_data": { /* payout details */ }
  },
  "weekKey": "2024-12-01",
  "updateType": "status",
  "timestamp": "2024-12-01T10:35:00.000Z"
}
```

#### bet_deleted
```json
{
  "type": "bet_deleted",
  "data": {
    "id": "123",
    "user_name": "FLIGHTx12!"
  },
  "weekKey": "2024-12-01",
  "timestamp": "2024-12-01T10:40:00.000Z"
}
```

## Installation and Setup

### Dependencies
```bash
npm install ws
```

### Files Modified
1. **server.js** - Added WebSocket server and broadcasting
2. **routes/bets.js** - Added WebSocket notifications to all CRUD operations
3. **pages/casino.html** - Included casino-sync.js script
4. **js/casino.js** - Integrated sync manager notifications

### Files Added
1. **js/casino-sync.js** - Main synchronization manager
2. **pages/casino-sync-test.html** - Testing interface
3. **test-websocket.js** - WebSocket connection test script

## Testing

### Manual Testing
1. Open multiple browser windows to `/pages/casino.html`
2. Submit bets in one window
3. Verify they appear immediately in other windows
4. Test bet status updates and deletions

### Automated Testing
1. Use the test page at `/pages/casino-sync-test.html`
2. Monitor connection status and message flow
3. Simulate different message types
4. Test reconnection scenarios

### WebSocket Testing
```bash
node test-websocket.js
```

## Configuration

### WebSocket Settings (casino-sync.js)
- **Reconnection Delay**: 1-30 seconds (exponential backoff)
- **Polling Interval**: 5 seconds (fallback mode)
- **Max Reconnection Attempts**: Unlimited
- **Notification Duration**: 3 seconds

### Server Settings (server.js)
- **WebSocket Port**: Same as HTTP server (default 3000)
- **Connection Timeout**: Browser default
- **Message Size Limit**: Default ws library limits

## Troubleshooting

### Common Issues

#### WebSocket Connection Fails
- Check if port 3000 is accessible
- Verify firewall settings
- Check browser console for errors

#### Updates Not Syncing
- Verify sync manager is initialized
- Check browser network tab for WebSocket traffic
- Ensure both localStorage and database are functioning

#### Performance Issues
- Monitor number of connected clients
- Check for memory leaks in long-running connections
- Verify polling fallback isn't overloading server

### Debug Mode
Enable debug logging in casino-sync.js by setting:
```javascript
this.debug = true;
```

## Future Enhancements

### Potential Improvements
1. **Authentication**: User-specific message filtering
2. **Room-Based Sync**: Separate sync channels for different leagues/weeks
3. **Conflict Resolution**: Handle simultaneous edits gracefully
4. **Compression**: Message compression for better performance
5. **Analytics**: Track sync performance and usage statistics

### Scalability Considerations
1. **Redis Integration**: For multi-server deployments
2. **Load Balancing**: WebSocket-aware load balancer configuration
3. **Database Optimization**: Indexed queries for bet retrieval
4. **CDN Integration**: Static asset optimization

## Security Notes

### Current Implementation
- No authentication on WebSocket connections
- All connected clients receive all messages
- Client-side message validation only

### Production Recommendations
1. Implement WebSocket authentication
2. Add message encryption for sensitive data
3. Rate limiting for message broadcasting
4. Input validation on all WebSocket messages
5. CORS configuration for WebSocket endpoints

## Performance Metrics

### Expected Performance
- **Message Latency**: < 100ms for local connections
- **Connection Overhead**: ~1KB per connected client
- **Database Impact**: Minimal (only on actual bet changes)
- **Memory Usage**: ~10MB base + 1KB per connected client

### Monitoring
- WebSocket connection count
- Message broadcast frequency
- Reconnection rates
- Polling fallback usage

This implementation provides a robust, scalable foundation for real-time casino bet synchronization while maintaining backward compatibility with existing localStorage-based functionality.

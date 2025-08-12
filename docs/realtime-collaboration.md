# Real-Time Collaboration Features

## Overview

The Core Render Portal now includes comprehensive real-time collaboration features that enable multiple users to work on projects simultaneously with live updates, notifications, and change tracking.

## 🚀 Features

### **1. Real-Time Updates**
- **Live Project Changes**: All project modifications are reflected in real-time across all connected users
- **WebSocket Connections**: Uses Supabase Realtime for instant updates
- **Connection Status**: Visual indicators show when real-time updates are active
- **Auto-refresh**: Fallback polling when WebSocket connection is lost

### **2. Smart Notifications**
- **In-App Notifications**: Real-time notifications for project changes
- **Email Notifications**: Email alerts sent to collaborators for major changes
- **Notification Types**: Success, Info, Warning, and Error notifications
- **Action Buttons**: Notifications can include action buttons to navigate to relevant sections

### **3. Change Tracking**
- **Activity Logs**: All changes are logged with timestamps and user information
- **Change Details**: Detailed information about what was changed
- **User Attribution**: Track who made each change
- **Change History**: Complete audit trail of project modifications

### **4. Collaboration Indicators**
- **Online Status**: Shows when real-time updates are active
- **Last Update Time**: Displays when the project was last modified
- **Manual Refresh**: Button to manually refresh project data
- **Connection Health**: Visual feedback on connection quality

## 🔧 Technical Implementation

### **Real-Time Hooks**

#### `useRealtimeProject(projectId)`
```typescript
const { project, logs, collaborators, isOnline, lastUpdate, loading, error, refresh } = useRealtimeProject(projectId)
```

**Features:**
- Fetches initial project data
- Sets up WebSocket subscriptions for real-time updates
- Handles connection status
- Provides manual refresh function

#### `useNotifications()`
```typescript
const { notifications, unreadCount, addNotification, markAsRead, clearAll } = useNotifications()
```

**Features:**
- Manages in-app notifications
- Tracks unread count
- Auto-removes temporary notifications
- Provides notification actions

#### `useRealtimeNotifications(projectId)`
```typescript
const { project, logs, collaborators, isOnline, lastUpdate, loading, error, refresh } = useRealtimeNotifications(projectId)
```

**Features:**
- Combines real-time data with notifications
- Automatically creates notifications for changes
- Tracks connection status changes
- Provides unified interface for real-time features

### **Database Subscriptions**

The system subscribes to these Supabase tables:
- `projects` - Project data changes
- `project_logs` - Activity log entries
- `project_collaborators` - Collaboration changes

### **Email Notifications**

#### API Endpoint: `/api/notify-collaborators`
```typescript
POST /api/notify-collaborators
{
  projectId: string,
  projectTitle: string,
  action: string,
  details: string,
  changedBy: string,
  changedByEmail: string
}
```

**Features:**
- Sends emails to all project collaborators (except the person who made the change)
- Includes detailed change information
- Uses Resend for reliable email delivery
- Handles email delivery errors gracefully

## 🎯 User Experience

### **Real-Time Status Bar**
- **Connection Indicator**: Green WiFi icon when connected, red when offline
- **Live Badge**: Shows "Live" when real-time updates are active
- **Last Update**: Shows time since last update (e.g., "2s ago", "5m ago")
- **Refresh Button**: Manual refresh option

### **Notification Bell**
- **Unread Count**: Badge showing number of unread notifications
- **Notification Types**: Color-coded icons for different notification types
- **Action Buttons**: Click to navigate to relevant sections
- **Mark as Read**: Individual and bulk read actions
- **Auto-cleanup**: Temporary notifications auto-remove after 10 seconds

### **Change Notifications**
- **Project Updates**: Notified when project title, retailer, or items change
- **Activity Logs**: Notified when new log entries are created
- **Collaboration Changes**: Notified when collaborators are added/removed
- **Connection Status**: Notified when real-time connection is lost/restored

## 📊 Notification Types

### **Success Notifications**
- Project restored successfully
- New collaborator added
- Connection restored
- Item added to project

### **Info Notifications**
- Project updated
- Item modified
- General activity

### **Warning Notifications**
- Connection lost
- Collaborator removed
- Real-time updates disabled

### **Error Notifications**
- Failed to update project
- Connection errors
- Data sync issues

## 🔄 Real-Time Events

### **Project Changes**
```typescript
// Triggers when project data is updated
{
  event: 'UPDATE',
  table: 'projects',
  filter: `id=eq.${projectId}`
}
```

### **Activity Logs**
```typescript
// Triggers when new log entries are created
{
  event: 'INSERT',
  table: 'project_logs',
  filter: `project_id=eq.${projectId}`
}
```

### **Collaboration Changes**
```typescript
// Triggers when collaborators are added/removed
{
  event: '*',
  table: 'project_collaborators',
  filter: `project_id=eq.${projectId}`
}
```

## 🛠️ Configuration

### **Environment Variables**
```env
# Required for email notifications
RESEND_API_KEY=your_resend_api_key

# Supabase configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **Database Requirements**
- Supabase Realtime must be enabled for the following tables:
  - `projects`
  - `project_logs`
  - `project_collaborators`

## 🎨 UI Components

### **RealtimeStatus**
```tsx
<RealtimeStatus 
  isOnline={isOnline}
  lastUpdate={lastUpdate}
  onRefresh={refresh}
/>
```

### **NotificationBell**
```tsx
<NotificationBell className="ml-4" />
```

## 🚀 Benefits

### **For Users**
- **Instant Updates**: See changes as they happen
- **Better Collaboration**: Know when others are working
- **Change Awareness**: Never miss important updates
- **Reduced Conflicts**: Real-time awareness prevents conflicts

### **For Teams**
- **Improved Communication**: Automatic notifications keep everyone informed
- **Audit Trail**: Complete history of all changes
- **Remote Collaboration**: Work together from anywhere
- **Quality Assurance**: Track who made what changes

### **For Project Management**
- **Activity Monitoring**: Track project activity in real-time
- **Change Tracking**: Complete audit trail
- **Collaboration Metrics**: Understand team engagement
- **Issue Prevention**: Early detection of potential conflicts

## 🔮 Future Enhancements

### **Planned Features**
- **Cursor Positions**: Show where other users are working
- **Conflict Resolution**: Handle simultaneous edits
- **Presence Indicators**: Show who's currently viewing the project
- **Chat Integration**: In-project messaging
- **Version Control**: Advanced versioning with diff views
- **Mobile Notifications**: Push notifications for mobile devices

### **Advanced Features**
- **Offline Support**: Queue changes when offline
- **Conflict Detection**: Prevent conflicting changes
- **Selective Notifications**: Customize notification preferences
- **Integration APIs**: Connect with external tools
- **Analytics Dashboard**: Collaboration metrics and insights 
# Project Restore Functionality

## Overview

The Core Render Portal now supports restoring projects to previous versions. This feature allows users to revert their projects to any previous state based on the project history logs.

## How It Works

### 1. Version History Tracking
- Every time a project is updated, the system automatically logs the change
- The log entry contains:
  - `previous_data`: The complete project state before the change
  - `new_data`: The complete project state after the change
  - `changes`: A summary of what changed (title, retailer, items count)
  - `timestamp`: When the change occurred

### 2. Restore Process
When a user clicks "Restore" on a project log entry:

1. **Validation**: The system checks if the log entry has `previous_data` available
2. **Confirmation**: A dialog asks the user to confirm the restore action
3. **Restoration**: The project is updated with the `previous_data` from the selected log entry
4. **Logging**: A new log entry is created to track the restore action
5. **Refresh**: The project data and logs are refreshed to show the current state

### 3. Restore Limitations
- Only `project_updated` actions can be restored from
- The log entry must have `previous_data` available
- Restore actions are logged as `project_restored` entries
- Users cannot restore from restore actions (to prevent infinite loops)

## User Interface

### Project History Section
- Shows all project activity in chronological order
- Each log entry displays:
  - Action type (Project Updated, Project Restored)
  - Timestamp
  - Summary of changes (if any)
  - "View Changes" button for detailed change information
  - "Restore" button (only for restorable entries)

### Restore Button
- Only appears for `project_updated` entries that have previous data
- Opens a confirmation dialog
- Shows the timestamp of the version being restored to

### Confirmation Dialog
- Displays the timestamp of the version being restored
- Warns that the action cannot be undone
- Has "Cancel" and "Restore" buttons

## Technical Implementation

### Database Schema
The `project_logs` table stores:
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key to projects)
- user_id: UUID (who made the change)
- action: TEXT (project_updated, project_restored)
- details: JSONB (previous_data, new_data, changes, restored_from_log_id)
- timestamp: TIMESTAMP
```

### Key Components

1. **useProject Hook** (`hooks/useProject.ts`)
   - `restoreProject()` function handles the restore logic
   - Validates log entry and previous data
   - Updates project with previous state
   - Logs the restore action

2. **ProjectLogs Component** (`components/project/project-logs.tsx`)
   - Displays project history
   - Handles restore button clicks
   - Manages confirmation dialog
   - Refreshes logs after restore

3. **ConfirmDialog Component** (`components/ui/confirm-dialog.tsx`)
   - Reusable confirmation dialog
   - Supports different variants (default, destructive)
   - Handles loading states

### Error Handling
- Validates user session before restore
- Checks if log entry exists and has previous data
- Handles database errors gracefully
- Shows error messages to users

## Usage Example

1. Navigate to a project page
2. Scroll down to the "Project History" section
3. Find a "Project Updated" entry with a "Restore" button
4. Click "Restore" to open the confirmation dialog
5. Review the timestamp and click "Restore" to confirm
6. The project will be restored to that previous state
7. A new "Project Restored" entry will appear in the history

## Benefits

- **Data Safety**: Users can recover from accidental changes
- **Audit Trail**: All restore actions are logged
- **User Control**: Users can choose which version to restore to
- **Transparency**: Clear indication of what will be restored
- **Non-destructive**: Original data is preserved in logs 
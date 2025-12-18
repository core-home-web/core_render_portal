# Appendix F: Component Reference

Quick reference for all components in the Core Render Portal.

---

## UI Components

| Component | File | Props |
|-----------|------|-------|
| `Button` | `ui/button.tsx` | `variant`, `size`, `asChild` |
| `Input` | `ui/input.tsx` | Standard HTML input props |
| `Card` | `ui/card.tsx` | Children, className |
| `Label` | `ui/label.tsx` | `htmlFor`, children |
| `Select` | `ui/select.tsx` | Radix UI select props |
| `Checkbox` | `ui/checkbox.tsx` | `checked`, `onCheckedChange` |
| `ThemedButton` | `ui/themed-button.tsx` | `variant`, `size` |
| `FileUpload` | `ui/file-upload.tsx` | `value`, `onChange`, `bucket` |
| `AnimatedProgressBar` | `ui/animated-progress-bar.tsx` | `steps`, `currentStep` |

---

## Layout Components

| Component | File | Props |
|-----------|------|-------|
| `DashboardLayout` | `layout/DashboardLayout.tsx` | `children`, `user`, `onSignOut` |
| `Sidebar` | `layout/Sidebar.tsx` | `user`, `onSignOut` |

---

## Auth Components

| Component | File | Props |
|-----------|------|-------|
| `LoginForm` | `auth/login-form.tsx` | None |
| `SignupForm` | `auth/signup-form.tsx` | None |

---

## Project Components

| Component | File | Props |
|-----------|------|-------|
| `EditProjectForm` | `project/edit-project-form.tsx` | `project`, `onUpdate` |
| `CollaboratorsList` | `project/collaborators-list.tsx` | `projectId` |
| `InviteUserModal` | `project/invite-user-modal.tsx` | `projectId`, `isOpen`, `onClose`, `onSuccess` |
| `ExportProjectModal` | `project/export-project-modal.tsx` | `project`, `boardRef`, `isOpen`, `onClose` |
| `ProjectLogs` | `project/project-logs.tsx` | `projectId`, `onRestore` |

---

## Whiteboard Components

| Component | File | Props |
|-----------|------|-------|
| `ExcalidrawBoard` | `whiteboard/ExcalidrawBoard.tsx` | `projectId`, `initialData`, `readOnly`, `theme`, `onChange` |
| `CoreRenderBoard` | `whiteboard/CoreRenderBoard.tsx` | `projectId` |

---

## Image Annotation Components

| Component | File | Props |
|-----------|------|-------|
| `AnnotationWorkspace` | `image-annotation/AnnotationWorkspace.tsx` | `className` |
| `ImageCanvas` | `image-annotation/ImageCanvas.tsx` | `image`, `className`, `onCanvasClick` |
| `FileUpload` | `image-annotation/FileUpload.tsx` | `onFilesAdded`, `config` |
| `ImageTabs` | `image-annotation/ImageTabs.tsx` | `images`, `activeImageId`, `onImageSelect`, `onImageRemove` |

---

## Custom Hooks

| Hook | File | Returns |
|------|------|---------|
| `useAuth` | `lib/auth-context.tsx` | `user`, `session`, `loading`, `signIn`, `signUp`, `signOut` |
| `useTheme` | `lib/theme-context.tsx` | `team`, `setTeam`, `colors`, `loading` |
| `useProject` | `hooks/useProject.ts` | `createProject`, `getProjects`, `getProject`, `restoreProject`, `loading`, `error` |
| `useProjectCollaboration` | `hooks/useProjectCollaboration.ts` | `inviteUser`, `getCollaborators`, `getInvitations`, `removeCollaborator`, `cancelInvitation` |
| `useExcalidrawBoard` | `hooks/useExcalidrawBoard.ts` | `board`, `loading`, `error`, `hasUnsavedChanges`, `fetchBoard`, `saveBoard`, `updateLocalBoard` |

---

## Context Providers

| Provider | File | Provides |
|----------|------|----------|
| `AuthProvider` | `lib/auth-context.tsx` | Authentication state |
| `ThemeProvider` | `lib/theme-context.tsx` | Theme/team colors |

---

*Return to [Appendices](./README.md)*

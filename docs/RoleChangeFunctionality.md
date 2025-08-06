# Role Change Functionality

## Overview
The Header component now includes a role change dropdown that allows users to switch between their assigned roles. This functionality fetches user roles from the backend API and stores them locally for quick access.

## Features

### 1. Role Dropdown
- Located in the header next to the user's name
- Shows all roles assigned to the current user
- Highlights the currently active role
- Displays role names in a user-friendly format (e.g., "SURVEY ENGINEER" instead of "survey_engineer")

### 2. Role Storage
- User roles are stored in localStorage for quick access
- Roles are fetched from the backend API on first load
- Fallback to stored roles if API is unavailable

### 3. Role Switching
- Click "Change Role" to open the role dropdown
- Select a role to switch to it
- The selected role is immediately updated in localStorage
- Page refreshes after 500ms to apply role changes across the application

## Technical Implementation

### Backend API
- **Endpoint**: `GET /api/user-management/users/:userId/roles`
- **Authentication**: Requires JWT token
- **Response**: Array of role objects with id, name, description, etc.

### Frontend Components
- **Header.jsx**: Main component with role dropdown
- **SignupForm.jsx**: Updated to store user roles on login

### State Management
- `userRoles`: Array of available roles
- `currentRole`: Currently selected role
- `isRoleDropdownOpen`: Controls role dropdown visibility
- `loading`: Shows loading state while fetching roles

### localStorage Keys
- `role`: Current active role
- `userRoles`: Array of all user roles (JSON string)
- `token`: JWT token for API authentication

## Usage

1. **Login**: User logs in and roles are automatically stored
2. **View Roles**: Click the dropdown arrow in the header
3. **Change Role**: Click "Change Role" to see available roles
4. **Select Role**: Click on a role to switch to it
5. **Apply Changes**: Page refreshes to apply the new role

## Error Handling

- **API Failure**: Falls back to stored roles from localStorage
- **Invalid Token**: Shows "No roles available" message
- **Network Issues**: Uses cached roles if available

## Styling

- Dropdown uses Tailwind CSS classes
- Responsive design with proper z-index layering
- Hover effects and visual feedback
- Current role is highlighted in blue

## Security

- JWT token is used for API authentication
- User can only see their own assigned roles
- Role changes are validated on the backend
- Token is decoded client-side to get user ID

## Future Enhancements

- Real-time role updates without page refresh
- Role-based UI changes without reload
- Role change history/logging
- Role-specific permissions display 
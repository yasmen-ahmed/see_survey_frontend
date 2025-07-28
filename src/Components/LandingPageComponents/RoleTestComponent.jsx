import React, { useState } from 'react';

const RoleTestComponent = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [currentStatus, setCurrentStatus] = useState('created');

  // Function to get available status options based on user role
  const getAvailableStatusOptions = (userRole) => {
    const allStatuses = [
      { value: 'created', label: 'Created' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'review', label: 'Under revision' },
      { value: 'rework', label: 'Rework' },
      { value: 'done', label: 'Approved' }
    ];

    // If no role, show all statuses
    if (!userRole) {
      return allStatuses;
    }

    // Role-based status visibility
    switch (userRole) {
      case 'admin':
        // Admin can see and change to all statuses
        return allStatuses;
        
      case 'coordinator':
        // Coordinator can only see Created and Submitted
        return allStatuses.filter(status => 
          ['created', 'submitted'].includes(status.value)
        );
        
      case 'survey_engineer':
        // Survey Engineer can see Submitted and Under revision
        return allStatuses.filter(status => 
          ['submitted', 'review'].includes(status.value)
        );
        
      case 'approver':
        // Approver can see Under revision, Rework, and Approved
        return allStatuses.filter(status => 
          ['review', 'rework', 'done'].includes(status.value)
        );
        
      default:
        // Default: show all statuses
        return allStatuses;
    }
  };

  const availableStatuses = getAvailableStatusOptions(selectedRole);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Role-Based Status Visibility Test</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select User Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">No Role (Show All)</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="survey_engineer">Survey Engineer</option>
              <option value="approver">Approver</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Current Status:</label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="created">Created</option>
              <option value="submitted">Submitted</option>
              <option value="review">Under revision</option>
              <option value="rework">Rework</option>
              <option value="done">Approved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Status Change Options</h3>
        
        {selectedRole && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current Role:</strong> {selectedRole.replace('_', ' ').toUpperCase()}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Available status options for this role:
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Available Status Options:</label>
          <select className="w-full p-2 border rounded-md">
            {availableStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Available options:</strong> {availableStatuses.length} out of 5 total statuses</p>
          <p><strong>Options:</strong> {availableStatuses.map(s => s.label).join(', ')}</p>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Role Permissions Summary:</h4>
        <ul className="text-sm space-y-1">
          <li><strong>Admin:</strong> Can see and change to all statuses</li>
          <li><strong>Coordinator:</strong> Can only see Created and Submitted</li>
          <li><strong>Survey Engineer:</strong> Can only see Submitted and Under revision</li>
          <li><strong>Approver:</strong> Can only see Under revision, Rework, and Approved</li>
        </ul>
      </div>
    </div>
  );
};

export default RoleTestComponent; 
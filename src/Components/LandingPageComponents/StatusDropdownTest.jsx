import React, { useState } from 'react';

const StatusDropdownTest = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
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

    if (!userRole) {
      return allStatuses;
    }

    switch (userRole) {
      case 'admin':
        return allStatuses;
      case 'coordinator':
        return allStatuses.filter(status => 
          ['created', 'submitted'].includes(status.value)
        );
      case 'survey_engineer':
        return allStatuses;
      case 'approver':
        return allStatuses;
      default:
        return allStatuses;
    }
  };

  // Function to check if a specific status option should be disabled
  const isStatusDisabled = (statusValue, userRole) => {
    if (!userRole) return false;

    switch (userRole) {
      case 'admin':
        return false;
      case 'coordinator':
        return true;
      case 'survey_engineer':
        return statusValue !== 'submitted';
      case 'approver':
        return ['created', 'submitted'].includes(statusValue);
      default:
        return false;
    }
  };

  // Function to check if the entire dropdown should be disabled
  const isDropdownDisabled = (userRole) => {
    if (!userRole) return false;
    return userRole === 'coordinator';
  };

  const availableStatuses = getAvailableStatusOptions(selectedRole);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Status Dropdown Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Role:
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="admin">Admin</option>
          <option value="coordinator">Coordinator</option>
          <option value="survey_engineer">Survey Engineer</option>
          <option value="approver">Approver</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Status:
        </label>
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="created">Created</option>
          <option value="submitted">Submitted</option>
          <option value="review">Under revision</option>
          <option value="rework">Rework</option>
          <option value="done">Approved</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status Dropdown (Role: {selectedRole}):
        </label>
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className="border rounded p-2 w-full"
          disabled={isDropdownDisabled(selectedRole)}
        >
          {availableStatuses.map((status) => (
            <option 
              key={status.value} 
              value={status.value}
              disabled={isStatusDisabled(status.value, selectedRole)}
            >
              {status.label} {isStatusDisabled(status.value, selectedRole) ? '(Disabled)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Behavior Summary:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Admin:</strong> Can change to any status</li>
          <li><strong>Coordinator:</strong> Dropdown completely disabled</li>
          <li><strong>Survey Engineer:</strong> Can only change to "Submitted"</li>
          <li><strong>Approver:</strong> Cannot change "Created" and "Submitted" statuses</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Current State:</strong></p>
        <p>Role: {selectedRole}</p>
        <p>Current Status: {currentStatus}</p>
        <p>Dropdown Disabled: {isDropdownDisabled(selectedRole) ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default StatusDropdownTest; 
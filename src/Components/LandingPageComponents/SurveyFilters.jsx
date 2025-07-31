import React, { useState, useEffect } from 'react';

const SurveyFilters = ({ surveys, onFilterChange }) => {
  const [filters, setFilters] = useState({
    project: '',
    siteName: '',
    status: '',
    search: ''
  });

  // Get unique values for dropdowns
  const uniqueProjects = [...new Set(surveys.map(survey => 
    survey.project || survey.projectData?.name
  ).filter(Boolean))].sort();

  const uniqueSiteNames = [...new Set(surveys.map(survey => 
    survey.site_id
  ).filter(Boolean))].sort();

  const uniqueStatuses = [...new Set(surveys.map(survey => 
    survey.TSSR_Status
  ).filter(Boolean))].sort();

  // Status labels for better display
  const statusLabels = {
    created: 'Created',
    submitted: 'Submitted',
    review: 'Under Review',
    rework: 'Rework',
    done: 'Approved'
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { project: '', siteName: '', status: '', search: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.project || filters.siteName || filters.status || filters.search;

  return (
    <div className="">
   

      {/* Search Bar */}
      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by session ID, site ID, or any text..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Projects</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        {/* Site Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <select
            value={filters.siteName}
            onChange={(e) => handleFilterChange('siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sites</option>
            {uniqueSiteNames.map(siteName => (
              <option key={siteName} value={siteName}>
                {siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {statusLabels[status] || status}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xl underline font-medium pt-2 text-blue-600 hover:text-blue-800"
          >
            Clear All Filters
          </button>
        )}
        {/* Active Filters Display */}
        {/* <div className="flex items-end">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Filters
            </label>
            <div className="min-h-[40px] px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {hasActiveFilters ? (
                <div className="flex flex-wrap gap-2">
                  {filters.project && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Project: {filters.project}
                    </span>
                  )}
                  {filters.siteName && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Site: {filters.siteName}
                    </span>
                  )}
                                     {filters.status && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                       Status: {statusLabels[filters.status] || filters.status}
                     </span>
                   )}
                   {filters.search && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                       Search: "{filters.search}"
                     </span>
                   )}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">No filters applied</span>
              )}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default SurveyFilters; 
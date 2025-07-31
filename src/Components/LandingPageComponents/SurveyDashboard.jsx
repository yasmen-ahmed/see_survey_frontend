import React from 'react';

const SurveyDashboard = ({ surveys, userRole }) => {
  // Calculate statistics
  const totalSurveys = surveys.length;
  
  // Get unique projects
  const uniqueProjects = new Set(surveys.map(survey => survey.project || survey.projectData?.name).filter(Boolean));
  const totalProjects = uniqueProjects.size;
  
  // Count surveys by status
  const statusCounts = surveys.reduce((acc, survey) => {
    const status = survey.TSSR_Status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  // Define status colors and labels
  const statusConfig = {
    created: { label: 'Created', color: 'bg-blue-500', textColor: 'text-blue-500' },
    submitted: { label: 'Submitted', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    review: { label: 'Under Review', color: 'bg-orange-500', textColor: 'text-orange-600' },
    rework: { label: 'Rework', color: 'bg-red-500', textColor: 'text-red-600' },
    done: { label: 'Approved', color: 'bg-green-500', textColor: 'text-green-600' },
    unknown: { label: 'Unknown', color: 'bg-gray-500', textColor: 'text-gray-600' }
  };

  return (
    <div className="mb-6">
    
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        {/* Total Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>

        {/* Total Surveys Card */}
        <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{totalSurveys}</p>
            </div>
          </div>
        </div>
  {/* created Card */}
  <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.created || 0}</p>
            </div>
          </div>
        </div>
        {/* submitted Card */}
  <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.submitted || 0}</p>
            </div>
          </div>
        </div>
        {/* review Card */}
        <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>      
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.review || 0}</p>
            </div>
          </div>
        </div>
        {/* rework Card */}     
        <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
                </div>    
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rework</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.rework || 0}</p>
            </div>
          </div>
        </div>

        

            {/* Completed Surveys Card */}
        <div className="bg-white rounded-lg shadow-md p-2 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.done || 0}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Status Breakdown */}
      {/* <div className="bg-white rounded-lg shadow-md p-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null; // Don't show statuses with 0 count
            
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.color} mb-2`}>
                  <span className="text-white font-bold text-lg">{count}</span>
                </div>
                <p className={`text-sm font-medium ${config.textColor}`}>{config.label}</p>
                <p className="text-xs text-gray-500">
                  {totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0}%
                </p>
              </div>
            );
          })}
        </div>
      </div> */}

    </div>
  );
};

export default SurveyDashboard; 
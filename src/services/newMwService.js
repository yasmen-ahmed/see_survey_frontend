const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getNewMWData = async (sessionId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/new-mw/${sessionId}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch new MW data', err);
    return { success: false, error: err.message };
  }
};

export const saveNewMWData = async (sessionId, formData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/new-mw/${sessionId}`, {
      method: 'PUT',
      body: formData
    });
    
    // Check if the response is ok
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error response:', errorText);
      return { 
        success: false, 
        error: `Server error: ${res.status} ${res.statusText}` 
      };
    }
    
    // Try to parse as JSON
    try {
      return await res.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      const responseText = await res.text();
      console.error('Response text:', responseText);
      return { 
        success: false, 
        error: 'Invalid JSON response from server' 
      };
    }
  } catch (err) {
    console.error('Failed to save new MW data', err);
    return { success: false, error: err.message };
  }
}; 
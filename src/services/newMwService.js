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
    return await res.json();
  } catch (err) {
    console.error('Failed to save new MW data', err);
    return { success: false, error: err.message };
  }
}; 
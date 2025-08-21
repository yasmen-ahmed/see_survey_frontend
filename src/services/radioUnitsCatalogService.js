import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const radioUnitsCatalogService = {
  // Fetch radio units catalog items filtered by hardware type
  async getItemsByHardwareType(hardwareTypes = ['IPAA', 'MAA']) {
    try {
      const params = new URLSearchParams();
      // Send hardware types as array
      params.append('hardware_type', JSON.stringify(hardwareTypes));
      
      const response = await axios.get(`${API_BASE_URL}/api/radio-units-catalog?${params.toString()}`);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching radio units catalog:', error);
      throw error;
    }
  },

  // Fetch all radio units catalog items with pagination
  async getAllItems(limit = 100, offset = 0, hardware_type = null) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (hardware_type) {
        params.append('hardware_type', hardware_type);
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/radio-units-catalog?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching radio units catalog:', error);
      throw error;
    }
  },

  // Get a specific item by item_code
  async getItemByCode(itemCode) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/radio-units-catalog/${itemCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching radio unit catalog item:', error);
      throw error;
    }
  }
};

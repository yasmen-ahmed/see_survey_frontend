import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const useSiteOperators = () => {
  const { sessionId } = useParams();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteOperators = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/site-area-info/${sessionId}`);
        const siteData = response.data;
        
        // Get the selected operators from site information
        const selectedOperators = siteData.other_telecom_operator_exist_onsite || [];
        
        // If no operators are selected, provide default options based on project
        if (selectedOperators.length === 0) {
          // You can customize this based on your project requirements
          setOperators(['STC', 'Zain', 'Mobily', 'Aramco']);
        } else {
          setOperators(selectedOperators);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching site operators:', err);
        setError(err.message);
        // Fallback to default operators
        setOperators(['STC', 'Zain', 'Mobily', 'Aramco']);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteOperators();
  }, [sessionId]);

  return { operators, loading, error };
};

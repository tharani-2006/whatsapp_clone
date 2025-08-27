import { useState, useEffect } from 'react';

import axios from '../../utils/axios'; // Import axios

const Calls = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {

        const response = await axios.get('/api/callHistory'); // Fetch call history
        setCallHistory(response.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching call history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, []);

  if (loading) {
    return <div>Loading call history...</div>; // Show loading indicator
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Show error message
  }

  return (
    <div>
      <h2>Calls</h2>
      <table>
        <thead>
          <tr>
            <th>Contact</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {callHistory.map(call => (
            <tr key={call._id}>

              <td>{call.caller.name}</td>
              <td>{call.type}</td>
              <td>{call.duration}</td>

              <td>{call.startTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calls;
import React, { useEffect, useState } from 'react';
import API_URL from './config';

function PostMonitoring() {
  const [postStatus, setPostStatus] = useState(null);
  const [postDelivery, setPostDelivery] = useState(null);
  const [postEngagement, setPostEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostMetrics = async () => {
      try {
        const statusResponse = await fetch(`${API_URL}/api/analytics/status`, { credentials: 'include' });
        const deliveryResponse = await fetch(`${API_URL}/api/analytics/delivery`, { credentials: 'include' });
        const engagementResponse = await fetch(`${API_URL}/api/analytics/engagement`, { credentials: 'include' });

        if (!statusResponse.ok || !deliveryResponse.ok || !engagementResponse.ok) {
          throw new Error('Failed to fetch post metrics');
        }

        const statusData = await statusResponse.json();
        const deliveryData = await deliveryResponse.json();
        const engagementData = await engagementResponse.json();

        setPostStatus(statusData);
        setPostDelivery(deliveryData);
        setPostEngagement(engagementData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostMetrics();
  }, []);

  if (loading) {
    return <div>Loading post metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Post Monitoring and Engagement</h2>
      <h3>Post Status:</h3>
      <p>{postStatus ? JSON.stringify(postStatus) : 'N/A'}</p>

      <h3>Post Delivery:</h3>
      <p>{postDelivery ? JSON.stringify(postDelivery) : 'N/A'}</p>

      <h3>Post Engagement:</h3>
      <p>{postEngagement ? JSON.stringify(postEngagement) : 'N/A'}</p>
    </div>
  );
}

export default PostMonitoring;
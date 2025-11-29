import React, { useEffect, useState } from 'react';

function Analytics() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts', {
            credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Analytics Dashboard</h2>
      {posts.length === 0 ? (
        <p>No posts to display yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Scheduled Time</th>
              <th>Platforms</th>
              <th>Status</th>
              <th>Delivery Status</th>
              <th>Engagement Metrics</th>
              <th>Error Message</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.content}</td>
                <td>{new Date(post.scheduledTime).toLocaleString()}</td>
                <td>{post.platforms}</td>
                <td>{post.status}</td>
                <td>{post.deliveryStatus}</td>
                <td>{post.engagementMetrics ? JSON.stringify(post.engagementMetrics) : 'N/A'}</td>
                <td>{post.errorMessage || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Analytics;
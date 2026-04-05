import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API_URL from './config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AnalyticsDashboard() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postSummary, setPostSummary] = useState({});
  const [deliverySummary, setDeliverySummary] = useState({});
  const [engagementSummary, setEngagementSummary] = useState({});

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/analytics/status`, { withCredentials: true });
        // Mapping new API format to old state structure if needed, or just use response.data directly
        // For now, let's assume we might need to adjust how we display data
        setPostSummary({
            totalPosts: response.data.total,
            pendingPosts: response.data.pending,
            inProgressPosts: 0, // Not tracked in simple status
            completedPosts: response.data.published,
            failedPosts: response.data.failed
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalyticsData = async () => {
      try {
        const deliverySummaryRes = await axios.get(`${API_URL}/api/analytics/delivery`, { withCredentials: true });
        setDeliverySummary({
            deliveredPosts: deliverySummaryRes.data.delivered,
            failedDeliveries: deliverySummaryRes.data.failed,
            pendingDeliveries: 0 // Not tracked separately
        });

        const engagementSummaryRes = await axios.get(`${API_URL}/api/analytics/engagement`, { withCredentials: true });
        setEngagementSummary({
            highEngagement: 0, // Simplified API returns raw counts
            mediumEngagement: 0,
            lowEngagement: 0,
            raw: engagementSummaryRes.data // Store raw data
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchPerformanceData();
    fetchAnalyticsData();

    const socket = io(API_URL, {
        withCredentials: true
    });

    socket.on('postUpdate', (data) => {
      console.log("Post updated:", data);
      fetchPerformanceData(); // Refresh data on update
      fetchAnalyticsData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const postStatusData = [
    { name: 'Published', value: postSummary.completedPosts || 0 },
    { name: 'Pending', value: postSummary.pendingPosts || 0 },
    { name: 'Failed', value: postSummary.failedPosts || 0 } // Assuming failedPosts is added to state mapping
  ];

  const engagementData = [
    { name: 'Likes', value: engagementSummary.raw ? engagementSummary.raw.likes : 0 },
    { name: 'Comments', value: engagementSummary.raw ? engagementSummary.raw.comments : 0 },
    { name: 'Shares', value: engagementSummary.raw ? engagementSummary.raw.shares : 0 }
  ];

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <div className="summary-cards">
        <div className="card">
          <h3>Post Summary</h3>
          <p>Total Posts: {postSummary.totalPosts}</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={postStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {postStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Delivery Summary</h3>
          <p>Delivered: {deliverySummary.deliveredPosts}</p>
          <p>Failed: {deliverySummary.failedDeliveries}</p>
        </div>
        <div className="card">
          <h3>Engagement Summary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={engagementData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
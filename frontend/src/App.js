import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Analytics from './Analytics';
import SocialConnect from './SocialConnect';
import PostMonitoring from './PostMonitoring';
import AnalyticsDashboard from './AnalyticsDashboard';
import Register from './Register'; // Import Register component
import Login from './Login';     // Import Login component
import Navigation from './Navigation'; // Import Navigation
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import './App.css';

function App() {
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('postContent', postContent);
    if (selectedFile) {
        formData.append('image', selectedFile);
    } else if (imageUrl) {
        // If user provided URL instead of file, we pass it as mediaUrls
        // Note: The backend expects mediaUrls as a JSON string of an array
        formData.append('mediaUrls', JSON.stringify([imageUrl]));
    }

    if (linkUrl) formData.append('linkUrl', linkUrl);
    
    // Platforms: Defaulting to all connected or specific ones.
    // For simplicity, let's assume we send a default list or the user would select them.
    // Sending a default 'facebook' for now as per original logic likely implied or required.
    formData.append('platforms', JSON.stringify(['facebook', 'twitter', 'instagram']));

    if (scheduleDate && scheduleTime) {
        formData.append('scheduledTime', `${scheduleDate}T${scheduleTime}`);
    }

    try {
      const response = await fetch('http://localhost:5000/api/post', { // Updated endpoint
        method: 'POST',
        // Content-Type header is NOT set manually when using FormData; browser sets it with boundary
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Post submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit post.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('An error occurred while submitting the post.');
    }

    // Clear form
    setPostContent('');
    setImageUrl('');
    setSelectedFile(null);
    setLinkUrl('');
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <Router>
      <div className="App">
        <Navigation />
        <header className="App-header">
          <h1>Create New Post</h1>
        </header>
        <main>
          <Routes>
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={
                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-group">
                    <label htmlFor="postContent">What's on your mind?</label>
                    <textarea
                        id="postContent"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write your post here..."
                        rows="5"
                        required
                    ></textarea>
                    </div>

                    <div className="form-group">
                    <label htmlFor="imageUpload">Upload Image (or use URL below)</label>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="imageUrl">Image URL (optional)</label>
                    <input
                        type="url"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="e.g., https://example.com/image.jpg"
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="linkUrl">Embed Link (optional)</label>
                    <input
                        type="url"
                        id="linkUrl"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="e.g., https://example.com/article"
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="scheduleDate">Schedule Date (optional)</label>
                    <input
                        type="date"
                        id="scheduleDate"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="scheduleTime">Schedule Time (optional)</label>
                    <input
                        type="time"
                        id="scheduleTime"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                    />
                    </div>

                    <button type="submit" className="submit-button">Publish Now / Schedule Post</button>
                </form>
                } />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/connect-social" element={<SocialConnect />} />
                <Route path="/post-monitoring" element={<PostMonitoring />} />
            </Route>
            <Route path="/register" element={<Register />} /> {/* New Route */}
            <Route path="/login" element={<Login />} />       {/* New Route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
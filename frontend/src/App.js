import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Analytics from './Analytics';
import SocialConnect from './SocialConnect';
import PostMonitoring from './PostMonitoring';
import AnalyticsDashboard from './AnalyticsDashboard';
import Register from './Register';
import Login from './Login';
import Navigation from './Navigation';
import ProtectedRoute from './ProtectedRoute';
import API_URL from './config';
import './App.css';

const PLATFORM_OPTIONS = ['facebook', 'twitter', 'instagram'];

function App() {
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'twitter', 'instagram']);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform.');
      return;
    }
    
    const formData = new FormData();
    formData.append('postContent', postContent);
    if (selectedFile) {
        formData.append('image', selectedFile);
    } else if (imageUrl) {
        formData.append('mediaUrls', JSON.stringify([imageUrl]));
    }

    if (linkUrl) formData.append('linkUrl', linkUrl);
    formData.append('platforms', JSON.stringify(selectedPlatforms));

    if (scheduleDate && scheduleTime) {
        formData.append('scheduledTime', `${scheduleDate}T${scheduleTime}`);
    }

    try {
      const response = await fetch(`${API_URL}/api/post`, {
        method: 'POST',
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
                    <label>Platforms</label>
                    <div className="platform-checkboxes">
                      {PLATFORM_OPTIONS.map(platform => (
                        <label key={platform} className="platform-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform)}
                            onChange={() => handlePlatformChange(platform)}
                          />
                          {' '}{platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                      ))}
                    </div>
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
                <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
                <Route path="/connect-social" element={<SocialConnect />} />
                <Route path="/post-monitoring" element={<PostMonitoring />} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
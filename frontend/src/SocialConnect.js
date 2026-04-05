import React, { useState, useEffect } from 'react';
import API_URL from './config';

function SocialConnect() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/connected-accounts`, {
            credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setConnectedAccounts(data);
        } else {
          console.error('Failed to fetch connected accounts');
        }
      } catch (error) {
        console.error('Error fetching connected accounts:', error);
      }
    };

    fetchConnectedAccounts();
  }, []);

  const handleDisconnect = async (platform) => {
    try {
      const response = await fetch(`${API_URL}/api/disconnect-${platform}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setConnectedAccounts(prev => ({ ...prev, [platform]: false }));
        alert(`${platform} disconnected successfully!`);
      } else {
        alert(`Failed to disconnect ${platform}.`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      alert(`Error disconnecting ${platform}.`);
    }
  };

  return (
    <div className="social-connect-container">
      <h2>Connect Your Social Media Accounts</h2>
      <div className="social-buttons">
        {/* Facebook Connect/Disconnect */}
        <div className="social-platform">
          <button
            onClick={() => connectedAccounts.facebook ? handleDisconnect('facebook') : window.location.href = `${API_URL}/auth/facebook`}
            className={connectedAccounts.facebook ? 'disconnect-btn' : 'connect-btn'}
          >
            {connectedAccounts.facebook ? 'Disconnect Facebook' : 'Connect Facebook'}
          </button>
          {connectedAccounts.facebook && <span className="connected-status">Connected</span>}
        </div>

        {/* Twitter Connect/Disconnect */}
        <div className="social-platform">
          <button
            onClick={() => connectedAccounts.twitter ? handleDisconnect('twitter') : window.location.href = `${API_URL}/auth/twitter`}
            className={connectedAccounts.twitter ? 'disconnect-btn' : 'connect-btn'}
          >
            {connectedAccounts.twitter ? 'Disconnect Twitter' : 'Connect Twitter'}
          </button>
          {connectedAccounts.twitter && <span className="connected-status">Connected</span>}
        </div>

        {/* Instagram Connect/Disconnect */}
        <div className="social-platform">
          <button
            onClick={() => connectedAccounts.instagram ? handleDisconnect('instagram') : window.location.href = `${API_URL}/auth/instagram`}
            className={connectedAccounts.instagram ? 'disconnect-btn' : 'connect-btn'}
          >
            {connectedAccounts.instagram ? 'Disconnect Instagram' : 'Connect Instagram'}
          </button>
          {connectedAccounts.instagram && <span className="connected-status">Connected</span>}
        </div>

        {/* LinkedIn Connect/Disconnect */}
        <div className="social-platform">
          <button
            onClick={() => connectedAccounts.linkedin ? handleDisconnect('linkedin') : window.location.href = '/auth/linkedin'}
            className={connectedAccounts.linkedin ? 'disconnect-btn' : 'connect-btn'}
          >
            {connectedAccounts.linkedin ? 'Disconnect LinkedIn' : 'Connect LinkedIn'}
          </button>
          {connectedAccounts.linkedin && <span className="connected-status">Connected</span>}
        </div>
      </div>
    </div>
  );
}

export default SocialConnect;
const express = require('express');
const morgan = require('morgan');
const { sequelize, Post, User } = require('./models'); // Import User model
const app = express();
const port = 5000;

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

// Sync database
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});

app.get('/posts/status', (req, res) => {
  res.json({ message: 'Post status endpoint' });
});

app.get('/posts/delivery', (req, res) => {
  res.json({ message: 'Post delivery endpoint' });
});

app.get('/posts/engagement', (req, res) => {
  res.json({ message: 'Post engagement endpoint' });
});

app.get('/analytics/performance', (req, res) => {
  res.json({ message: 'Post performance analytics endpoint' });
});

app.post('/posts', async (req, res) => {
  try {
    const { content } = req.body;
    const newPost = await Post.create({ content, status: 'pending', delivery: 'pending', engagement: 'low' });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

app.get('/posts/status', async (req, res) => {
  try {
    const posts = await Post.findAll({ attributes: ['id', 'status'] });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching post statuses:', error);
    res.status(500).json({ message: 'Error fetching post statuses' });
  }
});

app.get('/posts/delivery', async (req, res) => {
  try {
    const posts = await Post.findAll({ attributes: ['id', 'delivery'] });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching post deliveries:', error);
    res.status(500).json({ message: 'Error fetching post deliveries' });
  }
});

app.get('/posts/engagement', async (req, res) => {
  try {
    const posts = await Post.findAll({ attributes: ['id', 'engagement'] });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching post engagements:', error);
    res.status(500).json({ message: 'Error fetching post engagements' });
  }
});

app.get('/analytics/performance', async (req, res) => {
  try {
    const posts = await Post.findAll(); // Fetch all posts for analytics
    // In a real application, you'd perform calculations here
    res.status(200).json({ message: 'Post performance analytics endpoint', data: posts });
  } catch (error) {
    console.error('Error fetching analytics performance:', error);
    res.status(500).json({ message: 'Error fetching analytics performance' });
  }
});

app.get('/analytics/post-summary', async (req, res) => {
  try {
    const totalPosts = await Post.count();
    const pendingPosts = await Post.count({ where: { status: 'pending' } });
    const inProgressPosts = await Post.count({ where: { status: 'in_progress' } });
    const completedPosts = await Post.count({ where: { status: 'completed' } });

    res.status(200).json({
      totalPosts,
      pendingPosts,
      inProgressPosts,
      completedPosts,
    });
  } catch (error) {
    console.error('Error fetching post summary:', error);
    res.status(500).json({ message: 'Error fetching post summary' });
  }
});

app.get('/analytics/delivery-summary', async (req, res) => {
  try {
    const deliveredPosts = await Post.count({ where: { delivery: 'delivered' } });
    const failedDeliveries = await Post.count({ where: { delivery: 'failed' } });
    const pendingDeliveries = await Post.count({ where: { delivery: 'pending' } });

    res.status(200).json({
      deliveredPosts,
      failedDeliveries,
      pendingDeliveries,
    });
  } catch (error) {
    console.error('Error fetching delivery summary:', error);
    res.status(500).json({ message: 'Error fetching delivery summary' });
  }
});

app.get('/analytics/engagement-summary', async (req, res) => {
  try {
    const highEngagement = await Post.count({ where: { engagement: 'high' } });
    const mediumEngagement = await Post.count({ where: { engagement: 'medium' } });
    const lowEngagement = await Post.count({ where: { engagement: 'low' } });

    res.status(200).json({
      highEngagement,
      mediumEngagement,
      lowEngagement,
    });
  } catch (error) {
    console.error('Error fetching engagement summary:', error);
    res.status(500).json({ message: 'Error fetching engagement summary' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Allow requests from your frontend
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Example: Emit a real-time update every 5 seconds
  setInterval(async () => {
    try {
      const totalPosts = await Post.count();
      const pendingPosts = await Post.count({ where: { status: 'pending' } });
      const inProgressPosts = await Post.count({ where: { status: 'in_progress' } });
      const completedPosts = await Post.count({ where: { status: 'completed' } });

      io.emit('postSummaryUpdate', {
        totalPosts,
        pendingPosts,
        inProgressPosts,
        completedPosts,
      });
    } catch (error) {
      console.error('Error emitting post summary update:', error);
    }
  }, 5000);
});

server.listen(3002, () => {
  console.log('Socket.IO server listening on port 3002');
});

// User registration route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Hash password before saving to database (implement hashing later)
    const newUser = await User.create({ username, email, password });
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password (implement password comparison later)
    if (user.password !== password) { // Placeholder for actual password comparison
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Logged in successfully', user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Placeholder for connected accounts
app.get('/api/connected-accounts', (req, res) => {
  // In a real application, this would fetch the user's connected accounts from the database
  res.status(200).json({
    facebook: true, // Placeholder
    twitter: false, // Placeholder
    instagram: true, // Placeholder
    linkedin: false, // Placeholder
  });
});

// LinkedIn authentication routes (placeholders)
app.get('/auth/linkedin', (req, res) => {
  // Redirect to LinkedIn's authorization URL
  res.redirect('https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_LINKEDIN_CLIENT_ID&redirect_uri=http://localhost:5000/auth/linkedin/callback&state=some_random_string&scope=r_liteprofile%20r_emailaddress');
});

app.get('/auth/linkedin/callback', async (req, res) => {
  // Handle the callback from LinkedIn, exchange code for token, etc.
  res.status(200).json({ message: 'LinkedIn callback handled (placeholder)' });
});

app.post('/api/disconnect-linkedin', (req, res) => {
  // Handle LinkedIn disconnection
  res.status(200).json({ message: 'LinkedIn disconnected (placeholder)' });
});
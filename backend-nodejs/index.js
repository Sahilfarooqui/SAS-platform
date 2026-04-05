require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const cors = require('cors');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const SocialMediaAPI = require('social-media-api');
const { PrismaClient } = require('@prisma/client');
const { rateLimit } = require('express-rate-limit');
const CryptoJS = require('crypto-js'); // Import crypto-js
const http = require('http');
const { Server } = require("socket.io");
const { body, validationResult } = require('express-validator');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev_encryption_key_change_in_prod';

// Rate limiters for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later.' }
});

// Encryption and Decryption Utility Functions
const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;
const social = new SocialMediaAPI(AYRSHARE_API_KEY);

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Example route for posting to social media


// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    if (!user.password) {
      return done(null, false, { message: 'No password set for this user.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Facebook OAuth Strategy (only register if credentials are configured)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${BASE_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            password: "",
            facebookAccessToken: encrypt(accessToken),
            facebookRefreshToken: encrypt(refreshToken),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }

      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            facebookAccessToken: encrypt(accessToken),
            facebookRefreshToken: encrypt(refreshToken),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
} else {
  console.warn('Facebook OAuth not configured (FACEBOOK_APP_ID/FACEBOOK_APP_SECRET missing)');
}

// Twitter OAuth Strategy (only register if credentials are configured)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${BASE_URL}/auth/twitter/callback`,
    includeEmail: true
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            password: "",
            twitterAccessToken: encrypt(token),
            twitterRefreshToken: encrypt(tokenSecret),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }

      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            twitterAccessToken: encrypt(token),
            twitterRefreshToken: encrypt(tokenSecret),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
} else {
  console.warn('Twitter OAuth not configured (TWITTER_CONSUMER_KEY/TWITTER_CONSUMER_SECRET missing)');
}

// Instagram OAuth Strategy (only register if credentials are configured)
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/instagram/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findUnique({ where: { id: profile.id } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: profile.id,
            email: `${profile.id}@instagram.com`,
            name: profile.displayName,
            password: "",
            instagramAccessToken: encrypt(accessToken),
            instagramRefreshToken: encrypt(refreshToken),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }

      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            instagramAccessToken: encrypt(accessToken),
            instagramRefreshToken: encrypt(refreshToken),
          },
        });

        if (!user.ayrshareProfileKey && AYRSHARE_API_KEY) {
          try {
            const ayrshareProfile = await social.createProfile({ userId: user.id });
            user = await prisma.user.update({
              where: { id: user.id },
              data: { ayrshareProfileKey: ayrshareProfile.profileKey },
            });
          } catch (e) { console.error('Ayrshare profile creation failed:', e.message); }
        }
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
} else {
  console.warn('Instagram OAuth not configured (INSTAGRAM_CLIENT_ID/INSTAGRAM_CLIENT_SECRET missing)');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_in_production',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    // Decrypt tokens before returning the user object
    if (user) {
      user.facebookAccessToken = decrypt(user.facebookAccessToken);
      user.facebookRefreshToken = decrypt(user.facebookRefreshToken);
      user.twitterAccessToken = decrypt(user.twitterAccessToken);
      user.twitterRefreshToken = decrypt(user.twitterRefreshToken);
      user.instagramAccessToken = decrypt(user.instagramAccessToken);
      user.instagramRefreshToken = decrypt(user.instagramRefreshToken);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Function to process scheduled posts
async function processScheduledPosts() {
  const now = new Date();
  const scheduledPosts = await prisma.scheduledPost.findMany({
    where: {
      scheduledTime: {
        lte: now,
      },
      status: 'pending',
    },
    include: {
      user: true,
    },
  });

  for (const post of scheduledPosts) {
    try {
      const platforms = JSON.parse(post.platforms);
      const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

      // Post to social media
      // Ensure Ayrshare profile key is available and create a user-specific social API instance
      if (!post.user || !post.user.ayrshareProfileKey) {
        console.error(`User or Ayrshare profile key not found for scheduled post ${post.id}. Marking as failed.`);
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: 'failed', errorMessage: 'User or Ayrshare profile key missing' },
        });
        continue; // Skip to the next post
      }

      const userSpecificSocial = new SocialMediaAPI(AYRSHARE_API_KEY, post.user.ayrshareProfileKey);
      const socialPost = await userSpecificSocial.post({
        post: post.content,
        platforms: platforms,
        mediaUrls: mediaUrls,
      });

      let engagementMetrics = {};
      if (socialPost.id) {
        // Assuming SocialMediaAPI has a method to fetch post analytics
        // This is a placeholder and might need adjustment based on actual API capabilities
        try {
          engagementMetrics = await userSpecificSocial.getPostAnalytics(socialPost.id);
        } catch (analyticsError) {
          console.warn(`Could not fetch analytics for socialPostId ${socialPost.id}:`, analyticsError);
        }
      }

      // Update post status with delivery details
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: 'published',
          deliveryStatus: socialPost.status === 'success' ? 'delivered' : 'failed',
          socialPostId: socialPost.id || null, // Assuming socialPost returns an ID
          errorMessage: socialPost.status === 'success' ? null : socialPost.message,
          engagementMetrics: engagementMetrics, // Store engagement metrics
        },
      });
      console.log(`Scheduled post ${post.id} published successfully:`, socialPost);
      
      // Emit socket event
      io.emit('postUpdate', { id: post.id, status: 'published' });

    } catch (error) {
      if (error.response && error.response.status === 429) { // Assuming 429 is the status code for rate limiting
        console.warn(`Rate limit exceeded for scheduled post ${post.id}. Marking as pending for retry.`);
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: 'pending', errorMessage: 'Rate limit exceeded. Will retry later.' },
        });
      } else {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            deliveryStatus: 'failed',
            errorMessage: error.message,
          },
        });
        console.error(`Error publishing scheduled post ${post.id}:`, error);
      }
    }
  }
}

// Run the scheduler every minute
setInterval(() => { processScheduledPosts(); }, 60 * 1000);

// Example route for posting to social media
app.post('/api/post', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { postContent, platforms, scheduledTime, linkUrl } = req.body;
    let mediaUrls = req.body.mediaUrls ? JSON.parse(req.body.mediaUrls) : [];
    
    // If file uploaded, add to mediaUrls
    if (req.file) {
        const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
        mediaUrls.push(fileUrl);
    }
    
    const user = req.user; // Get the authenticated user

    if (!user || !user.ayrshareProfileKey) {
      return res.status(401).json({ message: 'User not authenticated or Ayrshare profile not linked.' });
    }

    // Decrypt tokens before using them with SocialMediaAPI
    const decryptedFacebookAccessToken = decrypt(user.facebookAccessToken);
    const decryptedFacebookRefreshToken = decrypt(user.facebookRefreshToken);
    const decryptedTwitterAccessToken = decrypt(user.twitterAccessToken);
    const decryptedTwitterRefreshToken = decrypt(user.twitterRefreshToken);
    const decryptedInstagramAccessToken = decrypt(user.instagramAccessToken);
    const decryptedInstagramRefreshToken = decrypt(user.instagramRefreshToken);

    // You would typically pass these decrypted tokens to the SocialMediaAPI if it needed them directly.
    // For now, assuming SocialMediaAPI handles its own authentication based on profileKey.

    const social = new SocialMediaAPI(AYRSHARE_API_KEY, user.ayrshareProfileKey);

    if (scheduledTime) {
      // Save scheduled post to database
      const scheduledPost = await prisma.scheduledPost.create({
        data: {
          content: postContent,
          mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
          scheduledTime: new Date(scheduledTime),
          platforms: typeof platforms === 'string' ? platforms : JSON.stringify(platforms),
          userId: req.user.id, // Assuming user is authenticated and available in req.user
        },
      });
      return res.json({ message: 'Post scheduled successfully', scheduledPost });
    } else {
      // Existing logic for immediate posting
      try {
        const postResult = await social.post({
          post: postContent,
          platforms: platforms,
          mediaUrls: mediaUrls,
          profileKey: user.ayrshareProfileKey
        });

        let engagementMetrics = {};
        if (postResult.id) {
          try {
            engagementMetrics = await social.getPostAnalytics(postResult.id);
          } catch (analyticsError) {
            console.warn(`Could not fetch analytics for socialPostId ${postResult.id}:`, analyticsError);
          }
        }

        // Create a ScheduledPost entry for immediate posts with published status
        const immediatePost = await prisma.scheduledPost.create({
          data: {
            content: postContent,
            mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
            scheduledTime: new Date(), // Set to current time for immediate posts
            platforms: typeof platforms === 'string' ? platforms : JSON.stringify(platforms),
            userId: req.user.id,
            status: 'published',
            deliveryStatus: postResult.status === 'success' ? 'delivered' : 'failed',
            socialPostId: postResult.id || null,
            errorMessage: postResult.status === 'success' ? null : postResult.message,
            engagementMetrics: engagementMetrics, // Store engagement metrics
          },
        });

        return res.json(immediatePost);
      } catch (error) {
        if (error.response && error.response.status === 429) { // Assuming 429 is the status code for rate limiting
          console.warn('Rate limit exceeded for immediate post. Retrying later or notifying user.');
          return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
        throw error; // Re-throw if it's not a rate limit error
      }
    }
  } catch (error) {
    console.error('Error posting to social media:', error);
    res.status(500).json({ error: 'Failed to post to social media' });
  }
})

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Register Route
app.post('/register', authLimiter, validate([
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required')
]), async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Create Ayrshare profile
    try {
        const ayrshareProfile = await social.createProfile({ userId: user.id });
        await prisma.user.update({
            where: { id: user.id },
            data: { ayrshareProfileKey: ayrshareProfile.profileKey },
        });
    } catch (e) {
        console.error("Failed to create ayrshare profile", e);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login Route
app.post('/login', authLimiter, validate([
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
]), (req, res, next) => {
  console.log('Login request received. Session:', req.session ? 'exists' : 'missing');
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.status(400).json({ message: info.message }); }
    req.logIn(user, (err) => {
      if (err) { 
          console.error("Login error:", err);
          return next(err); 
      }
      const { id, email, name } = user;
      return res.json({ message: 'Logged in successfully', user: { id, email, name } });
    });
  })(req, res, next);
});

// Logout Route
app.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Current user / auth check endpoint
app.get('/api/me', isAuthenticated, (req, res) => {
  const { id, email, name } = req.user;
  res.json({ id, email, name });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Facebook authentication routes
app.get('/auth/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID) {
    return res.status(503).json({ error: 'Facebook OAuth not configured' });
  }
  passport.authenticate('facebook', { scope: ['email', 'publish_to_groups', 'pages_manage_posts'] })(req, res, next);
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${FRONTEND_URL}/connect-social` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/connect-social`);
  });

// Twitter authentication routes
app.get('/auth/twitter', (req, res, next) => {
  if (!process.env.TWITTER_CONSUMER_KEY) {
    return res.status(503).json({ error: 'Twitter OAuth not configured' });
  }
  passport.authenticate('twitter')(req, res, next);
});

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: `${FRONTEND_URL}/connect-social` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/connect-social`);
  });

// Instagram authentication routes
app.get('/auth/instagram', (req, res, next) => {
  if (!process.env.INSTAGRAM_CLIENT_ID) {
    return res.status(503).json({ error: 'Instagram OAuth not configured' });
  }
  passport.authenticate('instagram')(req, res, next);
});

app.get('/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: `${FRONTEND_URL}/connect-social` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/connect-social`);
  });

app.get('/api/posts', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await prisma.scheduledPost.findMany({
      where: { userId: userId },
      orderBy: { scheduledTime: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

app.get('/api/connected-accounts', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const connectedAccounts = {
      facebook: user.facebookAccessToken ? true : false,
      twitter: user.twitterAccessToken ? true : false,
      instagram: user.instagramAccessToken ? true : false,
    };
    res.json(connectedAccounts);
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({ error: 'Failed to fetch connected accounts.' });
  }
});

// Disconnect Facebook account endpoint
app.post('/api/disconnect-facebook', isAuthenticated, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { facebookAccessToken: null, facebookRefreshToken: null }
    });
    res.json({ message: 'Facebook account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Facebook account:', error);
    res.status(500).json({ error: 'Failed to disconnect Facebook account' });
  }
});

// Disconnect Twitter account endpoint
app.post('/api/disconnect-twitter', isAuthenticated, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twitterAccessToken: null, twitterRefreshToken: null }
    });
    res.json({ message: 'Twitter account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Twitter account:', error);
    res.status(500).json({ error: 'Failed to disconnect Twitter account' });
  }
});

// Disconnect Instagram account endpoint
app.post('/api/disconnect-instagram', isAuthenticated, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { instagramAccessToken: null, instagramRefreshToken: null }
    });
    res.json({ message: 'Instagram account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Instagram account:', error);
    res.status(500).json({ error: 'Failed to disconnect Instagram account' });
  }
});

// Analytics Endpoints
app.get('/api/analytics/status', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalPosts = await prisma.scheduledPost.count({ where: { userId } });
    const publishedPosts = await prisma.scheduledPost.count({ where: { userId, status: 'published' } });
    const pendingPosts = await prisma.scheduledPost.count({ where: { userId, status: 'pending' } });
    const failedPosts = await prisma.scheduledPost.count({ where: { userId, status: 'failed' } });

    res.json({
      total: totalPosts,
      published: publishedPosts,
      pending: pendingPosts,
      failed: failedPosts
    });
  } catch (error) {
    console.error('Error fetching status analytics:', error);
    res.status(500).json({ error: 'Failed to fetch status analytics' });
  }
});

app.get('/api/analytics/delivery', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const delivered = await prisma.scheduledPost.count({ where: { userId, deliveryStatus: 'delivered' } });
    const failed = await prisma.scheduledPost.count({ where: { userId, deliveryStatus: 'failed' } });

    res.json({
      delivered: delivered,
      failed: failed
    });
  } catch (error) {
    console.error('Error fetching delivery analytics:', error);
    res.status(500).json({ error: 'Failed to fetch delivery analytics' });
  }
});

app.get('/api/analytics/engagement', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    // This is a simplified aggregation. In a real app, you'd aggregate metrics from the JSON field.
    // SQLite JSON support in Prisma might be limited for complex aggregations, so fetching all and computing in JS for now.
    const posts = await prisma.scheduledPost.findMany({
      where: { userId, status: 'published' },
      select: { engagementMetrics: true }
    });

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    posts.forEach(post => {
      if (post.engagementMetrics) {
        // Assuming engagementMetrics is stored as a JSON object (or stringified JSON)
        let metrics = post.engagementMetrics;
        if (typeof metrics === 'string') {
            try { metrics = JSON.parse(metrics); } catch (e) {}
        }
        
        // Adjust keys based on actual Ayrshare response structure
        totalLikes += metrics.likes || metrics.favorite_count || 0;
        totalComments += metrics.comments || metrics.comment_count || 0;
        totalShares += metrics.shares || metrics.retweet_count || 0;
      }
    });

    res.json({
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares
    });
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    res.status(500).json({ error: 'Failed to fetch engagement analytics' });
  }
});


app.get('/', (req, res) => {
  res.send('Backend is running');
});

server.listen(port, () => {
  console.log(`Node.js backend listening at http://localhost:${port}`);
});
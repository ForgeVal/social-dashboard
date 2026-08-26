const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const metricsSchema = new mongoose.Schema({
  platform: String,
  followers: Number,
  engagement: Number,
  reach: Number,
  impressions: Number,
}, { timestamps: true });

const postsSchema = new mongoose.Schema({
  platform: String,
  content: String,
  likes: Number,
  comments: Number,
  shares: Number,
  date: Date,
}, { timestamps: true });

const Metrics = mongoose.model('Metrics', metricsSchema);
const Posts = mongoose.model('Posts', postsSchema);

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await Metrics.find();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/metrics', async (req, res) => {
  try {
    const metrics = new Metrics(req.body);
    await metrics.save();
    broadcast({ type: 'metrics_create', data: metrics });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/metrics/:id', async (req, res) => {
  try {
    const updated = await Metrics.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcast({ type: 'metrics_update', data: updated });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const post = new Posts(req.body);
    await post.save();
    broadcast({ type: 'post_create', data: post });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const updated = await Posts.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcast({ type: 'post_update', data: updated });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Posts.findByIdAndDelete(req.params.id);
    broadcast({ type: 'post_delete', id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

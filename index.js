require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URLs (in production, you'd use a database)
let urlDatabase = {};
let urlCounter = 1;

// Function to validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// POST endpoint to create short URL
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;
  
  // Validate URL format
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }
  
  // Check if URL already exists
  for (let id in urlDatabase) {
    if (urlDatabase[id] === url) {
      return res.json({ original_url: url, short_url: parseInt(id) });
    }
  }
  
  // Store new URL
  const shortUrl = urlCounter;
  urlDatabase[shortUrl] = url;
  urlCounter++;
  
  res.json({ original_url: url, short_url: shortUrl });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

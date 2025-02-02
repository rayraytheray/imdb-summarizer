require('dotenv').config();

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

// Import your Gemini wrapper module.
// Ensure that gemini.js exports a function like "summarizeSyllabus" that takes text and returns a Promise.
const gemini = require('./gemini');

// POST endpoint to handle syllabus summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { syllabus } = req.body;
    if (!syllabus) {
      return res.status(400).json({ error: 'No syllabus provided' });
    }
    
    // Call your Gemini summarization function (assumed to be asynchronous)
    const summary = await gemini.summarizeSyllabus(syllabus);
    
    // Respond with the summary
    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing syllabus:', error);
    res.status(500).json({ error: 'Error generating summary' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
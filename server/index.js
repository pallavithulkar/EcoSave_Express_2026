import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { analyzeBill, getLeakAssistantResponse, getTravelRecommendation, getImpactAnalogy } from './gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Set up image upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.memoryStorage(); // store in memory buffer for Gemini
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit: 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp) or PDFs are allowed!'));
  }
});

// Serving static files from uploads (just in case they need to be displayed)
app.use('/uploads', express.static(uploadDir));

// --- API ENDPOINTS ---

// 1. Profile / Settings
app.get('/api/profile', async (req, res, next) => {
  try {
    const profile = await db.getProfile();
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

app.post('/api/profile', async (req, res, next) => {
  try {
    const updated = await db.updateProfile(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// 2. Dashboard Statistics
app.get('/api/stats', async (req, res, next) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// 3. Bill Intelligence
app.get('/api/bills', async (req, res, next) => {
  try {
    const bills = await db.getBills();
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

app.post('/api/bills', upload.single('billFile'), async (req, res, next) => {
  try {
    const profile = await db.getProfile();
    let result;

    if (req.file) {
      // Vision extraction
      result = await analyzeBill(
        req.file.buffer,
        req.file.mimetype,
        null,
        profile.electricityRate
      );
    } else {
      // Manual entries
      const { units, amount, period } = req.body;
      if (!units || !amount) {
        return res.status(400).json({ error: 'Please provide units and amount for manual entry' });
      }
      result = await analyzeBill(
        null,
        null,
        { units, amount, period },
        profile.electricityRate
      );
    }

    // Save analyzed bill to DB
    const savedBill = await db.addBill(result);
    res.status(201).json(savedBill);
  } catch (error) {
    console.error('Error analyzing bill:', error);
    res.status(500).json({ error: error.message || 'Bill analysis failed' });
  }
});

// 4. Daily Streak Check-in
app.get('/api/streak', async (req, res, next) => {
  try {
    const logs = await db.getStreakLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

app.post('/api/streak', async (req, res, next) => {
  try {
    const { date, electricityCheck, waterCheck, travelCheck } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required for check-in' });
    }
    const checkIn = await db.addStreakCheckIn({
      date,
      electricityCheck: !!electricityCheck,
      waterCheck: !!waterCheck,
      travelCheck: !!travelCheck
    });
    res.status(201).json(checkIn);
  } catch (error) {
    next(error);
  }
});

// 5. Travel Carbon Tracker
app.get('/api/travel', async (req, res, next) => {
  try {
    const logs = await db.getTravelLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

app.post('/api/travel', async (req, res, next) => {
  try {
    const { start, destination, mode, spendOrDist } = req.body;
    if (!start || !destination || !mode || !spendOrDist) {
      return res.status(400).json({ error: 'Start, Destination, Mode, and Distance/Spend are required' });
    }

    // Process travel optimization
    const travelResult = await getTravelRecommendation(start, destination, mode, spendOrDist);
    
    // Save travel log to DB
    const savedLog = await db.addTravelLog({
      start,
      destination,
      ...travelResult
    });
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('Error tracking travel:', error);
    res.status(500).json({ error: error.message || 'Travel tracking failed' });
  }
});

// 6. Leakage Chat (Boond)
app.get('/api/chat', async (req, res, next) => {
  try {
    const history = await db.getChatHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
});

app.post('/api/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get previous chat history
    const history = await db.getChatHistory();
    
    // Log user message
    await db.addChatMessage('user', message);

    // Call Gemini
    const botResponse = await getLeakAssistantResponse(history, message);

    // Log model message
    // Store as JSON string or handle appropriately
    await db.addChatMessage('model', JSON.stringify(botResponse));

    res.status(200).json(botResponse);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// 7. Impact Mirror Analogies
app.get('/api/impact', async (req, res, next) => {
  try {
    const stats = await db.getStats();
    const analogy = await getImpactAnalogy(stats.totalCO2SavedKg);
    res.json(analogy);
  } catch (error) {
    next(error);
  }
});

// 8. Reset DB Endpoint
app.post('/api/reset', async (req, res, next) => {
  try {
    await db.reset();
    res.json({ message: 'Database reset successfully' });
  } catch (error) {
    next(error);
  }
});

// --- PRODUCTION BUILD HOSTING ---

// Serve React production build
const clientBuildPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
    next();
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

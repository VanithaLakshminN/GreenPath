import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Journey Schema ────────────────────────────────────────────────────────────
const journeySchema = new mongoose.Schema(
  {
    userId:          { type: String, required: true, index: true },
    sourceText:      String,
    destinationText: String,
    mode:            String,
    routeId:         String,
    metrics: {
      co2Kg:         Number,
      monetaryCost:  Number,
      durationSeconds: Number,
      distanceKm:    Number,
    },
    co2SavedKg:      { type: Number, default: 0 },
    media:           { type: Array,  default: [] },
    startedAt:       Number,
    completedAt:     Number,
  },
  { timestamps: true }
);

const Journey = mongoose.model('Journey', journeySchema);

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /journeys — save a journey
app.post('/journeys', async (req, res) => {
  try {
    const journey = await Journey.create({ ...req.body, startedAt: Date.now(), completedAt: Date.now() });
    res.status(201).json({ id: journey._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /journeys/:userId — list journeys for a user
app.get('/journeys/:userId', async (req, res) => {
  try {
    const journeys = await Journey.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(
      journeys.map((j) => ({
        id:              j._id,
        userId:          j.userId,
        sourceText:      j.sourceText,
        destinationText: j.destinationText,
        mode:            j.mode,
        routeId:         j.routeId,
        metrics:         j.metrics,
        co2SavedKg:      j.co2SavedKg,
        media:           j.media,
        startedAt:       j.startedAt,
        completedAt:     j.completedAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GreenPath API running on http://localhost:${PORT}`));

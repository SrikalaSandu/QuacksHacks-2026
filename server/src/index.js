import express from "express";
import cors from "cors";
import { db, FieldValue } from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

/**
 * Minimal signup:
 * - Accepts a userId you generate on frontend (hackathon-friendly)
 * - Stores profile in Firestore at users/{userId}
 */
app.post("/users/signup", async (req, res) => {
  try {
    const {
      userId,
      name,
      phoneNumber = "",
      goals = [],
      habits = [],
      checkInTime = "09:00",
      timezone = "America/New_York",
    } = req.body || {};

    // Minimal validation
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required (string)" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required (string)" });
    }
    if (phoneNumber && !/^\+\d{8,15}$/.test(phoneNumber)) {
      return res.status(400).json({ error: "phoneNumber must be like +15551234567" });
    }
    if (!/^\d{2}:\d{2}$/.test(checkInTime)) {
      return res.status(400).json({ error: "checkInTime must be HH:MM like 09:30" });
    }

    const userRef = db.collection("users").doc(userId);

    await userRef.set(
      {
        userId,
        name,
        phoneNumber,
        goals,
        habits,
        checkInTime,
        timezone,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error creating user" });
  }
});
app.get("/users/:userId", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.userId).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    return res.json(doc.data());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
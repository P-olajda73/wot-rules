import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// 🔹 Získanie cesty k súboru (kvôli ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Pripojenie k MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Definovanie schémy
const rulesSchema = new mongoose.Schema({
    language: String,
    tips: [String],
    goal: [String],
    rules: [String]
});
const Rules = mongoose.model("Rules", rulesSchema);


// 🔹 Statické súbory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Routes pre HTML stránky
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// 🔹 API Endpoints pre pravidlá
app.get("/rules/:language", async (req, res) => {
    try {
        const rules = await Rules.findOne({ language: req.params.language });
        if (!rules) return res.status(404).json({ error: "Pravidlá neexistujú." });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: "Chyba pri získavaní pravidiel." });
    }
});

app.post("/rules/:language", async (req, res) => {
    try {
        const { tips, goal, rules } = req.body;
        const updatedRules = await Rules.findOneAndUpdate(
            { language: req.params.language },
            { language: req.params.language, tips, goal, rules },
            { upsert: true, new: true }
        );
        res.json({ message: "Pravidlá boli uložené!", data: updatedRules });
    } catch (error) {
        res.status(500).json({ error: "Chyba pri ukladaní pravidiel." });
    }
});

// ✅ Odstránenie konkrétneho pravidla
app.delete("/rules/:language/:type/:index", async (req, res) => {
  try {
      const { language, type, index } = req.params;
      const idx = parseInt(index, 10);

      // ✅ Načítanie pravidiel pre daný jazyk
      const rulesDoc = await Rules.findOne({ language });
      if (!rulesDoc || !Array.isArray(rulesDoc[type])) {
          return res.status(400).json({ error: "Nesprávny jazyk alebo typ." });
      }

      if (isNaN(idx) || idx < 0 || idx >= rulesDoc[type].length) {
          return res.status(400).json({ error: "Nesprávny index." });
      }

      // ✅ Odstránenie položky zo zoznamu
      rulesDoc[type].splice(idx, 1);
      await rulesDoc.save();

      res.json({ message: "Pravidlo bolo vymazané!", data: rulesDoc });
  } catch (error) {
      res.status(500).json({ error: "Chyba pri mazaní pravidla." });
  }
});

app.listen(PORT, () => console.log(`✅ Server beží na porte ${PORT}`));

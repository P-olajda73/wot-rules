import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import https from "https";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

const flagsToDownload = [
    { name: "cz.png", url: "https://flagcdn.com" },
    { name: "gb.png", url: "https://flagcdn.com" },
    { name: "ru.png", url: "https://flagcdn.com" },
    { name: "de.png", url: "https://flagcdn.com" },
    { name: "ua.png", url: "https://flagcdn.com" },
    { name: "pl.png", url: "https://flagcdn.com" }
];

if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
}

flagsToDownload.forEach(flag => {
    const filePath = path.join(publicPath, flag.name);
    if (!fs.existsSync(filePath)) {
        console.log(`⏳ Stahuji vlajku: ${flag.name}...`);
        const file = fs.createWriteStream(filePath);
        https.get(flag.url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Vlajka ${flag.name} stažena.`);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
        });
    }
});

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const rulesSchema = new mongoose.Schema({
    language: String,
    tips: [String],
    goal: [String],
    rules: [String]
});
const Rules = mongoose.model("Rules", rulesSchema);

app.use(express.static(publicPath));

app.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(publicPath, "login.html")));
app.get("/admin.html", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));

app.get("/rules/:language", async (req, res) => {
    try {
        const rules = await Rules.findOne({ language: req.params.language });
        if (!rules) {
            return res.json({
                language: req.params.language,
                tips: [],
                goal: [],
                rules: []
            });
        }
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

app.delete("/rules/:language/:type/:index", async (req, res) => {
  try {
      const { language, type, index } = req.params;
      const idx = parseInt(index, 10);
      const rulesDoc = await Rules.findOne({ language });
      if (!rulesDoc || !Array.isArray(rulesDoc[type])) {
          return res.status(400).json({ error: "Nesprávny jazyk alebo typ." });
      }
      if (isNaN(idx) || idx < 0 || idx >= rulesDoc[type].length) {
          return res.status(400).json({ error: "Nesprávny index." });
      }
      rulesDoc[type].splice(idx, 1);
      await rulesDoc.save();
      res.json({ message: "Pravidlo bolo vymazané!", data: rulesDoc });
  } catch (error) {
      res.status(500).json({ error: "Chyba pri mazaní pravidla." });
  }
});

app.listen(PORT, () => console.log(`✅ Server beží na porte ${PORT}`));

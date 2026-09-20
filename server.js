const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Zpřístupnění složky "public" pro prohlížeč
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Připojení k MongoDB Atlas (přes proměnnou prostředí v Renderu)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forkillarmy';
mongoose.connect(mongoURI)
  .then(() => console.log('Úspěšně připojeno k MongoDB Atlas'))
  .catch(err => console.error('Chyba připojení k DB:', err));

// 3. Schéma databáze – obsahuje kód jazyka, obrázek vlajky a 3 sloupce obsahu
const ContentSchema = new mongoose.Schema({
  lang: String,       // např. 'cs' nebo 'en'
  flag: String,       // URL nebo cesta k obrázku vlajky (např. '/images/cz-flag.png')
  columns: [
    { title: String, text: String }
  ]
});
const Content = mongoose.model('Content', ContentSchema);

// 4. API Endpoint pro získání obsahu a vlajky podle vybraného jazyka
app.get('/api/content/:lang', async (req, res) => {
  try {
    const lang = req.params.lang;
    const data = await Content.findOne({ lang: lang });
    
    if (data) {
      // Pokud data v MongoDB existují, pošleme je do webu
      res.json(data);
    } else {
      // Pokud data v DB ještě nemáš, vrátíme testovací zálohu, aby web hned fungoval
      const fallback = {
        lang: lang,
        flag: lang === 'cs' ? '🇨🇿' : '🇬🇧', // Textová emoji vlajka jako záloha
        columns: [
          { title: `Sloupec 1 (${lang.toUpperCase()})`, text: 'Vítejte na klanovém webu For Kill Army.' },
          { title: `Sloupec 2 (${lang.toUpperCase()})`, text: 'Zde brzy najdete klanové statistiky a zápasy.' },
          { title: `Sloupec 3 (${lang.toUpperCase()})`, text: 'Připojte se na náš oficiální Discord!' }
        ]
      };
      res.json(fallback);
    }
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání dat z databáze' });
  }
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`Server For Kill Army běží na portu ${PORT}`);
});

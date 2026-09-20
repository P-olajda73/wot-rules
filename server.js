const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Zpřístupnění složky "public" pro prohlížeč
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Připojení k MongoDB Atlas (s ošetřením chyb, aby server nezamrzal)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forkillarmy';
mongoose.connect(mongoURI)
  .then(() => console.log('Úspěšně připojeno k MongoDB Atlas'))
  .catch(err => console.error('Chyba připojení k DB (web pojede z testovacích dat):', err));

// 3. SPRÁVNÉ SCHÉMA pro tvůj index.html (obsahuje pole pravidel, cílů a tipů)
const RulesSchema = new mongoose.Schema({
  lang: String,  // 'cs', 'en', 'ru' atd.
  rules: [String],
  goal: [String],
  tips: [String]
});

// POZOR: Tady definujeme model. Třetí parametr 'rules' říká Mongoose, 
// že má v MongoDB hledat kolekci s přesným názvem "rules" (malými písmeny)
const Rules = mongoose.model('Rules', RulesSchema, 'rules');

// 4. API Endpoint pro tvůj index.html
app.get('/rules/:lang', async (req, res) => {
  // Definice záložních dat pro případ, že v databázi nic není nebo DB nefunguje
  const lang = req.params.lang;
  const fallbackData = {
    cz: {
      rules: ['1. Respektuj ostatní členy klanu For Kill Army.', '2. Aktivně se účastni klanových zápasů.', '3. Používej Discord během společného hraní.'],
      goal: ['Dosáhnout top příček v turnajích.', 'Vybudovat silnou a přátelskou komunitu.'],
      tips: ['Pravidelně trénuj na aim mapách.', 'Komunikuj s týmem jasně a stručně.']
    },
    en: {
      rules: ['1. Respect other members of For Kill Army.', '2. Actively participate in clan matches.', '3. Use Discord during team play.'],
      goal: ['Reach top ranks in tournaments.', 'Build a strong and friendly community.'],
      tips: ['Train regularly on aim maps.', 'Communicate with your team clearly.']
    },
    ru: {
      rules: ['1. Уважай других членов клана For Kill Army.', '2. Активно участвуй в клановых матчах.', '3. Используй Discord во время игры.'],
      goal: ['Достичь топовых мест в турнирах.', 'Построить сильное сообщество.'],
      tips: ['Регулярно тренируйся на аим-картах.', 'Общайся с командой четко и ясно.']
    }
  };

  try {
    // Pokusíme se najít data v MongoDB Atlas (vyprší po 3 sekundách, pokud DB neodpovídá)
    const data = await Rules.findOne({ lang: lang }).maxTimeMS(3000);
    
    if (data && data.rules && data.rules.length > 0) {
      console.log(`Posílám data z DB pro jazyk: ${lang}`);
      return res.json(data);
    } else {
      console.log(`Data v DB nenalezena, posílám záložní texty pro: ${lang}`);
      // Pokud jazyk nemáme v záloze, dáme angličtinu
      const currentFallback = fallbackData[lang] || fallbackData['en'];
      return res.json(currentFallback);
    }
  } catch (error) {
    console.error('Chyba při komunikaci s DB, posílám záložní data:', error);
    // I při chybě DB pošleme záložní data, aby web nezůstal viset na "Načítám..."
    const currentFallback = fallbackData[lang] || fallbackData['en'];
    return res.json(currentFallback);
  }
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`Server For Kill Army běží na portu ${PORT}`);
});

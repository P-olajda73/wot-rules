const API_URL = "https://4kill-production.up.railway.app/rules";

// Objekt s prekladmi nadpisov pre jednotlivé jazyky
const translations = {
    cz: {
        tipsHeading: "RADY A TIPY",
        goalHeading: "CO JE CÍLEM KLANU?",
        rulesHeading: "PRAVIDLA KLANU 4KILL"
    },
    en: {
        tipsHeading: "TIPS AND ADVICE",
        goalHeading: "WHAT IS THE GOAL OF THE CLAN?",
        rulesHeading: "CLAN RULES 4KILL"
    },
    ru: {
        tipsHeading: "СОВЕТЫ И РЕКОМЕНДАЦИИ",
        goalHeading: "КАКОВА ЦЕЛЬ КЛАНА?",
        rulesHeading: "ПРАВИЛА КЛАНА 4KILL"
    },
    de: {
        tipsHeading: "RATSCHLÄGE UND TIPPS",
        goalHeading: "WAS IST DAS ZIEL DES CLANS?",
        rulesHeading: "CLAN REGELN 4KILL"
    },
    ua: {
        tipsHeading: "ПОРАДИ ТА РЕКОМЕНДАЦІЇ",
        goalHeading: "ЯКА МЕТА КЛАНУ?",
        rulesHeading: "ПРАВИЛА КЛАНУ 4KILL"
    },
    pl: {
        tipsHeading: "PORADY I WSKAZÓWKI",
        goalHeading: "JAKI JEST CEL KLANU?",
        rulesHeading: "ZASADY KLANU 4KILL"
    }
};

async function fetchRules(lang) {
    try {
        const response = await fetch(`${API_URL}/${lang}`);
        const data = await response.json();

        if (!data) {
            console.error("Chyba: API nevrátilo žiadne dáta.");
            return;
        }

        const langData = data || { rules: [], goal: [], tips: [] };
        const langTrans = translations[lang] || translations["cz"];

        document.getElementById("rules").innerHTML = `
            <h2>${langTrans.rulesHeading}</h2>
            <ol>${(langData.rules || []).map(rule => `<li>${rule}</li>`).join('')}</ol>

            <h2>${langTrans.goalHeading}</h2>
            <ol>${(langData.goal || []).map(goal => `<li>${goal}</li>`).join('')}</ol>

            <h2>${langTrans.tipsHeading}</h2>
            <ol>${(langData.tips || []).map(tip => `<li>${tip}</li>`).join('')}</ol>
        `;
    } catch (error) {
        console.error("Chyba pri načítaní pravidiel:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchRules("cz");
});

function changeLanguage(lang) {
    fetchRules(lang);
}

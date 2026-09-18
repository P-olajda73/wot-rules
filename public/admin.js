document.addEventListener("DOMContentLoaded", () => {
    const tipsContainer = document.getElementById("tipsContainer");
    const goalContainer = document.getElementById("goalContainer");
    const rulesContainer = document.getElementById("rulesContainer");
    const addTipButton = document.getElementById("addTip");
    const addGoalButton = document.getElementById("addGoal");
    const addRuleButton = document.getElementById("addRule");
    const saveButton = document.getElementById("saveRules");
    const languageSelect = document.getElementById("language");

    const API_URL = "/rules";
    let rulesData = {
        cz: { tips: ["První testovací tip"], goal: ["První testovací cíl"], rules: ["První testovací pravidlo"] }
    };
    let currentLanguage = "cz";

    // ✅ Načíta pravidlá zo servera
    async function loadRules() {
        try {
            const response = await fetch(`${API_URL}/${currentLanguage}`);
            if (response.ok) {
                rulesData[currentLanguage] = await response.json();
            }
        } catch (error) {
            console.error("Chyba pri načítaní pravidiel zo servera:", error);
        }
        renderForm(); // Vykreslíme formulář VŽDY, i při chybě serveru
    }

    // ✅ Vykreslí formulár pre aktuálny jazyk
    function renderForm() {
        if (!tipsContainer || !goalContainer || !rulesContainer) return;
        
        tipsContainer.innerHTML = "";
        goalContainer.innerHTML = "";
        rulesContainer.innerHTML = "";

        if (!rulesData[currentLanguage]) {
            rulesData[currentLanguage] = { tips: [""], goal: [""], rules: [""] };
        }

        const langData = rulesData[currentLanguage];

        langData.tips.forEach((tip, index) => {
            tipsContainer.innerHTML += createInputElement("tips", index, tip);
        });

        langData.goal.forEach((goal, index) => {
            goalContainer.innerHTML += createInputElement("goal", index, goal);
        });

        langData.rules.forEach((rule, index) => {
            rulesContainer.innerHTML += createInputElement("rules", index, rule);
        });

        attachDeleteListeners();
    }

    // ✅ Vytvorí HTML input + delete button
    function createInputElement(type, index, value) {
        return `
            <div class="input-group" style="display: flex; margin-bottom: 5px;">
                <input type="text" data-type="${type}" data-index="${index}" value="${value || ''}" class="text-input" style="flex: 1; padding: 5px;">
                <button class="delete-button" data-type="${type}" data-index="${index}" style="margin-left: 5px; padding: 5px; color: red; cursor: pointer; font-weight: bold;">X</button>
            </div>
        `;
    }

    // ✅ Pridá event listener na delete buttons
    function attachDeleteListeners() {
        document.querySelectorAll(".delete-button").forEach((button) => {
            button.replaceWith(button.cloneNode(true)); // Vyčištění starých listenerů
        });

        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", (e) => {
                const type = e.target.getAttribute("data-type");
                const index = parseInt(e.target.getAttribute("data-index"), 10);

                if (rulesData[currentLanguage] && rulesData[currentLanguage][type]) {
                    rulesData[currentLanguage][type].splice(index, 1);
                    renderForm();
                }
            });
        });
    }

    // ✅ Pridanie nového tipu
    if (addTipButton) {
        addTipButton.addEventListener("click", () => {
            if (!rulesData[currentLanguage]) rulesData[currentLanguage] = { tips: [], goal: [], rules: [] };
            rulesData[currentLanguage].tips.push("");
            renderForm();
        });
    }

    // ✅ Pridanie nového cieľa
    if (addGoalButton) {
        addGoalButton.addEventListener("click", () => {
            if (!rulesData[currentLanguage]) rulesData[currentLanguage] = { tips: [], goal: [], rules: [] };
            rulesData[currentLanguage].goal.push("");
            renderForm();
        });
    }

    // ✅ Pridanie nového pravidla
    if (addRuleButton) {
        addRuleButton.addEventListener("click", () => {
            if (!rulesData[currentLanguage]) rulesData[currentLanguage] = { tips: [], goal: [], rules: [] };
            rulesData[currentLanguage].rules.push("");
            renderForm();
        });
    }

    // ✅ Uloženie pravidiel na server
    async function saveRules() {
        try {
            const updatedRules = { tips: [], goal: [], rules: [] };

            document.querySelectorAll("input[data-type=tips]").forEach((input) => {
                if (input.value.trim()) updatedRules.tips.push(input.value.trim());
            });

            document.querySelectorAll("input[data-type=goal]").forEach((input) => {
                if (input.value.trim()) updatedRules.goal.push(input.value.trim());
            });

            document.querySelectorAll("input[data-type=rules]").forEach((input) => {
                if (input.value.trim()) updatedRules.rules.push(input.value.trim());
            });

            const response = await fetch(`${API_URL}/${currentLanguage}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRules, null, 4)
            });

            if (!response.ok) throw new Error("Chyba pri ukladaní pravidiel.");
            alert("Pravidlá boli úspešne uložené do databázy!");
        } catch (error) {
            console.error("Chyba pri ukladaní pravidiel:", error);
            alert("Chyba pri komunikácii so serverom. Skontrolujte logy.");
        }
    }

    // ✅ Zmena jazyka
    if (languageSelect) {
        languageSelect.addEventListener("change", async (e) => {
            currentLanguage = e.target.value;
            await loadRules();
        });
    }

    // ✅ Event listener na tlačidlo uloženia
    if (saveButton) {
        saveButton.addEventListener("click", saveRules);
    }

    // ✅ Načítanie pravidiel pri štarte
    loadRules();
});

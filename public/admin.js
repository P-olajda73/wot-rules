document.addEventListener("DOMContentLoaded", () => {
    const tipsContainer = document.getElementById("tipsContainer");
    const goalContainer = document.getElementById("goalContainer");
    const rulesContainer = document.getElementById("rulesContainer");
    const addTipButton = document.getElementById("addTip");
    const addGoalButton = document.getElementById("addGoal");
    const addRuleButton = document.getElementById("addRule");
    const saveButton = document.getElementById("saveRules");
    const languageSelect = document.getElementById("language");
    const logoutButton = document.getElementById("logout");

    const API_URL = "/rules";
    let rulesData = {};
    let currentLanguage = "cz";

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.setItem("loggedIn", "false");
            window.location.href = "login.html";
        });
    }

    // ✅ Načíta pravidlá zo servera
    async function loadRules() {
        try {
            const response = await fetch(`${API_URL}/${currentLanguage}`);
            if (!response.ok) throw new Error("Server neodpovedá správne.");
            rulesData[currentLanguage] = await response.json();
            renderForm();
        } catch (error) {
            console.error("Chyba pri načítaní pravidiel:", error);
            rulesData[currentLanguage] = { tips: [], goal: [], rules: [] };
        }
    }

    // ✅ Vykreslí formulár pre aktuálny jazyk
    function renderForm() {
        tipsContainer.innerHTML = "";
        goalContainer.innerHTML = "";
        rulesContainer.innerHTML = "";

        const langData = rulesData[currentLanguage] || { tips: [], goal: [], rules: [] };

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
            <div class="input-group">
                <input type="text" data-type="${type}" data-index="${index}" value="${value || ''}" class="text-input">
                <button class="delete-button" data-type="${type}" data-index="${index}">X</button>
            </div>
        `;
    }

    // ✅ Pridá event listener na delete buttons
    function attachDeleteListeners() {
        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", async (e) => {
                const type = e.target.getAttribute("data-type");
                const index = parseInt(e.target.getAttribute("data-index"));

                try {
                    const response = await fetch(`${API_URL}/${currentLanguage}/${type}/${index}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) throw new Error("Chyba pri odstraňovaní pravidla.");
                    console.log("Pravidlo vymazané.");

                    rulesData[currentLanguage][type].splice(index, 1);
                    renderForm();
                } catch (error) {
                    console.error("Chyba pri odstraňovaní pravidla:", error);
                }
            });
        });
    }

    // ✅ Pridanie nového tipu
    addTipButton.addEventListener("click", () => {
        rulesData[currentLanguage].tips.push("");
        renderForm();
    });

    // ✅ Pridanie nového cieľa
    addGoalButton.addEventListener("click", () => {
        rulesData[currentLanguage].goal.push("");
        renderForm();
    });

    // ✅ Pridanie nového pravidla
    addRuleButton.addEventListener("click", () => {
        rulesData[currentLanguage].rules.push("");
        renderForm();
    });

    // ✅ Uloženie pravidiel na server
    async function saveRules() {
        try {
            const updatedRules = {
                tips: [],
                goal: [],
                rules: []
            };

            document.querySelectorAll("input[data-type=tips]").forEach((input) => {
                if (input.value.trim()) updatedRules.tips.push(input.value.trim());
            });

            document.querySelectorAll("input[data-type=goal]").forEach((input) => {
                if (input.value.trim()) updatedRules.goal.push(input.value.trim());
            });

            document.querySelectorAll("input[data-type=rules]").forEach((input) => {
                if (input.value.trim()) updatedRules.rules.push(input.value.trim());
            });

            if (!updatedRules.tips.length && !updatedRules.goal.length && !updatedRules.rules.length) {
                alert("Nie sú žiadne údaje na uloženie.");
                return;
            }

            const response = await fetch(`${API_URL}/${currentLanguage}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRules, null, 4)
            });

            if (!response.ok) throw new Error("Chyba pri ukladaní pravidiel.");
            alert("Pravidlá boli úspešne uložené!");
        } catch (error) {
            console.error("Chyba pri ukladaní pravidiel:", error);
        }
    }

    // ✅ Zmena jazyka
    languageSelect.addEventListener("change", async (e) => {
        currentLanguage = e.target.value;
        await loadRules();
    });

    // ✅ Event listener na tlačidlo uloženia
    saveButton.addEventListener("click", saveRules);

    // ✅ Načítanie pravidiel pri štarte
    loadRules();
});

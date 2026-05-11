// ============================================================
// ROADWATCH — Frontend to Backend Connection
// This file connects all HTML pages to the Flask backend
// ============================================================

const API_BASE = "https://roadwatch-backend-1d33.onrender.com";

// ============================================================
// 1. AI DAMAGE ANALYSIS
// Called from report.html when user uploads a photo
// ============================================================
async function analysePhoto(imageBase64) {
    try {
        const response = await fetch(`${API_BASE}/api/analyse-damage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageBase64 })
        });
        const data = await response.json();
        return data.analysis;
    } catch (error) {
        console.error("AI Analysis error:", error);
        return null;
    }
}

// ============================================================
// 2. SUBMIT REPORT
// Called from report.html when user clicks Submit
// ============================================================
async function submitReportToBackend(reportData) {
    try {
        const response = await fetch(`${API_BASE}/api/submit-report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Submit report error:", error);
        return null;
    }
}

// ============================================================
// 3. GET ALL REPORTS FOR MAP
// Called from home.html to load pins on the map
// ============================================================
async function loadReportsForMap() {
    try {
        const response = await fetch(`${API_BASE}/api/reports`);
        const data = await response.json();
        return data.reports || [];
    } catch (error) {
        console.error("Load reports error:", error);
        return [];
    }
}

// ============================================================
// 4. GET DASHBOARD STATS
// Called from dashboard.html for live numbers
// ============================================================
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard-stats`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return null;
    }
}

// ============================================================
// 5. GET BUDGET DATA
// Called from budget.html for road spending data
// ============================================================
async function loadBudgetData() {
    try {
        const response = await fetch(`${API_BASE}/api/budget-data`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Budget data error:", error);
        return null;
    }
}

// ============================================================
// 6. UPVOTE A REPORT
// Called when user clicks upvote button
// ============================================================
async function upvoteReport(trackingId) {
    try {
        const response = await fetch(`${API_BASE}/api/reports/${trackingId}/upvote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        return data.upvotes;
    } catch (error) {
        console.error("Upvote error:", error);
        return null;
    }
}

// ============================================================
// 7. ROADBOT CHATBOT
// Powers the floating RoadBot on every page
// ============================================================

// Store chat history for context
let chatHistory = [];

async function sendToRoadBot(userMessage) {
    try {
        // First wake up the server
        await fetch(`${API_BASE}/`).catch(() => {});
        
        // Wait 2 seconds for server to wake up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(`${API_BASE}/api/roadbot`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
                history: chatHistory
            })
        });

        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();

        if (data.reply) {
            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: data.reply });
            if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
        }

        return data.reply || "Sorry I could not process that. Please try again!";

    } catch (error) {
        console.error("RoadBot error:", error);
        return "RoadBot is waking up! Please wait 30 seconds and try again. The server needs a moment to start! ⏳";
    }
}
// ============================================================
// 8. ROADBOT UI
// Floating chatbot widget that works on ALL pages
// ============================================================
function initRoadBot() {
    // Create chatbot HTML
    const botHTML = `
    <div id="roadbot-widget" style="
        position: fixed; bottom: 2rem; right: 2rem;
        z-index: 9999; font-family: 'DM Sans', sans-serif;
    ">
        <!-- Chat Window -->
        <div id="roadbot-window" style="
            display: none;
            width: 320px;
            background: #0D1E35;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: .8rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        ">
            <!-- Header -->
            <div style="
                background: #112240;
                padding: 1rem 1.2rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255,255,255,0.07);
            ">
                <div style="display:flex;align-items:center;gap:.6rem;">
                    <div style="
                        width: 36px; height: 36px;
                        border-radius: 50%;
                        background: rgba(0,232,122,0.15);
                        border: 1px solid rgba(0,232,122,0.3);
                        display: flex; align-items: center;
                        justify-content: center; font-size: 1rem;
                    ">🤖</div>
                    <div>
                        <div style="font-size:.88rem;font-weight:600;color:#F0F4FF;">RoadBot</div>
                        <div style="font-size:.68rem;color:#00E87A;">● Online</div>
                    </div>
                </div>
                <button onclick="toggleRoadBot()" style="
                    background: transparent; border: none;
                    color: #8899BB; cursor: pointer; font-size: 1rem;
                ">✕</button>
            </div>

            <!-- Messages -->
            <div id="roadbot-messages" style="
                height: 280px;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: .6rem;
            ">
                <div class="bot-msg" style="
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px 12px 12px 4px;
                    padding: .7rem .9rem;
                    font-size: .82rem;
                    color: #F0F4FF;
                    line-height: 1.5;
                    max-width: 85%;
                ">
                    👋 Hi! I am RoadBot. I can help you report road damage, check budgets, or find who is responsible for any road in Coimbatore. What do you need?
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="
                padding: .5rem 1rem;
                display: flex; gap: .4rem;
                flex-wrap: wrap;
                border-top: 1px solid rgba(255,255,255,0.07);
            ">
                <button onclick="quickAsk('How do I report a pothole?')" style="
                    background: rgba(0,232,122,0.08);
                    border: 1px solid rgba(0,232,122,0.15);
                    color: #00E87A; padding: .25rem .6rem;
                    border-radius: 100px; font-size: .68rem;
                    cursor: pointer; font-family: inherit;
                ">Report pothole</button>
                <button onclick="quickAsk('Who is responsible for Avinashi Road?')" style="
                    background: rgba(0,232,122,0.08);
                    border: 1px solid rgba(0,232,122,0.15);
                    color: #00E87A; padding: .25rem .6rem;
                    border-radius: 100px; font-size: .68rem;
                    cursor: pointer; font-family: inherit;
                ">Road authority</button>
                <button onclick="quickAsk('How much was spent on Coimbatore roads?')" style="
                    background: rgba(0,232,122,0.08);
                    border: 1px solid rgba(0,232,122,0.15);
                    color: #00E87A; padding: .25rem .6rem;
                    border-radius: 100px; font-size: .68rem;
                    cursor: pointer; font-family: inherit;
                ">Budget info</button>
            </div>

            <!-- Input -->
            <div style="
                padding: .8rem 1rem;
                display: flex; gap: .5rem;
                border-top: 1px solid rgba(255,255,255,0.07);
            ">
                <input
                    id="roadbot-input"
                    type="text"
                    placeholder="Ask me anything..."
                    onkeypress="if(event.key==='Enter') sendBotMessage()"
                    style="
                        flex: 1;
                        background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(255,255,255,0.07);
                        border-radius: 10px;
                        padding: .6rem .8rem;
                        color: #F0F4FF;
                        font-size: .82rem;
                        outline: none;
                        font-family: inherit;
                    "
                />
                <button onclick="sendBotMessage()" style="
                    background: #00E87A;
                    border: none; border-radius: 10px;
                    width: 36px; height: 36px;
                    cursor: pointer; font-size: 1rem;
                    display: flex; align-items: center;
                    justify-content: center;
                ">→</button>
            </div>
        </div>

        <!-- Floating Button -->
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:.8rem;">
            <div id="roadbot-tooltip" style="
                background: #112240;
                border: 1px solid rgba(255,255,255,0.07);
                color: #F0F4FF;
                font-size: .78rem;
                padding: .4rem .9rem;
                border-radius: 100px;
                white-space: nowrap;
                animation: float 3s ease-in-out infinite;
            ">Ask RoadBot 💬</div>
            <button onclick="toggleRoadBot()" style="
                width: 52px; height: 52px;
                border-radius: 50%;
                background: #00E87A;
                border: none; cursor: pointer;
                font-size: 1.3rem;
                box-shadow: 0 8px 32px rgba(0,232,122,0.35);
                animation: float 3s ease-in-out infinite;
                transition: transform .3s;
            ">🤖</button>
        </div>
    </div>

    <style>
        @keyframes float {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-5px); }
        }
        #roadbot-messages::-webkit-scrollbar { width: 3px; }
        #roadbot-messages::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
        }
    </style>
    `;

    // Add to page
    document.body.insertAdjacentHTML("beforeend", botHTML);
}

function toggleRoadBot() {
    const window_  = document.getElementById("roadbot-window");
    const tooltip  = document.getElementById("roadbot-tooltip");
    const isOpen   = window_.style.display !== "none";
    window_.style.display  = isOpen ? "none"  : "block";
    tooltip.style.display  = isOpen ? "flex"  : "none";
}

async function sendBotMessage() {
    const input = document.getElementById("roadbot-input");
    const msg   = input.value.trim();
    if (!msg) return;

    input.value = "";
    addMessage(msg, "user");
    addMessage("⏳ Thinking... (may take 30 seconds if server just woke up)", "bot", "typing");

    const reply = await sendToRoadBot(msg);

    // Remove typing indicator
    const typing = document.getElementById("typing");
    if (typing) typing.remove();

    addMessage(reply, "bot");
}

function quickAsk(question) {
    document.getElementById("roadbot-input").value = question;
    sendBotMessage();
}

function addMessage(text, sender, id = "") {
    const messages = document.getElementById("roadbot-messages");
    const isBot    = sender === "bot";

    const div = document.createElement("div");
    if (id) div.id = id;

    div.style.cssText = `
        background: ${isBot ? "rgba(255,255,255,0.04)" : "rgba(0,232,122,0.1)"};
        border: 1px solid ${isBot ? "rgba(255,255,255,0.07)" : "rgba(0,232,122,0.2)"};
        border-radius: ${isBot ? "12px 12px 12px 4px" : "12px 12px 4px 12px"};
        padding: .7rem .9rem;
        font-size: .82rem;
        color: #F0F4FF;
        line-height: 1.5;
        max-width: 85%;
        align-self: ${isBot ? "flex-start" : "flex-end"};
        white-space: pre-wrap;
    `;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ============================================================
// AUTO INIT — Runs on every page
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Remove old hardcoded chatbot buttons if any
    const oldBtns = document.querySelectorAll(".chatbot-btn, .chatbot-tooltip");
    oldBtns.forEach(b => b.remove());

    // Start RoadBot
    initRoadBot();
    // Keep Render backend alive — pings every 5 minutes
setInterval(() => {
    fetch(`${API_BASE}/`)
        .catch(() => {});
}, 300000);

    console.log("✅ RoadWatch connected to backend at", API_BASE);
});
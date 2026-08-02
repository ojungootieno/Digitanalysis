// ====== DERIV MASTER MULTI-MARKET PRO SCANNER ======
const app_id = 1089;
const marketList = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100']; 

let ws;
let pingInterval;

// Central memory bank for all tracked metrics
let marketMetrics = {};
marketList.forEach(m => {
    marketMetrics[m] = {
        history: [],
        counts: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0},
        score: 0,
        suggestion: "Analyzing..."
    };
});

function connectWebSocket() {
    // Connects to public production gateway channel
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Analysis Engine Active");
        updateUIStatus("Status: Connected");

        // Keep connection alive (Fix 1006 error loop)
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);

        // Subscribe to every market in our scanner list
        marketList.forEach(symbol => {
            ws.send(JSON.stringify({ ticks: symbol }));
        });
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'ping') return;

        if (data.msg_type === 'tick' && data.tick) {
            const symbol = data.tick.symbol;
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));

            processMarketData(symbol, lastDigit);
        }
    };

    ws.onclose = function () {
        clearInterval(pingInterval);
        updateUIStatus("Status: Reconnecting...");
        setTimeout(connectWebSocket, 3000);
    };
}

function processMarketData(symbol, digit) {
    let m = marketMetrics[symbol];
    if (!m) return;

    // Maintain 100 rolling ticks data window
    m.history.push(digit);
    m.counts[digit] += 1;
    if (m.history.length > 100) {
        const removed = m.history.shift();
        m.counts[removed] = Math.max(0, m.counts[removed] - 1);
    }

    // Dynamic UI table updates based on dropdown selection
    const activeSelection = document.getElementById('market')?.value || 'R_100';
    if (symbol === activeSelection) {
        const lastDigitBox = document.getElementById('lastDigit');
        if (lastDigitBox) lastDigitBox.innerText = `Last Digit: ${digit}`;
        
        // Fills your HTML rows count0, count1, etc.
        for (let i = 0; i <= 9; i++) {
            const row = document.getElementById(`count${i}`);
            if (row) row.innerText = m.counts[i];
        }
    }

    // Run strategy math
    runAnalysisLogic(symbol);
}

function runAnalysisLogic(symbol) {
    let m = marketMetrics[symbol];
    if (m.history.length < 10) return; 

    // THE FIXED MATH LINES: Correctly pulling from individual digit items
    let underCount = m.counts[0] + m.counts[1] + m.counts[2] + m.counts[3] + m.counts[4];
    let overCount = m.counts[5] + m.counts[6] + m.counts[7] + m.counts[8] + m.counts[9];

    let total = m.history.length;
    let underPct = Math.round((underCount / total) * 100);
    let overPct = Math.round((overCount / total) * 100);

    // Score based on statistical deviation from normal expectations
    let deviation = Math.abs(underPct - overPct);
    m.score = Math.min(100, Math.round((deviation / 50) * 100));

    // Over/Under Signals
    if (underPct > 55) {
        m.suggestion = `🔥 Buy UNDER 5 (${underPct}% Under Bias)`;
    } else if (overPct > 55) {
        m.suggestion = `🔥 Buy OVER 4 (${overPct}% Over Bias)`;
    } else {
        m.suggestion = "⏳ Balanced Market (No Trade)";
    }

    renderDashboardData();
}

function renderDashboardData() {
    let leaderboard = document.getElementById('bestMarketsBox');
    if (!leaderboard) {
        const container = document.body;
        leaderboard = document.createElement('div');
        leaderboard.id = 'bestMarketsBox';
        leaderboard.style.cssText = "background:#1e293b; color:#fff; padding:15px; margin:20px; border-radius:8px; font-family:sans-serif; text-align:left;";
        container.appendChild(leaderboard);
    }

    let sortedMarkets = [...marketList].sort((a, b) => marketMetrics[b].score - marketMetrics[a].score);

    let htmlContent = `<h3 style='margin-top:0; color:#38bdf8; text-align:center;'>📊 Live Market Scoring & Signals</h3>`;
    sortedMarkets.forEach((m, idx) => {
        let name = m.replace('R_', 'Volatility ');
        let data = marketMetrics[m];
        let medal = idx === 0 ? "🏆 " : "⭐ ";
        
        htmlContent += `
            <div style="border-bottom:1px solid #334155; padding:8px 0; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${medal}${name}</strong><br/>
                    <span style="color:#f43f5e; font-size:12px;">${data.suggestion}</span>
                </div>
                <div style="text-align:right;">
                    <span style="background:#334155; padding:4px 8px; border-radius:4px; color:#4ade80; font-weight:bold;">Score: ${data.score}/100</span>
                </div>
            </div>
        `;
    });

    leaderboard.innerHTML = htmlContent;
}

function updateUIStatus(text) {
    const el = document.getElementById('status');
    if (el) el.innerText = text;
}

// Start core system loop
connectWebSocket();

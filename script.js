const app_id = 1089; // Using standard Deriv app_id
const token = 'rWfS9wAsbE8mY3K'; // Your active token
const tickSymbol = 'R_100'; // Default symbol

let ws;
let pingInterval;

function connectWebSocket() {
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Connected to Deriv WebSocket");
        
        // 1. Authorize connection
        ws.send(JSON.stringify({ authorize: token }));

        // 2. FIX FOR 1006 ERROR: Send heartbeat ping every 30 seconds
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        // Ignore heartbeat replies so they don't break your metrics
        if (data.msg_type === 'ping') return;

        // Handle authorization success
        if (data.msg_type === 'authorize' && !data.error) {
            console.log("Authorized successfully!");
            // Subscribe to live tick streams
            ws.send(JSON.stringify({ ticks: tickSymbol }));
            return;
        }

        // Process live digits/ticks
        if (data.msg_type === 'tick' && data.tick) {
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));
            console.log("New Tick:", quoteStr, "Last Digit:", lastDigit);
            
            // Send digit over to your table update functions
            if (typeof updateDigitAnalysis === 'function') {
                updateDigitAnalysis(lastDigit);
            }
        }
    };

    ws.onclose = function (error) {
        console.log(`WebSocket closed (Code: ${error.code}). Reconnecting in 3s...`);
        clearInterval(pingInterval);
        
        // AUTO-RECONNECT LOOP: Restarts connection instantly if 1006 occurs
        setTimeout(() => {
            connectWebSocket();
        }, 3000);
    };

    ws.onerror = function (err) {
        console.error("WebSocket Error:", err);
        ws.close();
    };
}

// Start the application
connectWebSocket();

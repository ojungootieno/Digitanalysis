const app_id = 1089; 
const tickSymbol = 'R_100'; 

let ws;
let pingInterval;

// Memory storage to hold the count values for digits 0 through 9
let digitCounts = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};

function connectWebSocket() {
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Connected to Deriv WebSocket");
        
        // Target your exact HTML id="status"
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerText = "Status: Connected";
        }

        // Keep connection active (Fix 1006 error)
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);

        // Stream ticks instantly
        ws.send(JSON.stringify({ ticks: tickSymbol }));
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.msg_type === 'ping') return;

        if (data.msg_type === 'tick' && data.tick) {
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));
            console.log("New Last Digit:", lastDigit);
            
            // Run the custom table update math
            processNewDigit(lastDigit);
        }
    };

    ws.onclose = function (error) {
        console.log(`WebSocket closed (Code: ${error.code}). Reconnecting...`);
        clearInterval(pingInterval);
        
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerText = "Status: Reconnecting...";
        }
        
        setTimeout(() => {
            connectWebSocket();
        }, 3000);
    };

    ws.onerror = function (err) {
        console.error("WebSocket Error:", err);
        ws.close();
    };
}

// MATCHES YOUR EXACT HTML ID TARGETS
function processNewDigit(digit) {
    if (digit >= 0 && digit <= 9) {
        // 1. Increment counter array
        digitCounts[digit] += 1;

        // 2. Targets your specific table IDs (count0, count1, count2...)
        const targetCell = document.getElementById(`count${digit}`);
        if (targetCell) {
            targetCell.innerText = digitCounts[digit];
        }

        // 3. Targets your exact HTML last digits container id="lastDigit"
        const lastDigitDisplay = document.getElementById('lastDigit');
        if (lastDigitDisplay) {
            lastDigitDisplay.innerText = "Last Digit: " + digit;
        }
    }
}

// Start the tool loop
connectWebSocket();

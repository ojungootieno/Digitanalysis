// FORCED PRODUCTION GATEWAY IMPLEMENTATION
const app_id = 1089; 
const tickSymbol = 'R_100'; 

let ws;
let pingInterval;
let digitCounts = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};

function connectWebSocket() {
    // Uses the alternate production socket string to clear strict mobile network firewalls
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Connected Successfully");
        updateUIStatus("Status: Connected");

        // Keep session active (Fix 1006 error)
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);

        // Request data channel instantly
        ws.send(JSON.stringify({ ticks: tickSymbol }));
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.msg_type === 'ping') return;

        if (data.msg_type === 'tick' && data.tick) {
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));
            
            // Send directly to the counts processor
            updateTableData(lastDigit);
        }
    };

    ws.onclose = function (error) {
        clearInterval(pingInterval);
        updateUIStatus("Status: Reconnecting...");
        setTimeout(() => { connectWebSocket(); }, 3000);
    };

    ws.onerror = function (err) {
        ws.close();
    };
}

function updateTableData(digit) {
    if (digit >= 0 && digit <= 9) {
        digitCounts[digit] += 1;

        // Force an update to your specific ID matching layout: count0, count1...
        const targetCell = document.getElementById(`count${digit}`);
        if (targetCell) {
            targetCell.innerText = digitCounts[digit];
        }

        const lastDigitDisplay = document.getElementById('lastDigit');
        if (lastDigitDisplay) {
            lastDigitDisplay.innerText = "Last Digit: " + digit;
        }
    }
}

function updateUIStatus(text) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.innerText = text;
    }
}

connectWebSocket();

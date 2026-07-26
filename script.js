// Copy this absolute layout backup version
const app_id = 1089; 
const tickSymbol = 'R_100'; 

let ws;
let pingInterval;
let digitCounts = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};

function connectWebSocket() {
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Connected to Deriv WebSocket");
        
        // Safety search for your exact status HTML text matching id or inner text
        updateUIStatus("Status: Connected");

        // Maintain connection active loop (Fixes 1006 abnormal timeout drop)
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);

        // Stream ticks immediately
        ws.send(JSON.stringify({ ticks: tickSymbol }));
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.msg_type === 'ping') return;

        if (data.msg_type === 'tick' && data.tick) {
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));
            console.log("New Last Digit parsed:", lastDigit);
            
            // Execute the layout updates safely
            updateTableData(lastDigit);
        }
    };

    ws.onclose = function (error) {
        console.log(`WebSocket dropped (Code: ${error.code}). Reconnecting...`);
        clearInterval(pingInterval);
        updateUIStatus("Status: Reconnecting...");
        
        setTimeout(() => {
            connectWebSocket();
        }, 3000);
    };

    ws.onerror = function (err) {
        console.error("WebSocket network level error encountered:", err);
        ws.close();
    };
}

function updateTableData(digit) {
    if (digit >= 0 && digit <= 9) {
        digitCounts[digit] += 1;

        // Mode 1: Targets your explicit id names: count0, count1, count2...
        const targetCell = document.getElementById(`count${digit}`);
        if (targetCell) {
            targetCell.innerText = digitCounts[digit];
        }

        // Mode 2: Absolute raw table structural fallback search if IDs fail to register
        let cells = Array.from(document.querySelectorAll('td'));
        for(let i = 0; i < cells.length; i++) {
            if(cells[i].innerText.trim() === digit.toString()) {
                if(cells[i+1] && !cells[i+1].id) {
                    cells[i+1].innerText = digitCounts[digit];
                }
            }
        }

        // Target your explicit current digit box text id="lastDigit"
        const lastDigitDisplay = document.getElementById('lastDigit') || document.getElementById('last-digit');
        if (lastDigitDisplay) {
            lastDigitDisplay.innerText = "Last Digit: " + digit;
        }
    }
}

function updateUIStatus(text) {
    const statusElement = document.getElementById('status') || document.querySelector('.status');
    if (statusElement) {
        statusElement.innerText = text;
    }
    // Deep fallback scan across text paragraphs to catch plain text layout placeholders
    document.querySelectorAll('p, div, h3').forEach(el => {
        if(el.innerText.includes('Status:')) {
            el.innerText = text;
        }
    });
}

// Start application tool loop
connectWebSocket();

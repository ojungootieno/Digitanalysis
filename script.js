const app_id = 1089; 
const tickSymbol = 'R_100'; 

let ws;
let pingInterval;

// Create a memory box to hold the counts for digits 0 through 9
let digitCounts = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
let totalTicks = 0;

function connectWebSocket() {
    ws = new WebSocket(`wss://://derivws.com{app_id}`);

    ws.onopen = function () {
        console.log("Connected to Deriv WebSocket");
        
        // Update status text on screen
        updateStatusText("Status: Connected");

        // Keep connection alive (Fix 1006)
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);

        // Stream ticks
        ws.send(JSON.stringify({ ticks: tickSymbol }));
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.msg_type === 'ping') return;

        if (data.msg_type === 'tick' && data.tick) {
            const quoteStr = data.tick.quote.toString();
            const lastDigit = parseInt(quoteStr.slice(-1));
            console.log("New Last Digit:", lastDigit);
            
            // Run the math function to update the frequency
            processNewDigit(lastDigit);
        }
    };

    ws.onclose = function (error) {
        console.log(`WebSocket closed (Code: ${error.code}). Reconnecting...`);
        clearInterval(pingInterval);
        updateStatusText("Status: Reconnecting...");
        
        setTimeout(() => {
            connectWebSocket();
        }, 3000);
    };

    ws.onerror = function (err) {
        console.error("WebSocket Error:", err);
        ws.close();
    };
}

// MATH & TABLE UPDATING FUNCTION
function processNewDigit(digit) {
    if (digit >= 0 && digit <= 9) {
        // 1. Add 1 to the count for this digit
        digitCounts[digit] += 1;
        totalTicks += 1;

        // 2. Find the row in your HTML table and change the number
        // This looks for standard table layouts or element IDs
        const cells = document.querySelectorAll('table td, .digit-row');
        
        // Loop through the table cells to find the matching digit and update its count column
        let cellsArray = Array.from(document.querySelectorAll('td'));
        for(let i = 0; i < cellsArray.length; i++) {
            if(cellsArray[i].innerText.trim() == digit.toString()) {
                // If this cell is the digit label, the next cell over is its count value!
                if(cellsArray[i+1]) {
                    cellsArray[i+1].innerText = digitCounts[digit];
                }
            }
        }

        // Also update any general status text tracking digits if available
        const lastDigitDisplay = document.getElementById('last-digit') || document.querySelector('.last-digit');
        if (lastDigitDisplay) {
            lastDigitDisplay.innerText = "Last Digit: " + digit;
        }
    }
}

function updateStatusText(text) {
    // Searches common status element selectors across your UI
    const statusElement = document.getElementById('status') || document.querySelector('.status') || document.body;
    // Safe check if your status element text is directly inside a paragraph tag
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
        if(p.innerText.includes('Status:')) {
            p.innerText = text;
        }
    });
}

// Launch the tool loop
connectWebSocket();

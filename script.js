const digitElement = document.getElementById("digit");
const historyElement = document.getElementById("history");
const marketSelect = document.getElementById("market");
const statusElement = document.getElementById("status");

let history = [];
let counts = {
    0:0,1:0,2:0,3:0,4:0,
    5:0,6:0,7:0,8:0,9:0
};

function resetData() {
    history = [];

    counts = {
        0:0,1:0,2:0,3:0,4:0,
        5:0,6:0,7:0,8:0,9:0
    };

    digitElement.textContent = "-";
    historyElement.textContent = "";

    for (let i = 0; i <= 9; i++) {
        document.getElementById("d" + i).textContent = "0";
    }
}

function analyzeDigit(digit) {

    digitElement.textContent = digit;

    history.unshift(digit);

    if (history.length > 20) {
        history.pop();
    }

    historyElement.textContent = history.join(" ");

    counts[digit]++;

    for (let i = 0; i <= 9; i++) {
        document.getElementById("d" + i).textContent = counts[i];
    }
}

let connection;

function connectToMarket(symbol) {

    if (connection) {
        connection.close();
    }

    statusElement.textContent = "Status: Connecting...";

    connection = new WebSocket(
        "wss://ws.deriv.com/websockets/v3?app_id=33ShJudJnwVSh7EiKMdyI"
    );

    connection.onopen = () => {

        statusElement.textContent = "Status: Connected";

        connection.send(JSON.stringify({
            ticks: symbol,
            subscribe: 1
        }));

    };

    connection.onmessage = (event) => {

        const data = JSON.parse(event.data);

        if (data.error) {
            statusElement.textContent = "Status: " + data.error.message;
            return;
        }

        if (data.tick) {

            const price = data.tick.quote.toString();
            const digit = Number(price.slice(-1));

            analyzeDigit(digit);
        }

    };

    connection.onerror = (error) => {
    console.log(error);
    statusElement.textContent = "Status: Connection Error";
};

    connection.onclose = (event) => {
    statusElement.textContent =
        "Closed: " + event.code + " " + event.reason;
};

}

marketSelect.addEventListener("change", () => {

    resetData();
    connectToMarket(marketSelect.value);

});

connectToMarket(marketSelect.value);

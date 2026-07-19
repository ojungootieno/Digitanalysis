const digitElement = document.getElementById("digit");
const historyElement = document.getElementById("history");
const marketSelect = document.getElementById("market");

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
const testDigits = [7,1,9,5,7,7,3,2,0,8,7,6,1,4,9];

let index = 0;

setInterval(() => {
const connection = new WebSocket(
    "wss://ws.derivws.com/websockets/v3?app_id=33ShJudJnwVSh7EiKMdyI"
);

connection.onopen = () => {
    console.log("Connected to Deriv");
};

connection.onerror = (error) => {
    console.log("Connection error", error);
};

connection.onclose = () => {
    console.log("Connection closed");
};
    analyzeDigit(testDigits[index]);

    index++;

    if (index >= testDigits.length) {
        index = 0;
    }

}, 1000);

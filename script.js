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

connection.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if (data.tick) {

        const price = data.tick.quote.toString();

        const digit = Number(price.slice(-1));

        analyzeDigit(digit);

    }

};

connection.onopen = () => {

    connection.send(JSON.stringify({

        ticks: "R_100"

    }));

};

const digitElement = document.getElementById("digit");
const historyElement = document.getElementById("history");
const marketSelect = document.getElementById("market");
const statusElement = document.getElementById("status");

statusElement.textContent = "Status: Test Mode";

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



marketSelect.addEventListener("change", () => {
    resetData();
});

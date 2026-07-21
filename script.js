const digitElement = document.getElementById("digit");
const historyElement = document.getElementById("history");
const marketSelect = document.getElementById("market");

const connection = new WebSocket(
    "wss://ws.derivws.com/websockets/v3?app_id=33ShJudJnwVSh7EiKMdyI"
);

connection.onopen = () => {
    document.getElementById("status").textContent = "Status: Connected";

    connection.send(JSON.stringify({
        ticks: marketSelect.value,
        subscribe: 1
    }));
};

connection.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.tick) {
        const price = data.tick.quote.toString();
        const digit = Number(price.slice(-1));

        console.log("Live digit:", digit);
    }

    if (data.error) {
        console.log("Deriv error:", data.error);
    }
};

connection.onerror = () => {
    document.getElementById("status").textContent = "Status: Connection Error";
};

connection.onclose = () => {
    document.getElementById("status").textContent = "Status: Connection Closed";
};

let history = [];
let counts = {
    0:0,1:0,2:0,3:0,4:0,
    5:0,6:0,7:0,8:0,9:0
};

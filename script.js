const appId = "YOUR_APP_ID";

const socket = new WebSocket(
  `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
);

socket.onopen = () => {
  console.log("Connected to Deriv");

  socket.send(JSON.stringify({
    ticks: "R_75"
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.tick) {
    const price = data.tick.quote.toString();
    const lastDigit = price.charAt(price.length - 1);

    document.getElementById("digit").textContent = lastDigit;

    console.log("Price:", price);
    console.log("Last Digit:", lastDigit);
  }
};

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();
const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.sendFile(new URL("index.html", import.meta.url).pathname);
});

server.on("request", app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/** WEB SOCKETS */

const wss = new WebSocketServer({ server });

const close = () => {
  console.log("A client has disconnected.");
};

const connection = (ws) => {
  const numberOfClients = wss.clients.size;
  console.log("Clients connected: ", numberOfClients);

  wss.broadcast(`Current visitors: ${numberOfClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server!");
  }

  ws.on("close", close);
};

wss.on("connection", connection);

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};

wss.broadcast = broadcast;

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import sqlite from "sqlite3";

const server = http.createServer();
const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.sendFile(new URL("index.html", import.meta.url).pathname);
});

server.on("request", app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("SIGINT", () => {
  console.log("@@@@SIGINT");
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    shutDownDB();
  });
});

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

  db.run(
    `
    INSERT INTO visitors (count, time) 
    VALUES (?, datetime('now'))
  `,
    [numberOfClients]
  );

  ws.on("close", close);
};

wss.on("connection", connection);

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};

wss.broadcast = broadcast;

/** DATABASE */

const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

const getCounts = () => {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
};

const shutDownDB = () => {
  getCounts();
  console.log("Shutting down db");
  db.close();
};

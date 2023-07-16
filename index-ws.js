import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'sqlite3';
const { Database } = pkg;
const app = express();
const server = createServer(app);
const io = new Server(server);
const db = new Database(':memory:');


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  console.log('Getting counts');
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  }, (err, rowCount) => {
    console.log('Total rows:', rowCount);
  });
}


function shutDownDB() {
  getCounts();
  console.log('Shutting down database');
  db.close();
}

const shutdown = () => {
  console.log('SIGINT signal received');

  io.sockets.sockets.forEach((client) => {
    client.disconnect(true);
  });

  server.close(() => {
    shutDownDB();
    console.log('Process terminated');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', (socket) => {
  console.log('Client connected');

  const numClients = io.sockets.sockets.size;
  console.log('Number of clients:', numClients);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg);
  });

  db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
  `);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});



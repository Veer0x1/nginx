import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express();
const server = createServer(app);
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
}
);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('chat message', (msg) => {
        console.log('Message received: ', msg);
        io.emit('chat message', msg);
    }
    );
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    }
    );
}
);


server.listen(3000, () => {
    console.log('Listening on port 3000');
}
);



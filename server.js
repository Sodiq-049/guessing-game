const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

let gameSessions = {};

// Function to find a session by ID
const findSessionById = (sessionId) => {
    return gameSessions[sessionId];
};

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('createSession', (data) => {
        const sessionId = data.sessionId;
        const question = data.question;
        const answer = data.answer;

        console.log(`Creating session ${sessionId}`);

        // Create a new game session
        gameSessions[sessionId] = { players: [], question, answer };
        socket.join(sessionId);
        io.to(sessionId).emit('gameMessage', 'Game session created. Waiting for players...');
        io.to(sessionId).emit('displayQuestion', question);
        console.log(`Game session created: ${sessionId}`);
    });

    socket.on('joinSession', (data) => {
        const sessionId = data.sessionId;
        const playerName = data.playerName; // Get player name from data
        const session = findSessionById(sessionId);

        if (session) {
            session.players.push(playerName); // Add player to session
            socket.join(sessionId); // Join the socket to the room
            io.to(sessionId).emit('updatePlayers', session.players); // Update all players
            io.to(sessionId).emit('gameMessage', `${playerName} has joined the game.`);
            socket.emit('joinSessionResponse', { success: true });
        } else {
            socket.emit('joinSessionResponse', { success: false, message: 'Session not found.' });
        }
    });

    socket.on('submitGuess', (data) => {
        const sessionId = data.sessionId;
        const guess = data.guess;
        const session = findSessionById(sessionId);

        if (session && session.answer) {
            if (guess === session.answer) {
                io.to(sessionId).emit('gameMessage', `Correct! ${socket.id} has won!`);
                // Logic to end the game and reset
            } else {
                io.to(sessionId).emit('gameMessage', 'Incorrect guess. Try again!');
            }
        }
    });

    socket.on('startGame', (data) => {
        const sessionId = data.sessionId;
        const session = findSessionById(sessionId);

        if (session && session.players.length > 1) {
            io.to(sessionId).emit('displayQuestion', session.question);
            io.to(sessionId).emit('gameMessage', 'The game has started! Players have 3 attempts to guess the answer.');
            // Logic to start the timer and manage attempts
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        // Logic to handle player disconnection
        // You may want to remove the player from the session and notify others
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messagesDiv = document.getElementById('messages'); // Define messagesDiv here

    // Create a new game session
    document.getElementById('create-session-button').addEventListener('click', () => {
        const sessionId = document.getElementById('session-id').value;
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;

        if (sessionId && question && answer) {
            socket.emit('createSession', { sessionId, question, answer });
            document.getElementById('session-id').value = '';
            document.getElementById('question').value = '';
            document.getElementById('answer').value = '';
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Join an existing game session
    document.getElementById('join-session-button').addEventListener('click', () => {
        const sessionId = document.getElementById('join-session-id').value;
        const playerName = document.getElementById('player-name').value; // Get player name
        if (sessionId && playerName) {
            socket.emit('joinSession', { sessionId, playerName });
            document.getElementById('join-session-id').value = '';
            document.getElementById('player-name').value = '';
        } else {
            alert('Please fill in both fields.');
        }
    });

    // Submit a guess
    document.getElementById('submit-guess').addEventListener('click', () => {
        const sessionId = document.getElementById('session-id').value; // Get the current session ID
        const guess = document.getElementById('guess-input').value;
        if (sessionId && guess) {
            socket.emit('submitGuess', { sessionId, guess }); // Send both session ID and guess
            document.getElementById('guess-input').value = '';
        } else {
            alert('Please enter a guess.');
        }
    });

    // Update the player list
    socket.on('updatePlayerList', (players) => {
        const playerDiv = document.getElementById('players');
        playerDiv.innerHTML = ''; // Clear existing list
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.textContent = player;
            playerDiv.appendChild(playerElement);
        });
    });

    // Display the current question
    socket.on('displayQuestion', (question) => {
        document.getElementById('question').innerText = question;
    });

    // Display game messages
    socket.on('gameMessage', (message) => {
        console.log(`Received game message: ${message}`);
        messagesDiv.innerHTML += `<p>${message}</p>`; // Use messagesDiv here
    });

    // Handle the response when joining a session
    socket.on('joinSessionResponse', (response) => {
        if (response.success) {
            document.getElementById('messages').innerText = 'Successfully joined the session.';
            document.getElementById('chat-interface').style.display = 'block'; // Show the chat interface
        } else {
            document.getElementById('messages').innerText = 'Failed to join the session: ' + response.message;
        }
    });
});
const express = require('express');
const app = express(); 
const server = require('http').Server(app);
const io = require('socket.io')(server); 

var board = [ // 2D array signifying the board
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

let currentPlayer = 1; // Player whos turn it currently is
let turnNumber = 1;  // Number of the current turn
let previousLoser = 2; // Loser of the previous game

let gameOver = 0 // Whether or not the game is currently over
let isDraw = 0; // Tells if the game ends in a draw

let playerOneWins = 0; // How many wins for player 1
let playerTwoWins = 0; // How many wins for player 2
let draws = 0; // Number of draws

let players = 0; // Number of players connected

app.use(express.static('.')); 

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/display.html'); 
}); 

io.on("connect", function(socket){ // Handles what happens upon connection, defines all function for socket
    players ++; // Increases number of players in the game

    socket.on("Player Number", function() { // Called immediately upon player joining game, sends back their player ID
        socket.emit("Joined", players) // Returns a succesful message to the client with its ID
        if (players == 2) { // If the player joining is the second
            socket.broadcast.emit("Player 2 Joined"); // Tells the first player Player 2 Joined
        }
    });

    socket.on('Try Move', function(row, column, id) { // On an atempted move
        move(row, column, id); // Function to make move
    });

    socket.on('Reset', function() { // On reset of the game board
        reset(); // Function to reset the game board
    })

    socket.on('disconnect', function(){ // On player disconnecting 
        players --; // Remove one from total players
    });
});

server.listen(8000); // Start listening to server on local port 8000

async function move(row, column, id) { // Performs a move for the current player
    let status; // Status of the move (0-1 are successful, 2-6 are unsuccessful)
    
    if (gameOver) { // If the game is over
        status = 3; // 3 = Game is already over
    }
    else if(board[row][column] != 0) {// Checks if there the selected space has already been selected
        status = 4; // 4 = Space already chosen 
    }
    else if (id != currentPlayer) { // If the id of the move is not the current player
        status = 5; // 5 = Move made by player when it is not their turn
    }
    else if (players < 2) { // If there are less than 2 players on the server
        status = 6; // 6 = Not enough players to begin the game
    }
    else { // The move is valid 
        board[row][column] = currentPlayer; // Sets the correct space to the current player
        status = await checkWin(); // Checks to see if the game has been won and waits for the response
    }

    // Checks to see who the current player is and how many wins they have if the game did not end in a draw
    let wins = isDraw ? draws : currentPlayer == 1 ? playerOneWins : playerTwoWins; 
    // Send the move made, the status of the move, the player who made the move, and how many wins they have
    io.emit("Move", row, column, status, currentPlayer, wins, id);
    currentPlayer = currentPlayer == 1 ? 2:1 // Set current player to next player
}

function checkWin() { // Checks to see if a win condition has been met
    if (checkEqual(board[0])) win(); // Checks the first row
    else if (checkEqual(board[1])) win(); // Checks the second row
    else if (checkEqual(board[2])) win(); // Checks the third row
    else if (checkEqual([board[0][0], board[1][0], board[2][0]])) win(); // Checks the first column
    else if (checkEqual([board[0][1], board[1][1], board[2][1]])) win(); // Checks the second column
    else if (checkEqual([board[0][2], board[1][2], board[2][2]])) win(); // Checks the third column
    else if (checkEqual([board[0][0], board[1][1], board[2][2]])) win(); // Checks the first diagonal
    else if (checkEqual([board[2][0], board[1][1], board[0][2]])) win(); // Checks the second diagonal
    else if (turnNumber == 9) win(1); // Ends the game if there is a draw

    if (gameOver == 1) {
        return isDraw == 1 ? 2 : 1; // 1 = Game is over because a player one, 2 = Game is over because of a draw
    }
    else {  
        turnNumber ++; // Advances the turn number while the game is not over
        return 0; // 0 = Successful move
    }
}

function checkEqual(row) { // Checks if the input array is equal at all elements
    if(row[0] == row[1] && row[1] == row[2] && row[0] != 0) return true;
    return false;
}

function win(draw) { // Makes changes to the game if a player has won
    if (!draw && currentPlayer == 1) { // Player 1 is the winner
        playerOneWins ++;
        previousLoser = 2;
    }
    else if (!draw && currentPlayer == 2) { // Player 2 is the winner
        playerTwoWins ++;
        previousLoser = 1;
    }
    else { // There was a draw
        draws ++;
        isDraw = 1; 
    }
    gameOver = 1;
}

function reset(res) { // Resets the game board but not the wins
    board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    currentPlayer = isDraw == 1 ? currentPlayer == 1 ? 2 : 1 : previousLoser; // If the games was not a draw, sets current player to the loser of the game,
                                                                              // otherwise sets the current player to the player who did not start this game
    turnNumber = 1;
    gameOver = 0;
    isDraw = 0; 

    io.emit("Reset Update", currentPlayer);
}

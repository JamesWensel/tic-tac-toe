const express = require('express');
const app = express(); 
const server = require('http').Server(app);
const bodyParser = require('body-parser');

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

app.use(express.static('.'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/display.html'); 
}); 

app.put('/move', (req, res) => {
    move(req.query.row, req.query.column, res);
});

app.put('/reset', (req, res) => {
    reset(res); 
})

server.listen(process.env.PORT || 5000);


async function move(row, column, res) { // Performs a move for the current player
    let status; 
    
    if (gameOver) {
        status = 3; // 3 = Game is already over
    }
    else if(board[row][column] != 0) // Checks if there the selected space has already been selected
    {
        status = 4; // 4 = Space already chosen 
    }
    else {
        board[row][column] = currentPlayer; // Sets the correct space to the current player
        status = await checkWin();
    }

    let wins = isDraw ? draws : currentPlayer == 1 ? playerOneWins : playerTwoWins; 
    res.send("Move: " + row + " " + column + " " + status + " " + currentPlayer + " " + wins);
    if (status < 2) currentPlayer = currentPlayer == 1 ? 2:1; // Set current player to next player
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

    res.send("Reset: " + currentPlayer);
}

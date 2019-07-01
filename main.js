let id = 0; 

socket.emit("Player Number");

// Sends a move to the server to see if it is valid and, if it is, to make that move
function move(row, column) { // Performs a move for the current player
    socket.emit("Try Move", row, column, id); // Send move made to server 
}

// Updates the client based on the move received from the server 
function moveUpdate(row, column, status, currentPlayer, wins, player) { 
    if (status < 3) { // If the move made was valid
        document.getElementById(row + '' + column).innerHTML = currentPlayer == 1 ? 'X' : 'O'; // Change the button clicked to show an X or O

        if (status > 0) gameEnd(currentPlayer, status, wins); // If a player has won or there is a draw, complete necessary actions
        else document.getElementById('turn-text').innerHTML = "Player " + currentPlayer + "'s Turn"; // Update text to reflect the next turn
    }
    else if (player == id){
        let alertText = status == "3" ? "The Game is Over" : status == 4 ? "That Space Has Been Chosen Already" : "It's Not Your Turn!"; // Set the alert text to the correct text
                                                                                            // depending on what type of invalid move was made
        window.alert(alertText); // Alert the client of the invalid move
    } 
    else if (status == "6") {
        window.alert("Player 2 Hasn't Joined the Game Yet!");
    }   
}

// Updates the client if the game has ended, either in a win or a draw 
function gameEnd(currentPlayer, status, wins) {
    let alertText; 
    if (status == 1) { // If the game was won by one of the players
        alertText = "Player " + currentPlayer + " Wins!"; // Set the alert text to show which player one
        let winLabel = currentPlayer == 1 ? "oneWins" : "twoWins"; // Set a selector so the correct label will be changed to reflect wins
        document.getElementById(winLabel).innerHTML = "Player " + currentPlayer + " wins: " + wins; // Update win label for the winner
    }
    else {
        alertText = "It's a Draw!"; // Set the alert text to show the game was a draw
        document.getElementById('draws').innerHTML = "Draws: " + wins; // Update the draws to reflect total number of draws 
    }

    window.alert(alertText); // Alert the client of the winner or of a draw 
    document.getElementById('turn-text').innerHTML = "Game Over"
    document.getElementById('resetBoard').disabled = false; // Enable the reset button so a new game can be played
}

function reset() { // Resets the game board but not the wins
    socket.emit("Reset");
}

function resetUpdate(currentPlayer) {
    for(var i=0;i<3;i++) { // Resets all the buttons to reflect a clean board
        for (var j = 0; j < 3; j++) {
            document.getElementById(i + '' + j).innerHTML = '';
        } 
    }
    document.getElementById('resetBoard').disabled = true; // Disable the reset button so a game cannot be reset until the current game finishes
    document.getElementById('turn-text').innerHTML = "Player " + currentPlayer + "'s Turn"; // Set the turn text to the next player
}

// Updates the client based on the reception of a move
socket.on("Move", function(row, column, status, currentPlayer, wins, player) {
    moveUpdate(row, column, status, currentPlayer, wins, player);
});

// Completes the game reset and updates the client
socket.on("Reset Update", function(currentPlayer) {
    resetUpdate(currentPlayer); 
});

// Joins the game and sets player ID
socket.on("Joined", function (playerNum){
    id = playerNum; // Sets player ID
    document.getElementById("pid").innerHTML = "Player ID: " + playerNum; // Sets the Player ID label 
    let statusText = playerNum == 2 ? "Player 1's Turn" : "Waiting For Second Player"; // Set's Current Status of Game
    document.getElementById("turn-text").innerHTML = statusText; // Set's Status to Status Text 
 });

 // When player 2 join the game update the game status and notify player 1
 socket.on("Player 2 Joined", function() {
    document.getElementById("turn-text").innerHTML = "Player 1's Turn"; // Set's Current Status of Game
    window.alert("Player 2 Joined"); // Notifies player 1 player 2 has joined
 });
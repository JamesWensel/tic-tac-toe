var xhttp = new XMLHttpRequest(); 

xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let response = this.responseText.split(" "); // Split incoming text to be interpret what needs to be done
        if (response[0] == "Move:") { // A move was atempted 
            moveUpdate(response[1], response[2], response[3], response[4], response[5]); // Update the status of the board
        }
        else if (response[0] == "Reset:") { // The board was reset 
            document.getElementById('turn-text').innerHTML = "Player " + response[1] + "'s Turn"; // Set the turn text to the next player
        }
    }
};

// Sends a move to the server to see if it is valid and, if it is, to make that move
function move(row, column) { // Performs a move for the current player
    xhttp.open("PUT", "/move?row=" + row + "&column=" + column, true); // Open a PUT request to the server with the move made
    xhttp.send(); // Send the PUT request 
}

// Updates the client based on the move received from the server 
function moveUpdate(row, column, status, currentPlayer, wins) { 
    if (status < 3) { // If the move made was valid
        document.getElementById(row + '' + column).innerHTML = currentPlayer == 1 ? 'X' : 'O'; // Change the button clicked to show an X or O

        if (status > 0) win(currentPlayer, status, wins); // If a player has won or there is a draw, complete necessary actions
        else document.getElementById('turn-text').innerHTML = "Player " + currentPlayer + "'s Turn"; // Update text to reflect the next turn
    }
    else {
        let alertText = status == "3" ? "The Game is Over" : "That Space Has Been Chosen Already"; // Set the alert text to the correct text
                                                                                            // depending on what type of invalid move was made
        window.alert(alertText); // Alert the client of the invalid move
    }    
}

function win(currentPlayer, status, wins) {
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
    document.getElementById('resetBoard').disabled = false; // Enable the reset button so a new game can be played
}

function reset() { // Resets the game board but not the wins
    for(var i=0;i<3;i++) { // Resets all the buttons to reflect a clean board
        for (var j = 0; j < 3; j++) {
            document.getElementById(i + '' + j).innerHTML = '';
        } 
    }
    document.getElementById('resetBoard').disabled = true; // Disable the reset button so a game cannot be reset until the current game finishes
    
    xhttp.open("PUT", "/reset", true); // Open a PUT request to the server to reset the board
    xhttp.send(); // Send the PUT request
}

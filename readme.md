# Ticcat 

## What is Ticcat?
Ticcat is a simple Game-over-HTTP server. It provides an API for letting a number of clients connect and play a game over HTTP. All API requests should respond with some JSON indicating either an error or success.

## Why?
I'm taking an AI class this semester and will need to test a number of AI clients, so I figured it'd be nice to have a simple server which would let me pit players against AIs as well as AIs against each other. I also wanted it to be easy to add new games to the server and to support games with different numbers of players.

### Included Games
At the moment, I've added the following games:

- Tic-tac-toe (2 player, 3x3 grid)

## Server Setup
To get the server running, simply clone this repo:

     git clone git@github.com:jokeofweek/ticcat.git

Then install all the dependencies:

    npm install

Finally to start the server on port 8000:

    node server.js 8000

## Listing Available Games

In order to list the available games, send a request to:

    http://<url>/games

This will list the names of all available games. These are loaded from the _games_ folder when the server is started.

### Creating a New Game Type

In order to create a new game type, you must add a new file to the _games_ folder. For the functions that your module should export, 
see games/tictactoe.js.

## Game Creation

To create a game, send a request to:

    http://<url>/create/<game-name>

In this case, __game-name__ is the name of the game you wish to start (eg. tictactoe). If the game name is valid, a response of the following format will be received:


    {
      "type": "ok",
      "value": {
        "id": "<game-id>"
      }
    }

In this case, the __game\-id__ value in the result is the ID you will use to refer to the game.

## Connecting to a Game

In order to connect to a game, send a request to:

    http://<url>/connect/<game-id>

In this case, __game\-id__ is the ID returned in game creation. A successful connection will return a message like this:

    {
      "type": "ok",
      "value": {
        "key": <turn-key>,
        "playerIndex": <player-index>
      }
    }

This response has two important parts. The first is the __key__ value. This is your "password" for the game, and you will need to send this whenever you send a move so that the server knows which player the move is for. The second is the __playerIndex__, which lets you know what your player number is (beginning at 0, so second player would have index 1).

If the game does not exist, you will receive this error:

    {
      "type": "error",
      "value": "Game does not exist."
    }

If the game is full, you will receive the following error:

    {
      "type": "error",
      "value": "No open player slots."
    }

## Checking the Status of a Game

In order to check the status of a game, send a request to:

    http://<url>/status/<game-id>/<turn-key>

If the game exists, you will receive a message in the following format:

    {
      "type": "ok",
      "value": {
        "status": <status>,
        "state": {<game-state>}
      }
    }

This gives you two important pieces of information. The first is the status of the game, which I will list in a second. The second is the game-specific state, eg. the current board in a game of tic-tac-toe.

The status can have one of the following values:

- 'setup' - The game is waiting for players to connect.
- 'playing' - The game is ongoing. An extra value will be present called 'currentPlayer' which shows the player index of the player whose turn it is.
- 'draw' - The game is over and resulted in a tie.
- 'win' - The game is over and a player won. An extra value will be present called 'winningPlayer' which shows the player index of the player who won.

### Tic-Tac-Toe Example

Suppose you send a status request and receive this response in a game of tic-tac-toe:

    {
      "type": "ok",
      "value": {
        "status": "playing",
        "state": {
          "board": "o..oxx.ox"
        },
        "currentPlayer": 0
      }
    }

This signifies that the game is ongoing and it is player 0's turn. The state for tic-tac-toe only consists of the board. In this case, the board string corresponds to this board:

    o..
    oxx
    .ox

## Making a Move

In order to make a move, you send a request as follows:

    http://<url>/move/<game-id>/<turn-key>/<move>
    
You have to pass the game-id and turn-key in order to specify what game you wish to make a move on. The last part, the __move__ argument, is a string specific to a game describing the move you would like to make. If your move was valid, you will receive an updated status of the game.

### Tic-Tac-Toe Example

For the Tic-Tac-Toe example, the  __move__ argument accepts an integer representing the position in the board string you'd like to place your move. These positions are 0-indexed, so a 3x3 game can accept values from 0 to 8 inclusively for the move field. 

Suppose you want to place your stone in the only free cell in this board:

    oxo
    .xx
    xoo

You would send the following request:

    http://<url>/move/<game-id>/<turn-key>/3

As the free cell is at index 3 in this board string:

        oxo.xxxoo

You would send the following request:

## Checking When It's Your Turn

In order to check when it's your turn, the simplest solution at the moment is to poll the status page until you see the appropriate "playing" status and the currentPlayer is set to your player index.

## Notes & Issues

- There is currently no recycling of old games, so games currently live in memory forever.
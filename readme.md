# Ticcat 

## What is Ticcat?
Ticcat is a simple Tic-Tac-Toe-over-HTTP server. It provides an API for letting two clients connect and play a game of tic-tac-toe on an arbitrary sized board all over HTTP. All API requests should respond with some JSON indicating either an error or success.

## Why?
I'm taking an AI class and wanted to test out various Tic-Tac-Toe strategies on boards which were larger than 3x3. I also wanted to be able to play against an AI as well as pit various AIs against each other.

## Server Setup
To get the server running, simply clone this repo:

     git clone git@github.com:jokeofweek/ticcat.git

Then install all the dependencies:

    npm install

Finally to start the server on port 8000:

    node server.js 8000

## Game Creation

To create a game, send a request to:

    http://<url>/create/<size>

In this case, __size__ is a required numerical parameter, indicating the size of the board (eg. 3 for 3x3, 7 for 7x7, etc.). If the URL is called correctly, a response of the following format will be received:


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

In this case, __game\-id__ is the ID returned in game creation. Note that the first player that connects will be assigned circles (first move) and the second that connects will be assigned crosses (second move). A succesfull connection will return a message like this:

    {
      "type": "ok",
      "value": {
        "key": "<turn-key>",
        "type": "<player-type>"
      }
    }

This response has two important parts. The first is the __key__ value. This is your "password" for the game, and you will need to send this whenever you send a move so that the server knows which player the move is for. The second is the __type__, which will either be 'o' or 'x' and lets you know whether you are controlling circles or crosses.

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

    http://<url>/status/<game-id>

If the game exists, you will receive a message in the following format:

    {
      "type": "ok",
      "value": {
        "board": "<board-string>",
        "status": "<status>"
      }
    }

This gives you two important pieces of information. The first is the __board-string__, which represents the current state of the board. It's format is described in the next section of this readme.

The second is the current status of the game, which can take the following values:

-  'setup' - The game is waiting for both players to connect.
- 'waiting-o' - It is 'o's turn to make a move.
- 'waiting-x' - It is 'x's turn to make a move.
- 'draw' - The game is over and resulted in a tie.
- 'win-o' - The 'o' player won.
- 'win-x' - The 'x' player won.

## The Board String
The board string represents the current state of the board. Every cell is represented by one of the following 3 characters:

- . - No one has picked this cell.
- o - The 'o' player has made a move on this cell.
- x - The 'x' player has made a move on this cell.

The board string is simply the concatenation of every row, starting from the top left and going from the left cell to the right cell. 

### Example 1

The following board:

    oxo
    ox.
    x..

Is represented as:

    oxoox.x..

### Example 2

The following board:

    ooox
    ..x.
    .x.o
    ....

Is represented as

    ooox..x..x.o....

## Making a Move

This is in the works!

## Notes & Issues

- There is currently no recycling of old games, so games currently live in memory forever.
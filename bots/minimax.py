import requests
import time

URL = "http://localhost/"

def main():
    # Instantiate the game
    r = requests.get("{0}create/3".format(URL))
    game_id = r.json()['value']['id']
    print "Game ID: " + game_id
    
    # Connect to the game
    r = requests.get("{0}connect/{1}".format(URL, game_id))
    connect_result = r.json()
    auth_id = connect_result['value']['key']
    player_type = connect_result['value']['type']
    other_player_type = 'x' if player_type == 'o' else 'o'

    print "Using {0} to play as {1}.".format(auth_id, player_type)

    # Wait till our turn
    print "Waiting for '{0}'.".format('waiting-' + player_type)
    status = wait_for(game_id, 'waiting-' + player_type)

    # Good to go!
    board = status['value']['board']
    depth = 9
    
    while depth >= 0:
        result = minimax(board, depth, True, player_type)
        print "Sending move {0} with value {1}".format(result[0], result[1])
        move_result = send_move(game_id, auth_id, board, result[0])
        status = wait_for_not(game_id, 'waiting-' + other_player_type)
        if status['value']['status'] != 'waiting-' + player_type:
            print "Final result: {0} on {1}".format(status['value']['status'], status['value']['board'] )
            return
        print "Received move..."
        board = status['value']['board']
        depth -= 2   


def wait_for(game_id, status):
    # Keep polling until the status matches.
    status_url = "{0}status/{1}".format(URL, game_id)
    while True:
        r = requests.get(status_url)
        status_response = r.json()
        if (status_response['value']['status'] == status):
            return status_response
        time.sleep(0.2)

def wait_for_not(game_id, status):
    # Keep polling until the status matches.
    status_url = "{0}status/{1}".format(URL, game_id)
    while True:
        r = requests.get(status_url)
        status_response = r.json()
        if (status_response['value']['status'] != status):
            return status_response
        time.sleep(0.2)

def send_move(game_id, auth_id, old_node, new_node):
    # Find position to place the move
    for i in xrange(0, 9):
        if (old_node[i] != new_node[i]):
            r = requests.get("{0}move/{1}/{2}/{3}".format(URL, game_id, auth_id, i))
            move_response = r.json()
            return move_response
    raise Error("Invalid move - nothing has changed.")

def winner(node):
    for i in xrange(0, 3):
        # Check col
        if (node[i] == node[i + 3] and node[i] == node[i + 6] and node[i] != '.'):
            return node[i]
        # Check row
        if (node[i * 3] == node[(i * 3) + 1] and node[(i * 3)] == node[(i * 3) + 2] and node[i * 3] != '.'):
            return node[i * 3]
    # Check diagonals
    if (node[0] == node[4] and node[0] == node[8] and node[0] != '.'):
        return node[0]
    if (node[2] == node[4] and node[2] == node[6] and node[2] != '.'):
        return node[2]
    # No winner, so return nothing
    return '.'

def isTerminal(node):
    # Check if we have no periods, in which case we can end early (draw)
    if (node.find('.') == -1): return True
    # Calculate the score, if it's a win or a lose then we are terminal
    return winner(node) != '.'

def flip_player_type(player_type):
    return 'o' if player_type == 'x' else 'x'

def heuristic(node, player_type):
    winning_type = winner(node)
    if winning_type == '.': 
        return 0
    elif winning_type == player_type: 
        return 1
    else: 
        return -1

def generate_children(node, player_type):
    children = []
    # Generate all possible moves
    for i in xrange(0,9):
        if node[i] == '.':
            new_node = list(node)
            new_node[i] = player_type
            children.append(''.join(new_node))
    return children

def minimax(node, depth, isMaximizing, player_type,):
    if depth == 0 or isTerminal(node):
        # Prioritize early wins and avoid early losses!
        return [node, heuristic(node, player_type) * depth]
    if isMaximizing:
        bestValue = -1000
        bestMove = ""
        children = generate_children(node, player_type)
        for child in children:
            val = minimax(child, depth - 1, False, player_type)[1]
            if val > bestValue: 
                bestValue = val
                bestMove = child
        return [bestMove, val]
    else:
        bestValue = 1000
        bestMove = ""
        children = generate_children(node, flip_player_type(player_type))
        for child in children:
            val = minimax(child, depth - 1, True, player_type)[1]
            if val < bestValue: 
                bestValue = val
                bestMove = child
        return [bestMove, val]

if __name__ == '__main__':
    main()
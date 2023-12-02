'''
    This module is used to calculate
    the HOF score for any player
    who has played at least 1 NHL game
'''
import concurrent.futures
import json
import math
import time
import requests


SEARCH_URL = 'https://search.d3.nhle.com/api/v1/search/player'
DATA_URL = 'https://api-web.nhle.com/v1/player/'
RESULTS_FILE = 'HOFScores.csv'
scores = []


def get_all_players():
    '''Returns all players in the NHL database
        Returns:
            players (List[dict]): A list of all players where each element is a [dict] containing the name and id
            numPlayers (int): The number of players returned (# players in NHL DB)
    '''
    params = {'limit': '25000', 'q': '*', 'culture': 'en-us'}
    response = requests.get(SEARCH_URL, params=params, timeout=20)
    players = json.loads(response.text)
    return players, len(players)


def get_awards(player):
    '''
        Returns the amount of awards won by 'player'

        Parameters:
            player (dict): the json response containing all 'player' info casted to a (dict)

        Returns:
            awards (dict): the number of each award won by the player
    '''
    awards = {
        'selke': 0,
        'hart': 0,
        'norris': 0,
        'rocket': 0,
        'artRoss': 0,
        'ladyBing': 0,
        'connSmythe': 0,
        'stanleyCup': 0,
        'tedLindsay': 0,
        'vezina': 0
    }

    if 'awards' in player:
        for award in player['awards']:
            match award['trophy']['default']:
                case "Art Ross Trophy":
                    awards['artRoss'] = len(award['seasons'])
                case "Conn Smythe Trophy":
                    awards['connSmythe'] = len(award['seasons'])
                case "Hart Memorial Trophy":
                    awards['hart'] = len(award['seasons'])
                case "Maurice “Rocket” Richard Trophy":
                    awards['rocket'] = len(award['seasons'])
                case "Stanley Cup":
                    awards['stanleyCup'] = len(award['seasons'])
                case "Frank J. Selke Trophy":
                    awards['selke'] = len(award['seasons'])
                case "Lady Byng Memorial Trophy":
                    awards['ladyBing'] = len(award['seasons'])
                case "James Norris Memorial Trophy":
                    awards['norris'] = len(award['seasons'])
                case "Ted Lindsay Award":
                    awards['tedLindsay'] = len(award['seasons'])
                case "Vezina Trophy":
                    awards['vezina'] = len(award['seasons'])
                case _:
                    continue
                    # do nothing
    return awards


def calculate_hof_scores(player):
    '''
        Returns the HOF score for 'player'

        Parameters:
            player (dict): The JSON response for 'player' casted to a dict using 'json.loads()'

        Returns:
            hof_score (int): the HOF score calculated from 'player' stats
    '''
    hof_score = 0
    if 'careerTotals' not in player:
        return hof_score
    if 'regularSeason' not in player['careerTotals']:
        return hof_score
    awards = get_awards(player)
    regular_season = player['careerTotals']['regularSeason']
    playoffs = player['careerTotals']['playoffs'] if 'playoffs' in player['careerTotals'] else {'points': 0}

    hof_score = 0
    if player['position'] == 'G':
        pass
    else:
        player_weights = {
            'ppg': {'w': 0.18, 'max': 1.921, 'prop': 'ppg'},
            'gamesPlayed': {'w': 0.07, 'max': 1779, 'prop': 'gamesPlayed'},
            'points': {'w': 0.15, 'max': 2857, 'prop': 'points'},
            'playoffPoints': {'w': 0.13, 'max': 382, 'prop': 'playoffPoints'},
            'hart': {'w': 0.25, 'max': 9, 'prop': 'hart'},
            'norris': {'w': 0.2, 'max': 7, 'prop': 'norris'},
            'connSmythe': {'w': 0.21, 'max': 3, 'prop': 'connSmythe'},
            'stanleyCups': {'w': 0.1, 'max': 11, 'prop': 'stanleyCup'},
            'gpg': {'w': 0.1, 'max': 0.76, 'prop': 'gpg'},
            'selke': {'w': 0.09, 'max': 6, 'prop': 'selke'},
            'apg': {'w': 0.1, 'max': 1.32, 'prop': 'apg'},
            'ladyBing': {'w': 0.05, 'max': 7, 'prop': 'ladyBing'},
            'goals': {'w': 0.16, 'max': 894, 'prop': 'goals'},
            'artRoss': {'w': 0.2, 'max': 10, 'prop': 'artRoss'},
            'rocket': {'w': 0.12, 'max': 8, 'prop': 'rocket'},
            'tedLindsay': {'w': 0.18, 'max': 5, 'prop': 'tedLindsay'},
            'assists': {'w': 0.1, 'max': 1963, 'prop': 'assists'}
        }
        for key, values in player_weights.items():
            try:
                w, max_val, prop = values['w'], values['max'], values['prop']
                if prop == 'ppg':
                    hof_score += w * (regular_season['points'] / regular_season['gamesPlayed']) / max_val
                elif prop == 'playoffPoints':
                    hof_score += w * (playoffs['points']) / max_val
                elif prop == 'gpg':
                    hof_score += w * (regular_season['goals'] / regular_season['gamesPlayed']) / max_val
                elif prop == 'apg':
                    hof_score += w * (regular_season['assists'] / regular_season['gamesPlayed']) / max_val
                else:
                    val = regular_season[prop] if prop in regular_season else awards.get(prop, 0)
                    hof_score += w * (val / max_val)
            except Exception as e:
                print(e)

    return hof_score


def calculate_chunk_scores(players, start, end):
    '''
        A thread function that writes the score for each player
        in players[start, end) into scores[i], where i is in [start, end).
        [start, end) is the chunkSize for which each thread is responsible for

        Parameters:
            players (List[dict]):
                A list where each element is a dict containing player info
            start (int):
                The start index for the sub array to be processed by the THREAD
            end (int):
                The end index to stop processing for each THREAD
            scores: (List):
                The global list for which each thread writes its results to
    '''

    for i in range(start, end):
        if players[i]['lastSeasonId'] is None:
            continue

        player = requests.get(DATA_URL + players[i]['playerId'] + '/landing')
        score = calculate_hof_scores(json.loads(player.text))
        if score > 0:
            scores[i] = f'{players[i]['name']},{score}\n'


def main():
    '''
    The main entry point for this module
    '''
    all_players, num_players = get_all_players()
    scores = [None] * num_players
    NUM_THREADS = 10
    chunk_size = math.ceil(num_players / NUM_THREADS)
    futures = []

    with open(RESULTS_FILE, 'w', encoding='utf-8') as file:
        file.write('Player, Score\n')

    print(f'Number of Players: {num_players}')
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        for i in range(0, num_players, chunk_size):
            end = min(i + chunk_size, num_players)
            futures.append(
                executor.submit(calculate_chunk_scores, all_players, i, end)
            )
        concurrent.futures.wait(futures)
    end_time = time.time()
    print(f'elapsed time: {end_time - start_time}')

    with open(RESULTS_FILE, 'a', encoding='utf-8') as file:
        for score in scores:
            if score is not None:
                file.write(score)


if __name__ == '__main__':
    main()

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
    params = {'limit': '25000', 'q': '*', 'culture': 'en-us'}
    response = requests.get(SEARCH_URL, params=params, timeout=20)
    players = json.loads(response.text)
    return players, len(players)


def get_awards(player):
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


def calculate_chunk_scores(players, start, end, scores):
    for i in range(start, end):
        if players[i]['lastSeasonId'] is None:
            continue

        player = requests.get(DATA_URL + players[i]['playerId'] + '/landing')
        score = calculate_hof_scores(json.loads(player.text))
        if score > 0:
            scores[i] = f'{players[i]['name']},{score}\n'


if __name__ == '__main__':
    allPlayers, numPlayers = get_all_players()
    scores = [None] * numPlayers
    NUM_THREADS = 10
    chunkSize = math.ceil(numPlayers / NUM_THREADS)
    futures = []

    with open(RESULTS_FILE, 'w', encoding='utf-8') as file:
        file.write('Player, Score\n')

    print(numPlayers)
    startTime = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        for i in range(0, numPlayers, chunkSize):
            end = min(i + chunkSize, numPlayers)
            futures.append(
                executor.submit(calculate_chunk_scores, allPlayers, i, end, scores)
            )
        concurrent.futures.wait(futures)
    endTime = time.time()
    print(f'elapsed time: {endTime - startTime}')

    with open(RESULTS_FILE, 'a', encoding='utf-8') as file:
        for score in scores:
            if score is not None:
                file.write(score)

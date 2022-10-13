
function Players(rules) {
    let scores;

    { // construct
        const data = JSON.parse(localStorage.getItem('players'));

        if (data === null) {
            scores = Array(rules.numPlayers).fill(0);
        } else {
            scores = data.scores;
        }
    }

    function saveState() {
        localStorage.setItem('players', JSON.stringify(getState()));
    }

    function getState() {
        return { scores };
    }

    function addToScore(score) {
        const playerId = rules.getCurrentPlayer();
        scores[playerId] += score;
        return scores[playerId];
    }

    function getScore() {
        const playerId = rules.getCurrentPlayer();
        return scores[playerId];
    }

    return { addToScore, getScore, saveState, getState }
}

export default Players;
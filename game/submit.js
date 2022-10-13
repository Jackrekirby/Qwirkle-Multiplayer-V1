import getRefs from "../tools/getRefs.js";
import { calcScore } from "./scorer.js";
import audio from "./audio.js";
import delay from "../tools/delay.js";

const refs = getRefs({
    undo: 'undo',
    next: 'next',
});

function getMinTile(tiles) {
    const min = { x: 999, y: 999 };
    for (const tile of tiles) {
        if (tile.x < min.x) min.x = tile.x;
        if (tile.y < min.y) min.y = tile.y;
    }
    return min;
}

function initSubmit(board, hands, renderer, players, rules, tilebag, wsw) {
    if (hands.getNumPlacedTiles() > 0) {
        refs.undo.classList.remove('disable');
        refs.next.classList.remove('disable');
    }

    async function submitScore() {
        const scoreList = calcScore(hands.getPlacedTiles(), board, true);
        console.log(scoreList);

        refs.next.classList.add('disable');
        refs.undo.classList.add('disable');

        await (async () => {
            // const tile of scoreList
            scoreList.sort((a, b) => {
                const cmp = a.length - b.length;
                if (cmp !== 0) return cmp;
                const minA = getMinTile(a);
                const minB = getMinTile(b);
                // console.log(minA, minB);
                if (minA.x === minB.x) {
                    return minA.y - minB.y;
                }
                return minA.x - minB.x;
            });
            for (const scoreTiles of scoreList) {
                if (scoreTiles.length < 6) {
                    const refTiles = scoreTiles.map(tile => {
                        const id = `live-tile-${tile.x}-${tile.y}`;
                        const ref = document.getElementById(id);
                        return ref;
                    });

                    for (const ref of refTiles) {
                        ref.classList.add('score');
                    }

                    audio.point.currentTime = 0;
                    audio.point.play();
                    players.addToScore(scoreTiles.length);
                    renderer.updateScore();
                    await delay(700);
                    for (const ref of refTiles) {
                        ref.classList.remove('score');
                    }
                    await delay(100);
                } else {
                    audio.qwirkle.play();
                    for (const tile of scoreTiles) {
                        const id = `live-tile-${tile.x}-${tile.y}`;
                        const ref = document.getElementById(id);
                        ref.classList.add('qwirkle');
                        setTimeout(() => {
                            ref.classList.remove('qwirkle');
                        }, 700);
                    }

                    players.addToScore(12);
                    renderer.updateScore();
                    await delay(1000);
                }
            }

            await delay(1000);

            hands.clearPlacedTiles();
            hands.replaceEmptySlots();
            renderer.updateLastScore(0);
            rules.nextPlayer();
            renderer.renderHandTiles();
            renderer.updatePlayer();
            renderer.updateScore();
        })();
    }

    refs.next.onclick = () => {
        if (refs.next.classList.contains('disable')) return;

        // save state
        board.saveState();
        hands.saveState();
        players.saveState();
        rules.saveState();
        tilebag.saveState();

        // get state for ws
        const gameState = {
            board: board.getState(),
            hands: hands.getState(),
            players: players.getState(),
            rules: rules.getState(),
            tilebag: tilebag.getState(),
        };

        // ws.send(JSON.stringify({ action: 'gameState', data: State }));
        wsw.ws.send(JSON.stringify({ action: 'oneMove', data: { tiles: hands.getPlacedTiles(), owner: rules.getViewingPlayer() } }));

        renderer.clearNextTiles();
        submitScore();
    }

    return submitScore;
}

export { initSubmit }
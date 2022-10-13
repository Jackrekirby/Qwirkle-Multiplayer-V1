import Tilebag from "./game/tilebag.js";
import Board from "./game/board.js";
import Renderer from "./game/renderer.js";
import Rules from "./game/rules.js";
import Hands from "./game/hands.js";
import { initUndo } from "./game/undo.js";
import { initSubmit } from "./game/submit.js";
import Players from "./game/players.js";

const url = 'wss://qwirkle-ws.herokuapp.com';
// const url = 'ws://localhost:3000/ws';

const ws = new WebSocket(url);

const numTilesets = 3;
const colorNames = ["red", "orange", "yellow", "green", "blue", "purple"];
const shapeNames = ['square', 'circle', 'diamond', 'plus', 'star', 'cross'];
const numPlayers = 2;
const numTilesInHand = 6;
const viewingPlayerId = 0;

const rules = Rules(numTilesets, colorNames, shapeNames, numPlayers, numTilesInHand, viewingPlayerId);
const tilebag = Tilebag(rules);
const hands = Hands(rules, tilebag);
const board = Board(rules);

const n = 0;
for (let j = -n; j < n; j++) {
    for (let i = -n; i < n; i++) {
        for (let k = 0; k < 10; k++) {
            if (board.addTile(i, j, Math.floor(Math.random() * 108))) break;
        }
    }
}

// board.addTile(0, 0, 0);
// board.addTile(1, 0, 1);
// board.addTile(2, 0, 2);
// board.addTile(3, 0, 3);
// board.addTile(4, 0, 4);

const players = Players(rules);

const renderer = Renderer(rules, board, hands, players);

initUndo(board, hands, renderer);
const submitScore = initSubmit(board, hands, renderer, players, rules, tilebag, ws);

renderer.render();
renderer.updatePlayer();
renderer.updateScore();

document.getElementById('next-player').onclick = () => {
    rules.nextViewingPlayer();
    renderer.updatePlayer();
    renderer.updateScore();
    renderer.render();
}

window.matchMedia('(orientation: landscape)').addEventListener('change', event => {
    renderer.render();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    renderer.render();
});

ws.addEventListener('open', (event) => {
    console.log('ws open');
});

ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    console.log('ws msg', data);
    switch (data.action) {
        case 'oneMove':
            if (data.data.owner !== rules.getViewingPlayer()) {
                // console.log('UPDATE');
                for (const tile of data.data.tiles) {
                    board.tiles.live.push({ x: tile.x, y: tile.y, id: tile.tileId });
                    // hands.recordPlacedTile(tile.x, tile.y);
                }
                // console.log('a', board.tiles.live);
                renderer.renderTiles();
                // console.log('b');
                hands.setPlacedTiles(data.data.tiles);

                (async () => {
                    await submitScore();
                    renderer.render();
                })();

                // tiles.live.push({ x, y, id });
            }
            break;
        default:
            break;
    }
};

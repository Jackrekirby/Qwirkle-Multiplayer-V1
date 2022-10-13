import Tilebag from "./game/tilebag.js";
import Board from "./game/board.js";
import Renderer from "./game/renderer.js";
import Rules from "./game/rules.js";
import Hands from "./game/hands.js";
import { initUndo } from "./game/undo.js";
import { initSubmit } from "./game/submit.js";
import Players from "./game/players.js";
import shapesIcons from "./game/shapeIcons.js";
import { IsThemeLight } from "./tools/matchMedia.js";
import getRefs from "./tools/getRefs.js";

{
    const version = 'v2';
    const ref = document.getElementById('version');
    if (version != ref.innerText) {
        ref.innerText = version + '*';
    }
}

const numTilesets = 3;
const colorNames = ["red", "orange", "yellow", "green", "blue", "purple"];
const shapeNames = ['square', 'circle', 'diamond', 'plus', 'star', 'cross'];
const numPlayers = 2;
const numTilesInHand = 6;
const viewingPlayerId = 0;

// newGame();
// localStorage.clear();

const wsw = {
    ws: undefined, onopen: () => { }, onclose: () => { },
    onerror: () => { }, onmessage: () => { }, init: () => { },
    ref: document.getElementById('ws-status')
}; // web socket wrapper

const url = 'wss://qwirkle-ws.herokuapp.com';
// const url = 'ws://localhost:3000/ws';

wsw.onopen = () => {
    console.log('ws open');
    wsw.ref.classList.add('open');

    // setTimeout(() => {
    //     wsw.ws.close();
    // }, 1000);
};

wsw.onclose = () => {
    console.log('ws closed');
    wsw.ref.classList.remove('open');
    wsw.init();
};

wsw.onerror = () => {
    console.log('ws error');
    wsw.ref.classList.remove('open');
    wsw.init();
};

wsw.init = () => {
    wsw.ws = new WebSocket(url);
    wsw.ws.onopen = wsw.onopen;
    wsw.ws.onclose = wsw.onclose;
    wsw.ws.onerror = wsw.onerror;
    wsw.ws.onmessage = wsw.onmessage;
}


homeScreen();
function homeScreen() {
    const refs = getRefs({ home: 'home-screen', game: 'game-screen', tiles: 'home-tiles', continue: 'btn-continue', new: 'btn-new' });

    refs.continue.onclick = () => {
        refs.home.classList.add('display-none');
        refs.game.classList.remove('display-none');
        newGame();
    }

    refs.new.onclick = () => {
        refs.home.classList.add('display-none');
        refs.game.classList.remove('display-none');
        localStorage.clear();
        newGame();
    }

    function setStyles(ref, attrs) {
        for (const key in attrs) {
            ref.style[key] = attrs[key];
        }
    }

    function fhsla(h, s, l, a) {
        return `hsla(${h},${s}%,${l}%, ${a})`;
    }

    function getColor(colorId) {
        const hues = [0, 30, 50, 120, 200, 270];
        // const hues = Array(6).fill(0).map((_, i) => 360 / 6 * i);
        const color = [
            hues[colorId],
            100,
            50
        ];
        return color;
    }

    const rand6 = () => Math.floor(Math.random() * 6);

    for (let i = 0; i < 4; i++) {
        const colorId = rand6(), shapeId = rand6();
        const color = getColor(colorId);

        {
            const ref = document.createElement('div');
            ref.classList.add('tile');

            setStyles(ref, {
                color: fhsla(...color, 1.0),
                borderColor: fhsla(...color, 0.1),
                backgroundColor: fhsla(color[0], 100, IsThemeLight() ? 95 : 10, 1.0),
            });

            ref.appendChild(shapesIcons[shapeId](fhsla(...color, 1.0)));

            refs.tiles.appendChild(ref);
        }
    }

}

function newGame() {
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
    const submitScore = initSubmit(board, hands, renderer, players, rules, tilebag, wsw);

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

    wsw.onmessage = (msg) => {
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

    wsw.init();
}



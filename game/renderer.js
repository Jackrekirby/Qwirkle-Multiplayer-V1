import clamp from "../tools/clamp.js";
import shapesIcons from "./shapeIcons.js";
import { IsThemeLight, IsPortrait } from "../tools/matchMedia.js";
import getRefs from "../tools/getRefs.js";
import audio from "./audio.js";
import { calcScore } from "./scorer.js";

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

function Renderer(rules, board, hands, players) {
    let tileSize = 0;
    let borderSize = 0;
    let boardOffset = { x: 0, y: 0 };
    let boardSize = { x: 0, y: 0 };
    let tileStyleProps = () => { };
    let renderIndex = 0;

    const refs = getRefs({
        boardWrapper: 'board-wrapper',
        board: 'board',
        hand: 'hand',
        undo: 'undo',
        next: 'next',
        lastScore: 'last-score',
        score: 'score',
        player: 'player',
    });

    function tagRecent(ref) {
        if (renderIndex % 2) {
            ref.classList.add('recent-1');
            ref.classList.remove('recent-2');
        } else {
            ref.classList.add('recent-2');
            ref.classList.remove('recent-1');
        }
    }

    function updateScore() {
        refs.score.innerText = players.getScore();
    }

    function updateLastScore(score) {
        if (score == 0) {
            refs.lastScore.innerText = '';
        } else {
            refs.lastScore.innerText = '+' + score;
        }
    }

    function updatePlayer() {
        const currentPlayerId = rules.getCurrentPlayer();
        const viewingPlayerId = rules.getViewingPlayer();
        if (currentPlayerId === viewingPlayerId) {
            refs.player.innerText = 'You';
        } else {
            refs.player.innerText = `P${currentPlayerId}(${viewingPlayerId})`;
        }
    }

    function renderNextTile(x, y) {
        const id = `next-tile-${x}-${y}`;
        const ref = document.getElementById(id);
        if (ref === null) {
            const ref = document.createElement('div');
            ref.id = id;
            ref.classList.add('tile', 'next');
            tagRecent(ref);
            setStyles(ref, {
                ...tileStyleProps(x, y)
            });

            let timeout;
            ref.onclick = () => {
                const handTileId = hands.getSelectedTile();
                const refHandTile = document.getElementById('hand-tile-' + hands.getSelectedIndex());

                if (handTileId !== undefined) {
                    if (board.addTile(x, y, handTileId)) {
                        audio.place.play();
                        refs.undo.classList.remove('disable');
                        refs.next.classList.remove('disable');
                        hands.recordPlacedTile(x, y);
                        hands.removeSelectedTile();
                        refHandTile.classList.remove('selected');
                        render();
                    } else {
                        audio.invalid.play();
                        clearTimeout(timeout);
                        refHandTile.classList.add('invalid');
                        timeout = setTimeout(() => {
                            refHandTile.classList.remove('invalid');
                        }, 500);
                    }
                }
            }
            refs.board.appendChild(ref);
        } else {
            tagRecent(ref);
            setStyles(ref, {
                ...tileStyleProps(x, y)
            });
        }
    }

    function renderTile(x, y, tileId) {
        const id = `live-tile-${x}-${y}`;

        const ref = document.getElementById(id);

        const { shapeId, colorId } = rules.readTileAsIds(tileId);
        // console.log({ tileId, shapeId, colorId });
        const color = getColor(colorId);

        if (ref === null) {
            const ref = document.createElement('div');
            ref.id = id;
            ref.classList.add('tile');
            tagRecent(ref);


            setStyles(ref, {
                color: fhsla(...color, 1.0),
                borderColor: fhsla(...color, 0.1),
                backgroundColor: fhsla(color[0], 100, IsThemeLight() ? 95 : 10, 1.0),
                ...tileStyleProps(x, y)
            });

            ref.appendChild(shapesIcons[shapeId](fhsla(...color, 1.0)));
            refs.board.appendChild(ref);
        } else {
            tagRecent(ref);
            setStyles(ref, {
                backgroundColor: fhsla(color[0], 100, IsThemeLight() ? 95 : 10, 1.0),
                ...tileStyleProps(x, y)
            });
        }
    }

    function resize() {
        let x0 = 0, x1 = 0, y0 = 0, y1 = 0;
        const isPortrait = IsPortrait();

        for (const tile of board.tiles.live) {
            if (tile.x < x0) x0 = tile.x;
            if (tile.x > x1) x1 = tile.x;
            if (tile.y < y0) y0 = tile.y;
            if (tile.y > y1) y1 = tile.y;
        }

        boardSize = {
            x: (x1 - x0) + 3,
            y: (y1 - y0) + 3
        };

        boardOffset = {
            x: x0 + (x1 - x0) / 2,
            y: y0 + (y1 - y0) / 2,
        };

        tileSize = Math.max(Math.min(refs.boardWrapper.offsetWidth / boardSize.x, refs.boardWrapper.offsetHeight / boardSize.y) - 10, 40);

        borderSize = clamp(tileSize * 0.1, 2, 10);

        const refScoreArea = document.getElementById('score-area');
        const refBtnArea = document.getElementById('btn-area');

        const targetHeight = window.innerHeight - refScoreArea.offsetHeight - refBtnArea.offsetHeight - tileSize * 1.5;
        const targetWidth = window.innerWidth - refBtnArea.offsetWidth - tileSize * 1.5;

        setStyles(refs.board, {
            width: Math.max(isPortrait ? refs.boardWrapper.offsetWidth : targetWidth, boardSize.x * tileSize + borderSize),
            height: Math.max(isPortrait ? targetHeight : refs.boardWrapper.offsetHeight, boardSize.y * tileSize + borderSize),
        });

        tileStyleProps = (x, y) => ({
            width: `${tileSize - borderSize}px`,
            height: `${tileSize - borderSize}px`,
            fontSize: `${tileSize - borderSize}px`,
            top: `${(y - boardOffset.y - 0.5) * tileSize + (refs.board.offsetHeight + borderSize) / 2}px`,
            left: `${(x - boardOffset.x - 0.5) * tileSize + (refs.board.offsetWidth + borderSize) / 2}px`,
        });
    }

    function renderHandTile(tile, i, tileSize) {
        const makeId = i => `hand-tile-${i}`;
        const id = makeId(i);

        const innerSize = tileSize - borderSize;

        const top = `${-0.5 * innerSize + refs.hand.offsetHeight / 2}px`;
        const left = `${(i - 3) * tileSize + refs.hand.offsetWidth / 2}px`;

        const isPortrait = IsPortrait();
        const styleProps = {
            width: `${tileSize - borderSize}px`,
            height: `${tileSize - borderSize}px`,
            // top: isPortrait ? top : left,
            // left: isPortrait ? left : top,
        }

        const ref = document.getElementById(id);

        function create(ref) {
            const { shapeId, colorId } = rules.readTileAsIds(tile.tileId);

            const color = getColor(colorId);

            setStyles(ref, {
                color: fhsla(...color, 1.0),
                borderColor: fhsla(...color, 0.1),
                backgroundColor: fhsla(color[0], 100, IsThemeLight() ? 95 : 10, 1.0),
                visibility: tile.inHand ? 'visible' : 'hidden',
                ...styleProps
            });

            ref.onclick = ((newHandIndex) => function () {
                const handIndex = hands.getSelectedIndex();
                if (handIndex !== undefined) {
                    const tileId = hands.getSelectedTile();
                    const { colorId } = rules.readTileAsIds(tileId);
                    const color = getColor(colorId);

                    const oldRef = document.getElementById(makeId(handIndex));
                    oldRef.classList.remove('selected');
                    oldRef.firstChild.style.fill = fhsla(...color, 0.6);
                    oldRef.style.borderColor = fhsla(...color, 0.1);
                }

                audio.select.currentTime = 0;
                audio.select.play();

                const newRef = document.getElementById(makeId(newHandIndex));
                newRef.classList.add('selected');
                newRef.style.borderColor = fhsla(...color, 1.0);
                newRef.firstChild.style.fill = fhsla(...color, 1.0);

                hands.setSelectedIndex(newHandIndex);
            })(i);

            ref.appendChild(shapesIcons[shapeId](fhsla(...color, 0.6)));
        }

        if (ref === null) {
            const ref = document.createElement('div');
            ref.id = id;
            ref.classList.add('tile');
            create(ref);
            refs.hand.appendChild(ref);
        } else {
            ref.innerHTML = '';
            create(ref);
        }
    }

    function renderHandTiles() {
        const isPortrait = IsPortrait();
        const targetTileSize = tileSize * 1.5;

        const handLength = `${targetTileSize}px`;
        if (isPortrait) {
            setStyles(refs.hand, {
                minHeight: handLength,
                maxHeight: handLength,
                minWidth: '',
                maxWidth: '',
            });
        } else {
            setStyles(refs.hand, {
                minWidth: handLength,
                maxWidth: handLength,
                minHeight: '',
                maxHeight: '',
            });
        }

        const handTileSize = Math.min(targetTileSize, (isPortrait ? refs.hand.offsetWidth : refs.hand.offsetHeight) / (rules.numTilesInHand + 1));

        let i = 0;
        for (const tile of hands.getHand()) {
            renderHandTile(tile, i, handTileSize);
            i++;
        }
    }

    function renderTiles() {
        for (const tile of board.tiles.live) {
            renderTile(tile.x, tile.y, tile.id);
        }
    }

    function renderNextTiles() {
        for (const tile of board.tiles.next) {
            renderNextTile(tile.x, tile.y, tile.id);
        }
    }

    function clearNextTiles() {
        const nextRefs = refs.board.getElementsByClassName('next');
        while (nextRefs.length > 0) {
            refs.board.removeChild(nextRefs[0]);
        }
    }

    function render() {
        resize();
        renderHandTiles();
        renderTiles();
        if (rules.getCurrentPlayer() == rules.getViewingPlayer()) {
            board.generateNextTiles();
            renderNextTiles();
        }

        const score = calcScore(hands.getPlacedTiles(), board, false);
        updateLastScore(score);

        const recentTag = renderIndex % 2 ? 'recent-2' : 'recent-1';
        const oldRefs = refs.board.getElementsByClassName(recentTag);

        while (oldRefs.length > 0) {
            refs.board.removeChild(oldRefs[0]);
        }

        renderIndex++;
    }

    return { resize, render, renderTiles, renderNextTiles, renderHandTiles, updateLastScore, updatePlayer, updateScore, clearNextTiles }
}

export default Renderer;
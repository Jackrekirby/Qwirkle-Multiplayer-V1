import shuffleArray from "../tools/shuffleArray.js"
import range from "../tools/range.js"

function Tilebag(rules) {
    let tiles, record, tileIndex;

    { // construct
        const data = JSON.parse(localStorage.getItem('tilebag'));
        if (data === null) {
            tiles = (range(rules.numTotaltiles));
            record = Array(rules.numPlayers).fill(0).map(_ => []);
            tileIndex = 0;
        } else {
            tiles = data.tiles;
            record = data.record;
            tileIndex = data.tileIndex;
        }
    }

    function saveState() {
        localStorage.setItem('tilebag', JSON.stringify(getState()));
    }

    function getState() {
        return { tiles, record, tileIndex };
    }

    function pick(playerId) {
        const tileId = tiles[tileIndex];
        record[playerId].push(tileId);
        tileIndex++;
        return tileId;
    }

    // console.log(tiles);

    return { pick, record, saveState, getState };
}

export default Tilebag;
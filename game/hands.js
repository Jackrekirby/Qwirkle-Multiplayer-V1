import range from "../tools/range.js"

function Hands(rules, tilebag) {
    let tiles, selectedIndices, placedTiles;

    { // construct
        const data = JSON.parse(localStorage.getItem('hands'));
        if (data === null) {
            tiles = range(rules.numPlayers).map(playerId => range(rules.numTilesInHand).map(_ => ({ tileId: tilebag.pick(playerId), inHand: true })));
            selectedIndices = Array(rules.numPlayers).fill(undefined);
            placedTiles = Array(rules.numPlayers).fill(0).map(_ => []);
        } else {
            tiles = data.tiles;
            selectedIndices = data.selectedIndices.map(v => v === null ? undefined : v);
            placedTiles = data.placedTiles;
        }
    }

    function saveState() {
        localStorage.setItem('hands', JSON.stringify(getState()));
    }

    function getState() {
        return { tiles, selectedIndices, placedTiles };
    }

    function getSelectedIndex() {
        return selectedIndices[rules.getCurrentPlayer()];
    }

    function replaceEmptySlots() {
        const playerId = rules.getCurrentPlayer();
        for (const tile of tiles[playerId]) {
            if (!tile.inHand) {
                tile.tileId = tilebag.pick(playerId);
                tile.inHand = true;
            }
        }
    }

    function setPlacedTiles(tiles) {
        const playerId = rules.getCurrentPlayer();
        placedTiles[playerId] = tiles;
    }

    function clearPlacedTiles() {
        const playerId = rules.getCurrentPlayer();
        placedTiles[playerId] = [];
    }

    function recordPlacedTile(x, y) {
        const playerId = rules.getCurrentPlayer();
        const selectedIndex = getSelectedIndex();
        const tileId = tiles[playerId][selectedIndex].tileId;
        placedTiles[playerId].push({ x, y, tileId, selectedIndex });
    }

    function getNumPlacedTiles() {
        const playerId = rules.getCurrentPlayer();
        return placedTiles[playerId].length;
    }

    function getPlacedTiles() {
        const playerId = rules.getCurrentPlayer();
        return placedTiles[playerId];
    }

    function getLastPlacedTile() {
        const playerId = rules.getCurrentPlayer();
        const ptiles = placedTiles[playerId];
        const tile = ptiles.at(-1);

        const item = tiles[playerId][tile.selectedIndex];

        // selectedIndices[playerId] = tile.selectedIndex;
        item.inHand = true;

        ptiles.pop();
        return tile;
    }

    function setSelectedIndex(index) {
        selectedIndices[rules.getCurrentPlayer()] = index;
    }

    function getSelectedTile() {
        const playerId = rules.getCurrentPlayer();
        const selectedIndex = selectedIndices[playerId];
        if (selectedIndex === undefined) return undefined;
        console.log(tiles, playerId, selectedIndex, selectedIndices);
        const item = tiles[playerId][selectedIndex];
        return item.tileId;
    }

    function removeSelectedTile() {
        const playerId = rules.getCurrentPlayer();
        const selectedIndex = selectedIndices[playerId];
        if (selectedIndex === undefined) return;
        const item = tiles[playerId][selectedIndex];
        selectedIndices[playerId] = undefined;
        item.inHand = false;
    }

    function getHand() {
        return tiles[rules.getViewingPlayer()];
    }

    return {
        tiles, getHand, getSelectedIndex,
        setSelectedIndex, getSelectedTile, removeSelectedTile,
        recordPlacedTile, getLastPlacedTile, getNumPlacedTiles,
        getPlacedTiles, clearPlacedTiles, replaceEmptySlots, saveState,
        getState, setPlacedTiles
    };
}

export default Hands;
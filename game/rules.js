function Rules(numTilesets, colorNames, shapeNames, numPlayers, numTilesInHand, _viewingPlayerId) {
    // const numColors = colorNames.length;
    // const numShapes = shapeNames.length;
    // const numUniqueTiles = numColors * numShapes;
    // const numTotaltiles = numTilesets * numUniqueTiles;
    // let currentPlayerId = _currentPlayerId;
    // let viewingPlayerId = _viewingPlayerId;

    let numColors, numShapes, numUniqueTiles, numTotaltiles, currentPlayerId, viewingPlayerId;

    { // construct
        const data = JSON.parse(localStorage.getItem('rules'));

        if (data !== null) {
            numTilesets = data.numTilesets;
            colorNames = data.colorNames;
            shapeNames = data.shapeNames;
            numPlayers = data.numPlayers;
            numTilesInHand = data.numTilesInHand;
            currentPlayerId = data.currentPlayerId;
            viewingPlayerId = data.viewingPlayerId;
        } else {
            currentPlayerId = 0;
            viewingPlayerId = _viewingPlayerId;
        }

        numColors = colorNames.length;
        numShapes = shapeNames.length;
        numUniqueTiles = numColors * numShapes;
        numTotaltiles = numTilesets * numUniqueTiles;
    }


    function saveState() {
        localStorage.setItem('rules', JSON.stringify(getState()));
    }

    function getState() {
        return { numTilesets, colorNames, shapeNames, numPlayers, numTilesInHand, currentPlayerId, viewingPlayerId };
    }

    function readTileAsIds(tileId) {
        const setId = Math.floor(tileId / numUniqueTiles);
        const temp = tileId % numUniqueTiles;

        const shapeId = Math.floor(temp / numShapes);
        const colorId = temp % numColors;

        return { setId, shapeId, colorId };
    }

    function readTileAsNames(tileId) {
        const { shape, color } = read(tileId);
        return {
            shape: shapeNames[shape],
            color: shapeNames[color]
        }
    }

    function nextViewingPlayer() {
        viewingPlayerId = (viewingPlayerId + 1) % numPlayers;
    }

    function nextPlayer() {
        currentPlayerId = (currentPlayerId + 1) % numPlayers;
    }

    function getCurrentPlayer() {
        return currentPlayerId;
    }

    function getViewingPlayer() {
        return viewingPlayerId;
    }

    return { readTileAsIds, readTileAsNames, getCurrentPlayer, numColors, numShapes, numUniqueTiles, numTotaltiles, numPlayers, numTilesInHand, getViewingPlayer, nextPlayer, nextViewingPlayer, saveState, getState };
}

export default Rules;
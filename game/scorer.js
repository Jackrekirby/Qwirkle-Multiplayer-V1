
function calcPoints(range) {
    const points = range.max + range.min
    if (points === 0) {
        return 0;
    } else if (points < 5) {
        return points + 1;
    } else {
        return 12;
    }
}

function listScore(range, tile, scoreList, inX) {
    if (inX) {
        scoreTileX(range, tile, scoreList);
    } else {
        scoreTileY(range, tile, scoreList);
    }
}

function scoreTileX(range, tile, scoreList) {
    if (!(range.min === 0 && range.max === 0)) {
        const scoreTiles = [];
        for (let x = tile.x - range.min; x <= tile.x + range.max; ++x) {
            scoreTiles.push({ x, y: tile.y });
        }
        scoreList.push(scoreTiles);
    }
}

function scoreTileY(range, tile, scoreList) {
    if (!(range.min === 0 && range.max === 0)) {
        const scoreTiles = [];
        for (let y = tile.y - range.min; y <= tile.y + range.max; ++y) {
            scoreTiles.push({ x: tile.x, y });
        }
        scoreList.push(scoreTiles);
    }
}

function calcScore(placedTiles, board, wantList) {
    if (placedTiles.length === 0) return (wantList ? [] : 0);

    const scoreList = [];
    let score = 0;

    const firstTile = placedTiles[0];
    const dx = board.findFirstEmptyTile(firstTile.x, firstTile.y, true);
    const dy = board.findFirstEmptyTile(firstTile.x, firstTile.y, false);

    if (placedTiles.length > 1) {
        const inX = placedTiles[0].x === placedTiles[1].x;
        for (const tile of placedTiles.slice(1)) {
            const range = board.findFirstEmptyTile(tile.x, tile.y, inX);
            if (wantList) {
                listScore(range, tile, scoreList, inX);
            } else {
                score += calcPoints(range);
            }
        }
    }

    if (wantList) {
        scoreTileX(dx, firstTile, scoreList);
        scoreTileY(dy, firstTile, scoreList);
        if (scoreList.length === 0) scoreList.push([{ x: firstTile.x, y: firstTile.y }]);
    } else {
        score += calcPoints(dx) + calcPoints(dy);
        if (score === 0) score = 1;
    }

    return (wantList ? scoreList : score);
}

export { calcScore }
function Board(rules) {
    let tiles;

    { // construct
        const data = JSON.parse(localStorage.getItem('board'));
        if (data === null) {
            tiles = {
                live: [],
                next: [{ x: 0, y: 0 }],
            }
        } else {
            tiles = data.tiles;
        }
    }

    function saveState() {
        localStorage.setItem('board', JSON.stringify(getState()));
    }

    function getState() {
        return { tiles: tiles };
    }

    function indexTile(tileset, x, y) {
        const index = tileset.findIndex(tile => tile.x === x && tile.y === y);
        return index;
    }

    function indexNextTile(x, y) {
        return indexTile(tiles.next, x, y);
    }

    function indexLiveTile(x, y) {
        return indexTile(tiles.live, x, y);
    }

    function liveTileExists(x, y) {
        return indexLiveTile(x, y) !== -1;
    }

    function generateNextTiles() {
        tiles.next = [];

        for (const tile of tiles.live) {
            const { x, y } = tile;
            addNextTile(x + 1, y);
            addNextTile(x - 1, y);
            addNextTile(x, y + 1);
            addNextTile(x, y - 1);
        }

        if (tiles.live.length === 0) {
            addNextTile(0, 0);
        }
    }

    function nextTileExists(x, y) {
        return indexNextTile(x, y) !== -1;
    }

    function addNextTile(x, y) {
        if (!liveTileExists(x, y) && !nextTileExists(x, y)) {
            tiles.next.push({ x: x, y: y });
        } else {
            // console.warn(`Location (${x}, ${y}) is not available for next tile.`);
        }
    }

    function getTile(x, y) {
        // console.log('-', x, y);
        const index = indexLiveTile(x, y);
        if (index !== -1) {
            return tiles.live[index];
        } else {
            return console.error(`Attempted to get live tile which does not exist at (${x}, ${y}).`);
        }
    }

    function findFirstEmptyTile(x, y, inX) {
        const range = { min: 0, max: 0 };
        if (inX) {
            let dx = 1;
            while (liveTileExists(x - dx, y)) {
                dx++;
            }
            range.min = dx - 1;

            dx = 1;
            while (liveTileExists(x + dx, y)) {
                dx++;
            }
            range.max = dx - 1;
            // console.log('x', range);
        } else {

            let dy = 1;
            while (liveTileExists(x, y - dy)) {
                dy++;
            }
            range.min = dy - 1;

            dy = 1;
            while (liveTileExists(x, y + dy)) {
                dy++;
            }
            range.max = dy - 1;
            // console.log('y', range);
        }
        return range;
    }

    function isGroupValid(x, y, range, shape, color, getTileFnc) {
        if (range.min === 0 && range.max === 0) return true;
        const colors = new Set();
        const shapes = new Set();
        colors.add(color);
        shapes.add(shape);

        let areDuplicateColors = false;
        let areDuplicateShapes = false;
        // console.log('a', x, y, range);
        for (let i = x - range.min; i <= x + range.max; i++) {
            // console.log('i', i);
            if (i === x) continue;
            const tile = rules.readTileAsIds(getTileFnc(i, y).id);
            if (colors.has(tile.colorId)) {
                areDuplicateColors = true;
            }
            if (shapes.has(tile.shapeId)) {
                areDuplicateShapes = true;
            }
            colors.add(tile.colorId);
            shapes.add(tile.shapeId);
        }

        const areColorsUnique = colors.size === 1;
        const areShapesUnique = shapes.size === 1;

        const isValid = (areColorsUnique && !areShapesUnique && !areDuplicateShapes) ||
            (!areColorsUnique && areShapesUnique && !areDuplicateColors);

        // console.log({
        //     xmin: x - range.min,
        //     xmax: x + range.max,
        //     y, areColorsUnique, areShapesUnique, isValid, colors, shapes
        // });

        return isValid;
    }

    function addTile(x, y, id) {
        // assume next tile must have been there in order for user to add live tile
        const { shapeId, colorId } = rules.readTileAsIds(id);

        const dx = findFirstEmptyTile(x, y, true);
        const dy = findFirstEmptyTile(x, y, false);

        const isValid = isGroupValid(x, y, dx, shapeId, colorId,
            (i, y) => getTile(i, y)) &&
            isGroupValid(y, x, dy, shapeId, colorId,
                (i, x) => getTile(x, i));

        // console.log({ isValid, shapeId, colorId, dx, dy });

        if (isValid) {
            tiles.live.push({ x, y, id });
            return true;
        }
        return false;
    }

    function popTile() {
        tiles.live.pop();
    }

    return { tiles, addTile, generateNextTiles, popTile, findFirstEmptyTile, saveState, getState }
}

export default Board;
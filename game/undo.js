import audio from "./audio.js";
import getRefs from "../tools/getRefs.js";

const refs = getRefs({
    undo: 'undo',
    next: 'next',
});

function initUndo(board, hands, renderer) {
    refs.undo.onclick = () => {
        if (refs.undo.classList.contains('disable')) return;
        audio.undo.currentTime = 0;
        audio.undo.play();

        const tile = hands.getLastPlacedTile();
        // console.log(tile);

        const refHandTile = document.getElementById('hand-tile-' + tile.selectedIndex);
        refHandTile.classList.remove('selected');

        if (hands.getNumPlacedTiles() === 0) {
            refs.undo.classList.add('disable');
            refs.next.classList.add('disable');
        }

        board.popTile();

        renderer.render();
    }
}

export { initUndo };


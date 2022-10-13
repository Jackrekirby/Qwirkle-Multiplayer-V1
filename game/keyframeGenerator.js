function qwirkle() {
    const steps = 11;
    const numRots = 3;
    const maxScale = 1.5;

    let str = "@keyframes qwirkle {\n";

    for (let i = 0; i < steps; i++) {
        const j = i / (steps - 1);
        const rot = Math.round(j * 360 * numRots);
        const scale = Math.round((maxScale - Math.abs(j - 0.5)) * 100);
        str += '\t' + j * 100 + '% {\n';
        str += `\t\ttransform: rotate(${rot}deg) scale(${scale}%);\n`
        str += '\t}\n';
    }
    str += '}\n';
    console.log(str);
}
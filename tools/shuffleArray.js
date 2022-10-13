function shuffleArray(x) {
    for (let i = x.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = x[i];
        x[i] = x[j];
        x[j] = temp;
    }
    return x;
}

export default shuffleArray;
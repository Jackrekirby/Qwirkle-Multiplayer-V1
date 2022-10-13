function getRefs(ids) {
    const refs = {};
    for (const [name, id] of Object.entries(ids)) {
        refs[name] = document.getElementById(id);
    }
    return refs;
}

export default getRefs;
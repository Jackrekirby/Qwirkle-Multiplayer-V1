
function IsThemeLight() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
}

function IsPortrait() {
    return !(window.matchMedia && window.matchMedia('only screen and (max-height: 900px) and (orientation: landscape)').matches);
}

export { IsThemeLight, IsPortrait }
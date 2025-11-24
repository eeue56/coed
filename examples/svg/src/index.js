import * as coed from "@eeue56/coed";
import * as svg from "@eeue56/coed/svg";
function update(msg, model) {
    return model;
}
const manuallyConstructedIcon = coed.nodeNS("svg", "http://www.w3.org/2000/svg", [], [
    coed.attribute("width", "40"),
    coed.attribute("height", "40"),
    coed.attribute("viewBox", "0 0 40 40"),
    coed.attribute("role", "img"),
], [
    coed.voidNodeNS("circle", "http://www.w3.org/2000/svg", [], [
        coed.attribute("cx", "20"),
        coed.attribute("cy", "20"),
        coed.attribute("r", "14"),
        coed.attribute("fill", "none"),
        coed.attribute("stroke", "#8A8F98"),
        coed.attribute("stroke", "pink"),
        coed.attribute("stroke-width", "2"),
    ]),
    coed.voidNodeNS("circle", "http://www.w3.org/2000/svg", [], [
        coed.attribute("cx", "20"),
        coed.attribute("cy", "20"),
        coed.attribute("r", "6"),
        coed.attribute("fill", "#B7FFBF"),
    ]),
]);
const icon = svg.svg([], [
    coed.attribute("width", "40"),
    coed.attribute("height", "40"),
    coed.attribute("viewBox", "0 0 40 40"),
    coed.attribute("role", "img"),
], [
    svg.circle([], [
        coed.attribute("cx", "20"),
        coed.attribute("cy", "20"),
        coed.attribute("r", "14"),
        coed.attribute("fill", "none"),
        coed.attribute("stroke", "#8A8F98"),
        coed.attribute("stroke", "pink"),
        coed.attribute("stroke-width", "2"),
    ]),
    svg.circle([], [
        coed.attribute("cx", "20"),
        coed.attribute("cy", "20"),
        coed.attribute("r", "6"),
        coed.attribute("fill", "#B7FFBF"),
    ]),
]);
const iconFromString = coed.fromString(`
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    role="img"
>
    <circle
    xmlns="http://www.w3.org/2000/svg"
    cx="20"
    cy="20"
    r="14"
    fill="none"
    stroke="#8A8F98"
    stroke-width="2"
    ></circle>
    <circle
    xmlns="http://www.w3.org/2000/svg" cx="20" cy="20" r="6" fill="#B7FFBF"></circle>
</svg>
`);
function view(model) {
    return coed.div([], [], [manuallyConstructedIcon, icon, iconFromString]);
}
function main() {
    const root = document.getElementById("root");
    if (root === null)
        return;
    const program = coed.program({
        root: root,
        initialModel: {},
        view: view,
        update: update,
    });
}
main();

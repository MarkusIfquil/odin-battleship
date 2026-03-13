export function targetRandomSquare(boundX, boundY) {
    let x = Math.floor(Math.random() * boundX);
    let y = Math.floor(Math.random() * boundY);
    return [x, y];
}

export function getRandomAxis() {
    let r = Math.floor(Math.random() * 4);
    const directions = {
        0: "north",
        1: "east",
        2: "south",
        3: "west",
    };
    return directions[r];
}

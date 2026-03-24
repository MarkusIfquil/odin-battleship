import { isClickedAlready } from ".";

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

function isWithinBounds(x, y) {
    return !(x < 0 || x > 10 || y < 0 || y > 10);
}

function isClickable(player, x, y) {
    return !isClickedAlready(player, x, y) && isWithinBounds(x, y);
}

export function targetSmartSquare(lastSquare, lastLastSquare, otherPlayer) {
    let [x, y] = lastSquare;
    console.log("targeting smart", x, y, otherPlayer.name);
    if (lastLastSquare) {
        let [lX, lY] = lastLastSquare;
        let tX = (x - lX) * -1;
        let tY = (y - lY) * -1;
        if (
            Math.abs(tX) == 1 &&
            tY == 0 &&
            isClickable(otherPlayer, x + tX, y)
        ) {
            return [x + tX, y];
        } else if (
            Math.abs(tY) == 1 &&
            tX == 0 &&
            isClickable(otherPlayer, x, y + tY)
        ) {
            return [x, y + tY];
        }
    }
    if (isClickable(otherPlayer, x - 1, y)) {
        return [x - 1, y];
    } else if (isClickable(otherPlayer, x, y - 1)) {
        return [x, y - 1];
    } else if (isClickable(otherPlayer, x + 1, y)) {
        return [x + 1, y];
    } else if (isClickable(otherPlayer, x, y + 1)) {
        return [x, y + 1];
    } else {
        console.log("couldnt find");
        return targetRandomSquare(10, 10);
    }
}

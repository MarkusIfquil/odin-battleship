export class Ship {
    constructor(length) {
        this.length = length;
        this.hitCount = 0;
        this.sunk = false;
    }
    hit() {
        this.hitCount++;
    }
    isSunk() {
        if (this.length == this.hitCount) {
            this.sunk = true;
            return true;
        }
        return false;
    }
}

export function hashCoord(coordinate) {
    const [x, y] = coordinate;
    return x * 10 + y;
}

function transformCoordinates(originalCoord, transform) {
    const [x, y] = originalCoord;
    const [tX, tY] = transform;
    return [x + tX, y + tY];
}

const directions = {
    north: [0, -1],
    south: [0, 1],
    west: [-1, 0],
    east: [1, 0],
};

export class Gameboard {
    constructor(width = 10, height = 10) {
        this.width = width;
        this.height = height;
        this.ships = Array.from({ length: height }, () => []);
        this.pointToRootPart = Array.from({ length: height }, () => []);
        this.misses = Array.from({ length: height }, () => []);
        this.hits = Array.from({ length: height }, () => []);
        this.shipPlaces = Array.from({ length: height }, () => []);
    }
    placeShip(coordinates, direction, length) {
        if (this.#doesShipCollide(coordinates, direction, length)) {
            return;
        }
        let ship = new Ship(length);
        const rootCoord = coordinates;
        const transform = directions[direction];
        let i = length;

        while (i) {
            const [x, y] = coordinates;
            this.pointToRootPart[x][y] = rootCoord;
            this.shipPlaces[x][y] = true;
            coordinates = transformCoordinates(coordinates, transform);
            i--;
        }
        const [rX, rY] = rootCoord;
        this.ships[rX][rY] = ship;
    }
    #doesShipCollide(coordinates, direction, length) {
        const transform = directions[direction];
        let i = length;
        while (i) {
            const [x, y] = coordinates;
            if (this.shipPlaces[x][y]) {
                return true;
            }
            coordinates = transformCoordinates(coordinates, transform);
            i--;
        }
        return false;
    }
    receiveAttack(coordinates) {
        const [x, y] = coordinates;
        if (!this.shipPlaces[x][y]) {
            this.misses[x][y] = true;
            return;
        }
        if (!this.hits[x][y]) {
            this.hits[x][y] = true;
            const [rX, rY] = this.pointToRootPart[x][y];
            this.ships[rX][rY].hit();
        }
    }
    areShipsSunk() {
        for (const [s] of this.ships) {
            if (s) {
                if (!s.isSunk()) {
                    return false;
                }
            }
        }
        return true;
    }
}

export class Player {
    constructor() {
        this.gameboard = new Gameboard();
    }
}

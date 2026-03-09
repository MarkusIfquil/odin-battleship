class CoordMap {
    constructor() {
        this.map = new Map();
    }
    get(coord) {
        const hashedCoord = hashCoord(coord);
        return this.map.get(hashedCoord);
    }
    set(coord, value) {
        const hashedCoord = hashCoord(coord);
        this.map.set(hashedCoord, value);
    }
    size() {
        return this.map.size;
    }
    values() {
        return this.map.values();
    }
}

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
    constructor() {
        this.ships = new CoordMap();
        this.shipCoordinates = new CoordMap();
        this.isHit = new CoordMap();
        this.missedShots = [];
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
            this.shipCoordinates.set(coordinates, rootCoord);
            coordinates = transformCoordinates(coordinates, transform);
            i--;
        }

        this.ships.set(rootCoord, ship);
    }
    #doesShipCollide(coordinates, direction, length) {
        const transform = directions[direction];
        let i = length;
        while (i) {
            if (this.shipCoordinates.get(coordinates) != undefined) {
                return true;
            }
            coordinates = transformCoordinates(coordinates, transform);
            i--;
        }
        return false;
    }
    receiveAttack(coordinates) {
        const shipRootCoord = this.shipCoordinates.get(coordinates);
        if (!shipRootCoord) {
            this.missedShots.push(coordinates);
            return;
        }
        if (!this.isHit.get(coordinates)) {
            this.isHit.set(coordinates, true);
            const rootCoord = this.shipCoordinates.get(coordinates);
            this.ships.get(rootCoord).hit();
        }
    }
    areShipsSunk() {
        for (const ship of this.ships.values()) {
            if (!ship.isSunk()) {
                return false;
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

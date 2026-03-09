import { Ship, Gameboard, Player, hashCoord } from "./game.js";

describe("ship test", () => {
    test("constructed correctly", () => {
        const s = new Ship(4);
        expect(s.length).toBe(4);
        expect(s.hitCount).toBe(0);
        expect(s.sunk).toBeFalsy();
    });
    test("hit correctly adjusts hitCount", () => {
        let s = new Ship(4);
        s.hit();
        expect(s.hitCount).toBe(1);
    });
    test("checks correctly if sunk", () => {
        let s = new Ship(2);
        s.hit();
        s.hit();
        expect(s.isSunk()).toBeTruthy();
    });
});

describe("test gameboard", () => {
    test("correctly places ship", () => {
        let g = new Gameboard();
        g.placeShip([0, 0], "south", 4);
        expect(g.shipCoordinates.get([0, 0])).toStrictEqual([0, 0]);
        expect(g.shipCoordinates.get([0, 2])).toStrictEqual([0, 0]);
        expect(g.shipCoordinates.get([0, 3])).toStrictEqual([0, 0]);
        expect(g.shipCoordinates.get([0, 4])).toBeUndefined();
    });
    test("doesn't place ship if it would collide", () => {
        let g = new Gameboard();
        g.placeShip([0, 0], "south", 4);
        g.placeShip([1, 1], "west", 2);
        expect(g.shipCoordinates.get([0, 1])).toStrictEqual([0, 0]);
        expect(g.shipCoordinates.get([1, 1])).toBeUndefined();
    });
    test("receive attack correctly", () => {
        let g = new Gameboard();
        g.placeShip([0, 0], "south", 4);
        g.receiveAttack([0, 0]);
        expect(g.missedShots.length).toBe(0);
        expect(g.isHit.get([0, 0])).toBeTruthy();
        expect(g.ships.get([0, 0]).hitCount).toBe(1);
    });
    test("report lost game correctly", () => {
        let g = new Gameboard();
        g.placeShip([0, 0], "south", 2);
        expect(g.ships.size()).toBe(1);
        expect(g.areShipsSunk()).toBeFalsy();
        g.receiveAttack([0, 0]);
        g.receiveAttack([0, 1]);
        expect(g.areShipsSunk()).toBeTruthy();
    });
});

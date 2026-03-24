import { getRandomAxis, targetRandomSquare } from "./computer-player";
import {
    makeStartPage,
    makeGamePage,
    updateGamePage,
    addClassToCells,
    getPlayerNames,
} from "./dom";
import { Player, PlayerState } from "./game";
import "./style.css";

let body = document.querySelector("body");

let players = [new Player(), new Player()];
let currentPlayer = 0;
let isComputerPlaying = false;

function getCurrentPlayer() {
    return players[currentPlayer];
}

function swapPlayer() {
    if (currentPlayer == 0) {
        currentPlayer = 1;
    } else {
        currentPlayer = 0;
    }
}

function placeShip(player, x, y) {
    const currentShipLength = player.placeableShips[0];
    if (player.gameboard.placeShip([x, y], player.axis, currentShipLength)) {
        console.log(
            `placed ship at ${x} ${y} length ${currentShipLength} for ${player.name}`,
        );
        player.placeableShips.shift();
        return true;
    }
}

function drawShip(player, x, y, shipLength) {
    addClassToCells(player, x, y, shipLength, "placed-ship");
}

function actionAtCell(x, y, playerName) {
    let player = getCurrentPlayer();
    let otherPlayer = players.filter((p) => p != player)[0];
    if (playerName == player.name) {
        if (player.state == PlayerState.PLACING_SHIPS) {
            let length = player.placeableShips[0];
            if (placeShip(player, x, y)) {
                drawShip(player, x, y, length);
            }
            if (player.placeableShips.length == 0) {
                changePlayerState(PlayerState.WAITING);
            }
        }
    } else {
        if (player.state == PlayerState.ATTACKING) {
            console.log("attack", x, y, playerName);
            let isHit = otherPlayer.gameboard.receiveAttack([x, y]);
            drawAttack(isHit, otherPlayer, x, y);
            changePlayerState(PlayerState.WAITING);
            swapPlayer();
            changePlayerState(PlayerState.ATTACKING);
        }
    }
    tickAfterAction();
}

function drawAttack(isHit, player, x, y) {
    if (isHit) {
        addClassToCells(player, x, y, 1, "ship-hit");
    } else {
        addClassToCells(player, x, y, 1, "ship-miss");
    }
}

function tickAfterAction() {
    let player = getCurrentPlayer();
    let otherPlayer = players.filter((p) => p != player)[0];
    if (player.state == PlayerState.ATTACKING) {
        if (player == players[1] && isComputerPlaying) {
            computerAttack();
        }
    }
    if (
        player.state === PlayerState.WAITING &&
        otherPlayer.state === PlayerState.WAITING
    ) {
        changePlayerState(PlayerState.ATTACKING);
    }
}

function computerAttack() {
    let [x, y] = targetRandomSquare(10, 10);
    actionAtCell(x, y, players[0].name);
    changePlayerState(PlayerState.WAITING);
}

function changePlayerState(newState) {
    let player = getCurrentPlayer();
    if (newState == PlayerState.WAITING) {
        updateGamePage(player.name, "WAIT");
    }
    if (newState == PlayerState.ATTACKING) {
        updateGamePage(player.name, "ATTACK");
    }
    if (newState == PlayerState.PLACING_SHIPS) {
        updateGamePage(player.name, "PLACE SHIP");
    }
    player.state = newState;
}

function onCellClick(event) {
    const button = event.target;
    const coords = button.classList.item(1);
    const playerName = button.classList.item(2);
    const x = coords % 10;
    const y = Math.floor(coords / 10);
    console.log(`click: ${x} ${y} ${playerName}`);
    actionAtCell(x, y, playerName);
}

function onCellHover(event) {
    const cells = document.querySelectorAll(".game-square");
    cells.forEach((c) => {
        c.classList.remove("hover-place", "hover-attack");
    });
    const cell = event.target;
    const coords = cell.classList.item(1);
    const x = coords % 10;
    const y = Math.floor(coords / 10);
    const name = cell.classList.item(2);
    let player = getCurrentPlayer();
    if (player.name == name) {
        if (player.state == PlayerState.PLACING_SHIPS) {
            const shipLength = player.placeableShips[0];
            addClassToCells(player, x, y, shipLength, "hover-place");
        }
    } else {
        cell.classList.add("hover-attack");
    }
}

function rotateAxis() {
    let player = getCurrentPlayer();
    if (player.axis == "north") {
        player.axis = "east";
    } else if (player.axis == "east") {
        player.axis = "south";
    } else if (player.axis == "south") {
        player.axis = "west";
    } else if (player.axis == "west") {
        player.axis = "north";
    }
}

function handleKeyPress(event) {
    if (event.key == "r") {
        rotateAxis();
    }
}

document.onkeydown = handleKeyPress;

function computerPlaceShips() {
    while (players[1].placeableShips) {
        let ship = players[1].placeableShips[0];
        if (!ship) {
            break;
        }
        players[1].placeableShips.shift();
        let [x, y] = targetRandomSquare(10, 10);
        let axis = getRandomAxis();
        while (!players[1].gameboard.placeShip([x, y], axis, ship)) {
            [x, y] = targetRandomSquare(10, 10);
            axis = getRandomAxis();
        }
        console.log(
            `computer placed ship at ${x} ${y} axis ${axis} length ${ship}`,
        );
    }
    players[1].state = PlayerState.WAITING;
}

function switchPage() {
    const [playerOneName, playerTwoName] = getPlayerNames();
    body.innerHTML = "";
    players[0].name = playerOneName;
    players[1].name = playerTwoName;
    if (playerTwoName == "computer") {
        isComputerPlaying = true;
        computerPlaceShips();
    }
    const page = makeGamePage(
        onCellClick,
        onCellHover,
        playerOneName,
        playerTwoName,
    );
    body.append(page);
    changePlayerState(PlayerState.PLACING_SHIPS);
}

makeStartPage(switchPage);

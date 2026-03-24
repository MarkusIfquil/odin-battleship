import { getRandomAxis, targetRandomSquare } from "./computer-player";
import {
    makeStartPage,
    makeGamePage,
    updateGamePage,
    addClassToCells,
    getPlayerNames,
    drawMap,
    hideScreen,
    clearCells,
} from "./dom";
import { Player, PlayerState } from "./game";
import "./style.css";

let body = document.querySelector("body");

let selection = {};

let players = [];
let currentPlayer = 0;
let isComputerPlaying = false;

function getCurrentPlayer() {
    return players[currentPlayer];
}

function swapPlayer() {
    if (!isComputerPlaying) {
        hideScreen();
    }
    if (currentPlayer == 0) {
        currentPlayer = 1;
    } else {
        currentPlayer = 0;
    }
}

function drawMaps() {
    const player = getCurrentPlayer();
    let otherPlayer = players.filter((p) => p != player)[0];

    if (isComputerPlaying) {
        drawMap(players[0], false);
        drawMap(players[1], true);
    } else {
        drawMap(player, false);
        drawMap(otherPlayer, true);
    }
}

function placeShipOnMap(player, x, y) {
    const currentShipLength = player.placeableShips[0];
    if (player.gameboard.placeShip([x, y], player.axis, currentShipLength)) {
        console.log(
            `placed ship at ${x} ${y} length ${currentShipLength} for ${player.name}`,
        );
        player.placeableShips.shift();
        return true;
    }
}

function placeShip(x, y) {
    const player = getCurrentPlayer();
    placeShipOnMap(player, x, y);
    if (player.placeableShips.length == 0) {
        changePlayerState(PlayerState.WAITING);
        swapPlayer();
    }
}

function isClickedAlready(player, x, y) {
    return player.gameboard.hits[x][y] || player.gameboard.misses[x][y];
}

function attack(x, y) {
    const player = getCurrentPlayer();
    let otherPlayer = players.filter((p) => p != player)[0];
    if (isClickedAlready(otherPlayer, x, y)) {
        return;
    }
    console.log("attack", x, y, player.name);
    otherPlayer.gameboard.receiveAttack([x, y]);
    changePlayerState(PlayerState.WAITING);
    swapPlayer();
}

function actionAtCell(x, y, playerName) {
    let player = getCurrentPlayer();
    if (playerName == player.name) {
        if (player.state == PlayerState.PLACING_SHIPS) {
            placeShip(x, y);
        }
    } else {
        if (player.state == PlayerState.ATTACKING) {
            attack(x, y);
        }
    }
    tickAfterAction();
}

function doAction() {
    actionAtCell(selection.x, selection.y, selection.playerName);
}

function tickAfterAction() {
    let player = getCurrentPlayer();
    let otherPlayer = players.filter((p) => p != player)[0];
    if (
        player.gameboard.areShipsSunk() &&
        !player.state == PlayerState.PLACING_SHIPS
    ) {
        changePlayerState(PlayerState.LOSE);
        swapPlayer();
        changePlayerState(PlayerState.WIN);
        return;
    }
    console.log("player states: ", player.state, otherPlayer.state);
    if (
        player.state === PlayerState.WAITING &&
        otherPlayer.state === PlayerState.WAITING
    ) {
        changePlayerState(PlayerState.ATTACKING);
    }
    if (player.state == PlayerState.ATTACKING) {
        if (player == players[1] && isComputerPlaying) {
            computerAttack();
        }
    }
    drawMaps();
}

function computerAttack() {
    console.log("computer attack");
    const otherPlayer = players[0];
    let x, y;
    while (true) {
        [x, y] = targetRandomSquare(10, 10);
        if (!isClickedAlready(otherPlayer, x, y)) {
            break;
        }
    }
    actionAtCell(x, y, players[0].name);
}

function changePlayerState(newState) {
    let player = getCurrentPlayer();
    console.log(`changed state of player ${player.name} to ${newState}`);
    if (newState === PlayerState.WAITING) {
        updateGamePage(player.name, "WAIT");
    } else if (newState === PlayerState.ATTACKING) {
        updateGamePage(player.name, "ATTACK");
    } else if (newState === PlayerState.PLACING_SHIPS) {
        updateGamePage(player.name, "PLACE SHIP");
    } else if (newState === PlayerState.WIN) {
        updateGamePage(player.name, "YOU WON");
    } else if (newState === PlayerState.LOSE) {
        updateGamePage(player.name, "YOU LOST");
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
    selection = {
        x,
        y,
        playerName,
    };
    const player = getCurrentPlayer();
    if (player.state == PlayerState.PLACING_SHIPS) {
        clearCells("place-ghost");
        addClassToCells(player, x, y, player.placeableShips[0], "place-ghost");
    }
}

function onCellHover(event) {
    clearCells("hover-place", "hover-attack");
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
    console.log("start");
    const [playerOneName, playerTwoName] = getPlayerNames();
    body.innerHTML = "";
    isComputerPlaying = false;
    players[0] = new Player(playerOneName);
    players[1] = new Player(playerTwoName);
    if (playerTwoName == "computer") {
        isComputerPlaying = true;
        computerPlaceShips();
    }
    const page = makeGamePage(
        onCellClick,
        onCellHover,
        playerOneName,
        playerTwoName,
        switchPage,
        doAction,
    );
    body.append(page);
    if (!isComputerPlaying) {
        players[1].state = PlayerState.PLACING_SHIPS;
    }
    changePlayerState(PlayerState.PLACING_SHIPS);
}

makeStartPage(switchPage);

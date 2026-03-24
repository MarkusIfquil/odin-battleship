import { directions } from "./game";

let body = document.querySelector("body");

function setPlayerMode(event) {
    let button = event.target;
    if (button.textContent == "Versus Computer") {
        document.querySelector("#playertwo-name-input").style.visibility =
            "visible";
        button.textContent = "Versus Player";
    } else {
        document.querySelector("#playertwo-name-input").style.visibility =
            "hidden";
        button.textContent = "Versus Computer";
    }
}

export function makeStartPage(onStart) {
    let page = document.createElement("div");
    let title = document.createElement("h1");
    title.textContent = "BATTLESHIPS";
    let versusButton = document.createElement("button");
    versusButton.textContent = "Versus Computer";
    versusButton.onclick = setPlayerMode;
    let inputLegend = document.createElement("p");
    inputLegend.textContent = "Enter Name:";
    let playerOneNameInput = document.createElement("input");
    playerOneNameInput.id = "playerone-name-input";
    let playerTwoNameInput = document.createElement("input");
    playerTwoNameInput.id = "playertwo-name-input";
    playerTwoNameInput.style.visibility = "hidden";
    let startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.onclick = onStart;

    page.append(
        title,
        inputLegend,
        playerOneNameInput,
        playerTwoNameInput,
        versusButton,
        startButton,
    );
    body.append(page);
    return page;
}

function makeGrid(width, height, onCellClick, onCellHover, playerName) {
    let grid = document.createElement("div");
    grid.className = "game-grid";
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let square = document.createElement("div");
            square.classList.add(
                "game-square",
                (i * 10 + j).toString(),
                playerName,
            );

            square.onclick = onCellClick;
            square.onmouseover = onCellHover;
            grid.append(square);
        }
    }
    return grid;
}

export function makeGamePage(
    onCellClick,
    onCellHover,
    playerOneName,
    playerTwoName,
) {
    let page = document.createElement("div");
    page.className = "game-page";
    let turnOrder = document.createElement("h1");
    turnOrder.id = "turn-order";
    let command = document.createElement("h2");
    command.id = "command";
    let gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";
    let playerGrid = makeGrid(10, 10, onCellClick, onCellHover, playerOneName);
    let enemyGrid = makeGrid(10, 10, onCellClick, onCellHover, playerTwoName);
    gridContainer.append(playerGrid, enemyGrid);
    page.append(turnOrder, command, gridContainer);
    return page;
}

export function updateGamePage(activePlayer, givenCommand) {
    let turnOrder = document.querySelector("#turn-order");
    turnOrder.textContent = `It is ${activePlayer}'s turn`;

    let command = document.querySelector("#command");
    command.textContent = givenCommand;
}

function isOutOfBounds(x, y) {
    return x < 0 || x > 9 || y < 0 || y > 9;
}

export function addClassToCells(player, x, y, shipLength, className) {
    let [tX, tY] = directions[player.axis];
    while (shipLength) {
        if (!addClasstoCell(x, y, player.name, className)) {
            break;
        }
        x += tX;
        y += tY;
        shipLength--;
    }
}

export function addClasstoCell(x, y, playerName, className) {
    const coord = y * 10 + x;
    let cell = document.querySelector(
        `.game-square[class~='${coord}'].${playerName}`,
    );
    if (!cell || isOutOfBounds(x, y)) {
        return false;
    }
    cell.classList.add(className);
    return true;
}

export function drawMap(player, shouldBeHidden) {
    if (shouldBeHidden) {
        const cells = document.querySelectorAll(".game-square");
        cells.forEach((c) => {
            if (c.classList.item(2) == player.name) {
                c.classList.remove("placed-ship");
            }
        });
        return;
    }
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            if (player.gameboard.hits[x][y]) {
                addClasstoCell(x, y, player.name, "ship-hit");
            }
            if (player.gameboard.misses[x][y]) {
                addClasstoCell(x, y, player.name, "ship-miss");
            }
            if (player.gameboard.shipPlaces[x][y] && !shouldBeHidden) {
                addClasstoCell(x, y, player.name, "placed-ship");
            }
        }
    }
}

export function getPlayerNames() {
    let playerOneName = document.querySelector("#playerone-name-input").value;
    let playerTwoName = document.querySelector("#playertwo-name-input").value;
    if (!playerTwoName) {
        playerTwoName = "computer";
    }
    return [playerOneName, playerTwoName];
}

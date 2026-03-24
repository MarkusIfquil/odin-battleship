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
    console.log(onStart);
    body.innerHTML = "";
    let page = document.createElement("div");
    page.classList.add("start-page");
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
    startButton.id = "start";
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
            square.onmouseleave = () => {
                clearCells("hover-attack", "hover-place");
            };
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
    onStart,
    onSubmit,
    onRotate,
) {
    let page = document.createElement("div");
    page.className = "game-page";
    let turnOrder = document.createElement("h2");
    turnOrder.id = "turn-order";
    let command = document.createElement("h2");
    command.id = "command";
    let gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";
    let playerGrid = makeGrid(10, 10, onCellClick, onCellHover, playerOneName);
    let enemyGrid = makeGrid(10, 10, onCellClick, onCellHover, playerTwoName);
    gridContainer.append(playerGrid, enemyGrid);

    let newGameButton = document.createElement("button");
    newGameButton.textContent = "New Game";
    newGameButton.id = "new-game";
    console.log(onStart);
    newGameButton.onclick = () => {
        makeStartPage(onStart);
    };

    let readyButton = document.createElement("button");
    readyButton.id = "ready";
    readyButton.textContent = "Ready";
    readyButton.style.display = "none";
    readyButton.onclick = () => {
        document.querySelector(".grid-container").style.display = "flex";
        readyButton.style.display = "none";
    };

    let rotateButton = document.createElement("button");
    rotateButton.id = "rotate";
    rotateButton.textContent = "Rotate";
    rotateButton.onclick = onRotate;

    let submitButton = document.createElement("button");
    submitButton.id = "submit";
    submitButton.textContent = "Submit";
    submitButton.onclick = onSubmit;

    let buttonsDiv = document.createElement("div");
    buttonsDiv.append(submitButton, rotateButton, newGameButton);

    let controlsP = document.createElement("p");
    controlsP.innerHTML =
        "Place ships by clicking on your map. Press r or the rotate button to rotate your ship placement.<br>Attack by clicking on your opponents map.<br>Once you have selected your square, press Enter or the submit button to submit your move.<br>In two player mode, once you have submitted your move, you pass your device over to your opponent, who clicks the ready button to continue the game.";

    page.append(
        turnOrder,
        command,
        readyButton,
        gridContainer,
        buttonsDiv,
        controlsP,
    );
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
            if (player.gameboard.sunk[x][y]) {
                addClasstoCell(x, y, player.name, "ship-sunk");
            }
        }
    }
}

export function getPlayerNames() {
    let playerOneName =
        document.querySelector("#playerone-name-input").value || "player";
    let playerTwoName =
        document.querySelector("#playertwo-name-input").value || "computer";
    return [playerOneName, playerTwoName];
}

export function hideScreen() {
    document.querySelector(".grid-container").style.display = "none";
    document.querySelector("#ready").style.display = "block";
}

export function clearCells(...classes) {
    const cells = document.querySelectorAll(".game-square");
    cells.forEach((c) => {
        c.classList.remove(...classes);
    });
}

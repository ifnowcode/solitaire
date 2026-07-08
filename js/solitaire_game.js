let debug = true;

let game = new Solitaire();
start();

function drawCardDown() {
  game.drawCardDown();
  game.render();
}

function drawCardUp() {
  game.drawCardUp()
  game.render();
}

async function start() {
  await game.reset().then(() => {
    game.setupZones(); // should only be done once
    game.render();
    consoleLog("Game Ready!");
  });
}

async function reset() {
  await game.reset().then(() => {
    game.render();
    consoleLog("Game Ready!");
  });
}

function shuffle() {
  game.deck.shuffle();
}

function undo() {
  game.undoLastAction();
}

function deal() {
  game.dealCards();
}


window.onload = game.render();
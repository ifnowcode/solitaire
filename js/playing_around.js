let game = new CardGame();
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
    game.render();
    console.log("Game Ready!");
  });
}

async function reset() {
  await game.reset().then(() => {
    game.render();
    console.log("Game Ready!");
  });
}

window.onload = game.render();
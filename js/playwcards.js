/*
let draggedCard = null;
*/

let deck = new Deck();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
//const imagesCanvas = {};
const cardWidth = 100;
const cardHeight = 140;
let cards = [];
let draggingCard = null;
let offsetX = 0;
let offsetY = 0;

const gameState = {
  hand: [],
  table: [],
  discard: []
};

function clearGameState() {
  for (let key in gameState) {
    gameState[key].length = 0;
  }
  drawCanvas();
}

function reset() {
  gameState.table.length = 0;
  drawCanvas();
}

function drawCardDown() {
  const card = deck.drawRandomCard();
  console.log("Draw Card:", card);
  if (!card) return;

  gameState.table.push(card);
  drawCanvas();
}

function drawCardUp() {
  const card = deck.drawRandomCard();
  card.faceUp = true;
  console.log("Draw Card:", card);
  if (!card) return;

  gameState.table.push(card);
  drawCanvas();
}

function drawCanvas() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(0,80,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let card of gameState.table) {
    //console.log("Drawing Card:", card);
    card.draw(ctx);
  }
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check from topmost card down
  for (let i = gameState.table.length - 1; i >= 0; i--) {
    const card = gameState.table[i];
    if (card.isUnder(mouseX, mouseY)) {
      offsetX = mouseX - card.x;
      offsetY = mouseY - card.y;
      card.dragging = true;
      draggingCard = card;

      // Bring to front
      gameState.table.push(gameState.table.splice(i, 1)[0]);
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!draggingCard) return;

  const rect = canvas.getBoundingClientRect();
  draggingCard.x = e.clientX - rect.left - offsetX;
  draggingCard.y = e.clientY - rect.top - offsetY;
  drawCanvas();
});

canvas.addEventListener('mouseup', () => {
  if (draggingCard) draggingCard.dragging = false;
  draggingCard = null;
});

canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Topmost card gets priority
  for (let i = gameState.table.length - 1; i >= 0; i--) {
    const card = gameState.table[i];
    if (card.isUnder(mouseX, mouseY)) {
      if (!card.faceUp) {
        card.faceUp = true;
        drawCanvas();
      }
      break;
    }
  }
});
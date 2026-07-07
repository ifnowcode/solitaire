// https://css-tricks.com/easing-animations-in-canvas/
// https://copilot.microsoft.com/chats/BWu5kqgadS8uBQUCJg2ER
// https://pixabay.com/images/search/card%20backs/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cardName = 'spade_14';
const cardWidth = 100;
const cardHeight = 145;
const cardPadding = 10;
let imagesCanvas = {};

function getEase(progress, start, distance, steps) {
  progress /= steps/2;
  if (progress < 1) {
    return (distance/2)*(Math.pow(progress, 3)) + start;
  }
  progress -= 2;
  return distance/2*(Math.pow(progress, 3)+ 2) + start;
}

function getCubicEase(progress, start, distance, steps) {
  progress /= steps/2;
  if (progress <= 1) {
    return (distance/2)*progress*progress + start;
  }
  progress--;
  return -1*(distance/2) * (progress*(progress-2) - 1) + start;
}

function getQuadraticEase(progress, start, distance, steps) {
  progress /= steps/2;
  if (progress <= 1) {
    return (distance/2)*progress*progress + start;
  }
  progress--;
  return -1*(distance/2) * (progress*(progress-2) - 1) + start;
}

function sineEaseInOut(progress, start, distance, steps) {
  return -distance/2 * (Math.cos(Math.PI*progress/steps) - 1) + start;
};

function getQuinticEase(progress, start, distance, steps) {
  progress /= steps/2;
  if (progress < 1) {
    return (distance/2)*(Math.pow(progress, 5)) + start;
  }
  progress -= 2;
  return distance/2*(Math.pow(progress, 5) + 2) + start;
}

function expEaseInOut(progress, start, distance, steps) {
  progress /= steps/2;
  if (progress < 1) return distance/2 * Math.pow( 2, 10 * (progress - 1) ) + start;
 progress--;
  return distance/2 * ( -Math.pow( 2, -10 * progress) + 2 ) + start;
};

function getLinearEase(progress, start, distance, steps) {
  return distance / steps * progress
}

function getX(params) {
  let distance = params.xTo - params.xFrom;
  let steps = params.frames;
  let progress = params.frame;
  return getLinearEase(progress, params.xFrom, distance, steps, 3);
}

function getY(params) {
  let distance = params.yTo - params.yFrom;
  let steps = params.frames;
  let progress = params.frame;
  return getLinearEase(progress, params.yFrom, distance, steps, 3);
}

function addImage(params) {
  let name = params.name;
  
  if (imagesCanvas[name] === undefined) {
    imagesCanvas[name] = document.createElement('canvas');
  }
  imagesCanvas[name].width = cardWidth;
  imagesCanvas[name].height = cardHeight;

  let image = document.getElementById(name);
  let imageCtx = imagesCanvas[name].getContext('2d');
  imageCtx.clearRect(0, 0, cardWidth, cardHeight);
  imageCtx.drawImage(image, 0, 0, cardWidth, cardHeight);
  ctx.drawImage(imagesCanvas[name], getX(params), getY(params));
  
  if (params.frame < params.frames) {
    params.frame = params.frame + 1;
    window.requestAnimationFrame(drawCanvas);
    window.requestAnimationFrame(addImage.bind(null, params))
  }
}

function drawCanvas() {
  ctx.fillStyle = 'rgb(0,80,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function play() {
  drawCanvas();
  addImage({
    name: cardName,
    frame: 0,
    frames: 100,
    xFrom: cardPadding,
    xTo: canvas.width - cardWidth - cardPadding,
    yFrom: cardPadding,
    yTo: canvas.height - cardHeight - cardPadding
  });
}

function start() {
  drawCanvas();
  dragCard({
    name: cardName,
    frame: 0,
    frames: 100,
    xFrom: cardPadding,
    xTo: canvas.width - cardWidth - cardPadding,
    yFrom: cardPadding,
    yTo: canvas.height - cardHeight - cardPadding
  });
}

function drawCard() {
}

function dragCard(params) {

  console.log("Name", params.name);
  let img = document.getElementById(params.name);

  let isDragging = false;
  let offsetX, offsetY;
  let imgX = 0, imgY = 0; // Initial position

  // Draw image initially
  if (img.complete) {
    ctx.drawImage(img, imgX, imgY, cardWidth, cardHeight);
  } else {
    img.onload = () => ctx.drawImage(img, imgX, imgY, cardWidth, cardHeight);
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    console.log("Client", e, rect);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside the image bounds
    if (x > imgX && x < imgX + img.width &&
        y > imgY && y < imgY + img.height) {
      isDragging = true;
      offsetX = x - imgX;
      offsetY = y - imgY;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    imgX = e.clientX - rect.left - offsetX;
    imgY = e.clientY - rect.top - offsetY;
    
    console.log("Mouse move:", imgX, imgY);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
    ctx.drawImage(img, imgX, imgY, cardWidth, cardHeight);
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });
}

window.onload = start;


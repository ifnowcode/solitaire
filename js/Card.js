class Card {
  constructor(deck, name, suit, value, width, height, x = 10, y = 10, onReady = null) {
    this.deck = deck;
    this.name = name;
    this.suit = suit;
    this.value = value;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.onReady = onReady;
    this.dragging = false;
    //this.snap_x = null;
    //this.snap_y = null;
    this.originZone = null; 
    this.image = null;
    this.canvas = null;
    this.faceUp = false;
    //if (tracedebug) console.log("Suit map:", suitEmojis);
    this.emoji = `${suitValues[value]}${suitEmojis[suit]}`;
    //if (tracedebug) console.log(JSON.stringify(this.emoji)); 
  }

  loadPNG(callback) {
    this.image = new Image();
    this.image.src = `./images/cards/${this.name}.png`;
    //if (tracedebug) console.log("Loading:", this.image.src);
    this.image.onload = () => {
      this.createCanvas();
      if (this.onReady) this.onReady(this); // signal it's ready
      if (callback) callback(this); // signal it's ready
    };
    this.image.onerror = () => {
      consoleWarn(`Image failed: ${this.name}`);
    };
  }
  
  loadImage(callback) {
    this.image = new Image();
    this.image.src = `./images/${this.name}`;
    //if (tracedebug) console.log("Loading:", this.image.src);
    this.image.onload = () => {
      this.createCanvas();
      if (this.onReady) this.onReady(this); // signal it's ready
      if (callback) callback(this); // signal it's ready
    };
    this.image.onerror = () => {
      consoleWarn(`Image failed: ${this.name}`);
    };
  }
  
  loadPNGAsync() {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = `./images/cards/${this.name}.png`;
      //if (tracedebug) console.log("Loading:", this.image.src);
      this.image.onload = () => {
        this.createCanvas();
        resolve(this); // image is ready
      };
      this.image.onerror = () => {
        consoleWarn(`Image failed: ${this.name}`);
        reject(new Error(`Image load failed for ${this.name}.png`));
      };
    });
  }
  
  loadImageAsync() {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = `./images/${this.name}`;
      //if (tracedebug) console.log("Loading:", this.image.src);
      this.image.onload = () => {
        this.createCanvas();
        resolve(this); // image is ready
      };
      this.image.onerror = () => {
        consoleWarn(`Image failed: ${this.name}`);
        reject(new Error(`Image load failed for ${this.name}`));
      };
    });
  }

  createCanvas() {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;

    const ctx = offscreen.getContext('2d');
    ctx.drawImage(this.image, 0, 0, this.width, this.height);

    this.canvas = offscreen;
  }

  render(ctx) {
    if (this.canvas) {
      if (this.faceUp) {
        //if (tracedebug) console.log("Card Front:", ctx, this.canvas);
        ctx.drawImage(this.canvas, this.x, this.y);
      } else {
        //if (tracedebug) console.log("Card Back:", ctx, this.deck.getCardBack().canvas);
        ctx.drawImage(this.deck.getCardBack().canvas, this.x, this.y);
      }
    } else {
      if (tracedebug) console.log("Card Canvas is null!", ctx);
    }
  }

  isUnder(x, y) {
    return (
      x > this.x && x < this.x + this.width &&
      y > this.y && y < this.y + this.height
    );
  }
  
  containsPoint(x, y) {
    return (
      x >= this.x && x <= this.x + this.width &&
      y >= this.y && y <= this.y + this.height
    );
  }
}

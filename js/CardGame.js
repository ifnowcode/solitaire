class CardGame {
  constructor(cardWidth=100, cardHeight=140) {
    this.deck = new Deck(cardWidth, cardHeight);
    this.cards = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.zones = [];
    this.draggingCard = null;
    this.draggingStack = null;
    this.hoveredCard = null;
    this.hoveredZone = null;
    this.canvas = document.getElementById('canvas');
    consoleLog("Canvas initialized", this.canvas);
    this.ctx = canvas.getContext('2d');
    consoleLog("Context initialized", this.ctx);
    this.canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.mouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.mouseUp(e));
    this.canvas.addEventListener('click', (e) => this.mouseClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.mouseDblClick(e));
    document.addEventListener('keydown', (e) => this.keyDown(e));
  }

  async reset() {
    this.cards.length = 0;
    for (let zone of this.zones) {
      zone.cards.length = 0;
    }
    await this.deck.init();
  }
  
  activate(card) {
    if (!this.cards.includes(card)) {
      this.cards.push(card);
      //consoleLog("Activate:", this.cards.length, this.cards);
    }
  }
  
  deactivate(card) {
    const index = this.cards.indexOf(card);
    if (index !== -1) {
      this.cards.splice(index, 1);
      //consoleLog("Deactivate:", this.cards.length, this.cards);
    }
  }

  addZone(zone) {
    this.zones.push(zone);
  }

  drawCardDown() {
    const card = this.deck.drawRandomCard();
    if (!card) return;
    consoleLog("Draw Card:", card);
    this.activate(card);
  }

  drawCardUp() {
    const card = this.deck.drawRandomCard();
    if (!card) return;
    card.faceUp = true;
    consoleLog("Draw Card:", card);
    this.activate(card);
  }

  render() {
    //this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = 'rgb(0,80,0)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let card of this.cards) {
      //consoleLog("Drawing Card:", card);
      //consoleLog("Context", this.ctx);
      card.render(this.ctx);
    }
    for (let zone of this.zones) {
      zone.render();
      for (let card of zone.cards) {
        card.render(this.ctx);
      }
    }
    if (this.draggingCard) {
      this.draggingCard.render(this.ctx);
    }
  }

  cancelDrag() {
    if (this.draggingCard) this.draggingCard.dragging = false;
    this.draggingCard = null;
    this.draggingStack.forEach(c => c.dragging = false);
    this.draggingStack = null;
  }

  keyDown(e) {
    //e.preventDefault();
    //consoleLog("Key down", e);
    if (e.key === 'Escape') {
      //consoleLog("Esc Key down", e);
      this.cancelDrag();
    }
  }

  mouseDown(e) {
    //consoleLog("Card Game Mouse Down !!!!");
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check from topmost card down
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.isUnder(mouseX, mouseY)) {
        this.offsetX = mouseX - card.x;
        this.offsetY = mouseY - card.y;
        card.dragging = true;
        this.draggingCard = card;
        array_bring_to_front(i, this.cards);
        //consoleLog("CG: Dragging card:", this.draggingCard);
        //consoleLog("CG: Equality", this.draggingCard.originZone.cards === this.draggingCard.originZone.cards);
        //consoleLog("CG: Card in originZone.cards?", this.draggingCard.originZone.cards.some(c => c.id === this.draggingCard.id));
        //if (this.draggingCard.originZone.cards.includes(this.draggingCard)) {
        //  consoleLog("CG: Remove Dragging Card from", this.draggingCard.originZone.name);
        //  array_remove(this.draggingCard, this.draggingCard.originZone.cards);
        //}
        break;
      }
    }
  }

  mouseUp(e) {
    console.log("Card Game Mouse Up !!!!");
    if (this.draggingCard) {
      for (let zone of this.zones) {
        //consoleLog("Contains:", zone.contains(this.draggingCard), zone.canAccept(this.draggingCard), zone);
        if (zone.contains(this.draggingCard) && zone.canAccept(this.draggingCard)) {
          consoleLog("Accepting:", zone.contains(this.draggingCard), zone.canAccept(this.draggingCard), zone);
          zone.snapCard(this.draggingCard);
          break;
        }
      }
      this.draggingCard.dragging = false;
      this.draggingCard = null;
      this.render();
    }
  }

  mouseClick(e) {
    console.log("Card Game Mouse Click !!!!");
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let zone of game.zones) {
      if (zone.containsPoint?.(mouseX, mouseY) && zone.handleClick) {
        //consoleLog("Click Zone", zone);
        zone.handleClick();
        break;
      }
    }
  }

  mouseDblClick(e) {
    //consoleLog("Card Game Mouse DblClick !!!!");
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Topmost card gets priority
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.isUnder(mouseX, mouseY)) {
        if (!card.faceUp) {
          card.faceUp = true;
          this.render();
        }
        break;
      }
    }
  }

  mouseMove(e) {
    //consoleLog("Card Game Mouse Move !!!!");
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (this.draggingCard) {
      const rect = this.canvas.getBoundingClientRect();
      this.draggingCard.x = mouseX - this.offsetX;
      this.draggingCard.y = mouseY - this.offsetY;
      this.render();
    }
  }
}
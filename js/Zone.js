class Zone {
  constructor(game, name, x, y, width, height, stagger=0) {
    this.game = game;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cards = [];
    this.stagger = stagger;
  }

  canAccept(card) {
    //consoleLog("Accept?", false, card);
    return false;
  }

  add(card) {
    if (!this.cards.includes(card)) {
      this.cards.push(card);
    }
  }

  remove(card) {
    array_remove(card, this.cards);
  }

  removeCardFromOriginZone(card) {
    if (card.originZone) {
      card.originZone.remove(card);
      //array_remove(card, card.originZone.cards);
    }
  }

  activateOriginTopCard(card) {
    if (card.originZone) {
      let cards = card.originZone.cards;
      //consoleLog("Origin Cards:", cards);
      if (cards.length > 0)
      {
        let c = cards[cards.length - 1];
        game.pushUndo({
          type: 'flip',
          card: c,
          to: this,
          from: c.originZone,
          x: c.x,
          y: c.y
        });
        c.faceUp = true;
        this.game.activate(c);
      }
    }
  }

  move(card) {
    this.removeCardFromOriginZone(card);
    if (card.originZone && card.originZone.name.startsWith("tableau")) {
      this.activateOriginTopCard(card);
    }
    card.x = this.x;
    card.y = this.y + this.cards.length * this.stagger;
    card.originZone = this;
    this.add(card);
    //consoleLog("Zone Snap Length:", this.cards.length);
  }

  snapCard(card, spacing = 0) {
    
    game.pushUndo({
      type: 'move',
      card: card,
      to: this,
      from: card.originZone,
      x: card.x,
      y: card.y
    });
    
    this.move(card, spacing);
  }

  render() {
    this.renderZone(this.game.ctx);
  }

  renderZone(ctx) {
    //consoleLog("Draw Zone", this.x, this.y, this.width, this.height);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; // yellow with transparency
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Optional: label zone name
    ctx.font = '14px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(this.name, this.x + 5, this.y + 18);
  }

  containsPoint(x, y) {
    return (
      x >= this.x && x <= this.x + this.width &&
      y >= this.y && y <= this.y + this.height
    );
  }

  contains(card) {
    return (
      card.x + this.game.deck.cardWidth / 2 > this.x &&
      card.x + this.game.deck.cardWidth / 2 < this.x + this.width &&
      card.y + this.game.deck.cardHeight / 2 > this.y &&
      card.y + this.game.deck.cardHeight / 2 < this.y + this.height
    );
  }
}

class DeckZone extends Zone {

  render(ctx) {
    super.render();
    //consoleLog("DeckZone:", this.game.deck.cards.length, this.game.deck.back.canvas);
    if (this.game.deck.cards.length > 0 && this.game.deck.back.canvas) {
      this.game.deck.back.x = this.x;
      this.game.deck.back.y = this.y;
      this.game.deck.back.render(this.game.ctx);
    }
  }
  
  drawCard() {
    const card = this.game.deck.drawCard();
    console.log("Draw", card);
    if (card) {
      card.faceUp = true;
      card.originZone = this;
      game.discardZone.move(card);
      this.game.activate(card); // if needed for dragging/render
    }
    return card;
  }

  handleClick() {
    const card = this.drawCard();
    if (card) {

      game.pushUndo({
        type: 'reveal',
        card: card,
        to: this,
        from: card.originZone,
        x: card.x,
        y: card.y
      });

      this.game.render();
    }
  }
}

class DiscardZone extends Zone {
  
  returnCard(topCard) {
    this.cards.pop();
    this.game.deck.cards.push(topCard); // Optional: recycle
    //this.game.cards = this.game.cards.filter(c => c !== topCard);
    this.game.deactivate(topCard);
    //this.cards = this.cards.filter(c => c !== topCard);
    this.remove(topCard);
    this.game.render();
  }

  handleClick() {
    const topCard = this.cards[this.cards.length - 1];
    consoleLog("Discard handle click", topCard, this.cards);
    if (topCard) {
      game.pushUndo({
        type: 'return',
        card: topCard,
        to: this,
        from: topCard.originZone,
        x: topCard.x,
        y: topCard.y
      });
      
      this.returnCard(topCard);
    } else {
      consoleLog("Discard is Not Top!", topCard, this.cards);
    }
  }
}

class FoundationZone extends Zone {
  canAccept(card) {
    const top = this.cards[this.cards.length - 1];
    //consoleLog("Accept?", !top, card);
    return !top ? card.value === 1 :
      card.suit === top.suit && card.value === top.value + 1;
  }
}

class TableauZone extends Zone {
  constructor(game, name, x, y, width, height) {
    super(game, name, x, y, width, height, 30);
  }
  
  canAccept(card) {
    const top = this.cards[this.cards.length - 1];

    if (!top) {
      consoleLog("King Me", card.value);
      //consoleLog("Accept?", card.value === 13, card);
      return card.value === 13; // Only Kings can start empty tableau piles
    }

    // Must be opposite color and one value lower
    const isOppositeColor =
      (this.isRed(card.suit) && !this.isRed(top.suit)) ||
      (!this.isRed(card.suit) && this.isRed(top.suit));

    //consoleLog("Accept?", isOppositeColor && card.value === top.value - 1, card);
    return isOppositeColor && card.value === top.value - 1;
  }

  snapCard(card) {
    super.snapCard(card);
  }

  getStackFrom(card) {
    const index = this.cards.indexOf(card);
    if (index === -1) return [card]; // fallback: single card
    return this.cards.slice(index); // all cards from this point down
  }

  isRed(suit) {
    return suit === 'heart' || suit === 'diamond';
  }
}
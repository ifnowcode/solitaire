class Solitaire extends CardGame {
  constructor() {
    super();
    this.tableau = [];
    this.undoStack = [];
    this.draggingStack = null;
  }

  setupZones() {
    this.deckZone = new DeckZone(this, 'deck', 50, 20, this.deck.cardWidth, this.deck.cardHeight);
    this.addZone(this.deckZone);
    this.discardZone = new DiscardZone(this,'waste', 170, 20, this.deck.cardWidth, this.deck.cardHeight);
    this.addZone(this.discardZone);
    for (let i = 0; i < 7; i++) {
      const zone = new TableauZone(this, `tableau_${i}`, 50 + i * 162, 200, this.deck.cardWidth, 490)
      this.addZone(zone);
      this.tableau.push(zone)
    }
    for (let i = 0; i < 4; i++) {
      this.addZone(new FoundationZone(this, `foundation_${i}`, 600 + i * 140, 20, this.deck.cardWidth, this.deck.cardHeight));
    }
  }

  async dealCards() {
    for (let v = 0; v < 7; v++) {
      for (let i = v; i < 7; i++) {
        const card = this.deck.drawRandomCard();
        if (i === v) {
          card.faceUp = true;
          game.activate(card);
        }
        this.tableau[i].move(card, 30);
        game.render();
        await sleep(100);
      }
    }
  }

  render() {
    super.render();
    this.drawDebugOverlay(this.ctx);
  }

  //
  // AI
  //


  //
  // Undo
  //

  pushUndo(action) {
    this.undoStack.push(action);
    consoleLog("Push:", action);
  }

  popUndo() {
    return this.undoStack.pop();
  }

  undoLastAction() {
    const action = this.popUndo();
    consoleLog("Undo Action:", this.undoStack.length, action);
    if (!action) return;

    switch (action.type) {
      case 'return':
        this.deckZone.drawCard();
        break;
      case 'reveal':
        const topCard = this.discardZone.cards[this.discardZone.cards.length - 1];
        if (topCard) {
          this.discardZone.returnCard(topCard);
        }
        break;

      case 'move':
        //action.card.x = action.x;
        //action.card.y = action.y;
        action.from.removeCardFromOriginZone(action.card);
        action.card.x = action.from.x;
        action.card.y = action.from.y + action.from.cards.length * action.from.stagger;
        action.card.originZone = action.from;
        action.from.add(action.card);
        //action.from.move(action.card);
        break;
      /*
      case 'reveal_move':
        if (action.from && action.from.name.startsWith("tableau")) {
          let cards = action.from.cards;
          if (cards.length > 0)
          {
            let c = cards[cards.length - 1];
            c.faceUp = !c.faceUp;
            array_remove(c, this.cards);
          }
        }
        action.card.x = action.x;
        action.card.y = action.y;
        action.from.move(action.card);
        break;
      */
      case 'flip':
        action.card.faceUp = false;
        array_remove(action.card, this.cards);
        break;
    }

    this.render();
  }

  //
  // Listeners
  //

  keyDown(e) {
    super.keyDown(e);
    const key = e.key.toUpperCase();
    //e.preventDefault();
    //consoleLog("Key down", e);
    if (e.key === 'Escape') {
      //consoleLog("Esc Key down", e);
      this.cancelDrag();
    } else if (e.key.length === 1 && key === 'D') {
      //consoleLog("D key down", e);
      console.group("Dump");
      consoleLog("Game cards:", this.cards);
      //consoleLog("Game:", this.game.cards);
      console.groupEnd();
    }
  }
  
  /*
  mouseDown_stack(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check from topmost card down
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.isUnder(mouseX, mouseY)) {
        const zone = card.originZone;
        consoleLog("Get Zone", zone, zone.getStackFrom);
        if (zone && zone.getStackFrom) {
          this.draggingStack = zone.getStackFrom(card);
          consoleLog("Dragging stack", this.draggingStack);
          this.draggingStack.forEach(c => c.dragging = true);
          this.draggingCard = card;
        } else {
          super.mouseDown(e);
        }
        break;
      }
    }
  }
  */

  mouseDown(e) {
    //consoleLog("Card Game Mouse Down !!!!");
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Check from topmost card down
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.isUnder(mouseX, mouseY)) {
        const zone = card.originZone;
        this.offsetX = mouseX - card.x;
        this.offsetY = mouseY - card.y;
        if (false && zone && zone.name.startsWith("tableau") && zone.getStackFrom) {
          this.draggingStack = zone.getStackFrom(card);
          consoleLog("CG: Dragging stack", this.draggingStack);
          this.draggingStack.forEach(c => c.dragging = true);
          this.draggingCard = card;
        } else {
          card.dragging = true;
          this.draggingCard = card;
          array_bring_to_front(i, this.cards);
          consoleLog("CG: Dragging card:", this.draggingCard);
          if (card.originZone.name.startsWith("deck") || card.originZone.name.startsWith("waste")) break;
          //consoleLog("CG: Equality", this.draggingCard.originZone.cards === this.draggingCard.originZone.cards);
          //consoleLog("CG: Card in originZone.cards?", this.draggingCard.originZone.cards.some(c => c.id === this.draggingCard.id));
          if (this.draggingCard.originZone.cards.includes(this.draggingCard)) {
            //consoleLog("CG: Remove Dragging Card from", this.draggingCard.originZone.name);
            array_remove(this.draggingCard, this.draggingCard.originZone.cards);
          }
        }
        break;
      }
    }
  }

  mouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.updateHovered(mouseX, mouseY);
    if (false && this.draggingStack) {
      this.draggingStack.forEach((card, i) => {
        card.x = mouseX - this.offsetX;
        card.y = mouseY - this.offsetY + i * 30; // stagger vertical spacing
      });
      this.render();
    } else {
      super.mouseMove(e);
    }
  }

   mouseUp(e) {
    console.log("Card Game Mouse Up !!!!");
    if (false && this.draggingStack) {
      const rect = this.canvas.getBoundingClientRect();
      for (let zone of game.zones) {
        if (zone.containsPoint(rect.left - this.offsetX, rect.top - this.offsetY) &&
            zone.canAcceptStack && zone.canAcceptStack(this.draggingStack)) {
          zone.acceptStack(this.draggingStack);
          this.draggingStack = null;
          this.render();
          return;
        }
      }
      // Snap back if rejected
      if (this.draggingStack[0].originZone) {
        this.draggingStack.forEach(card => {
          this.draggingStack[0].originZone.snapCard(card);
        });
      }

      this.draggingStack = null;
      this.render();
    } else if (this.draggingCard) {
      let snapped = false;
      for (let zone of this.zones) {
        //consoleLog("Contains:", zone.contains(this.draggingCard), zone.canAccept(this.draggingCard), zone);
        if (zone.contains(this.draggingCard) && zone.canAccept(this.draggingCard)) {
          consoleLog("Accepting:", zone.contains(this.draggingCard), zone.canAccept(this.draggingCard), zone);
          zone.snapCard(this.draggingCard);
          //consoleLog("Cards length:", this.cards.length, this.deck.cards.length);
          snapped = true;
          break;
        }
      }
      if (!snapped) {
        // move back
        this.draggingCard.x = this.draggingCard.originZone.x;
        this.draggingCard.y = this.draggingCard.originZone.y + this.draggingCard.originZone.cards.length * this.draggingCard.originZone.stagger;
        this.draggingCard.originZone.add(this.draggingCard);
        consoleLog("Card Not Snapped!");
      }
      this.draggingCard.dragging = false;
      this.draggingCard = null;
      this.render();
    }
  }

  /*
  mouseUp(e) {
    if (this.draggingStack) {
      const rect = this.canvas.getBoundingClientRect();
      for (let zone of game.zones) {
        if (zone.containsPoint(rect.left - this.offsetX, rect.top - this.offsetY) &&
            zone.canAcceptStack && zone.canAcceptStack(this.draggingStack)) {
          zone.acceptStack(this.draggingStack);
          this.draggingStack = null;
          this.render();
          return;
        }
      }
      // Snap back if rejected
      if (this.draggingStack[0].originZone) {
        this.draggingStack.forEach(card => {
          this.draggingStack[0].originZone.snapCard(card);
        });
      }

      this.draggingStack = null;
      this.render();
    } else {
      super.mouseUp(e);
    }
  }
  */

  updateHovered(mouseX, mouseY) {
    this.hoveredCard = null;
    this.hoveredZone = null;

    // Start from top-most card
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.containsPoint && card.containsPoint(mouseX, mouseY)) {
        this.hoveredCard = card;
        //consoleLog("1 Update hover card", card);
        break;
      }
    }

    for (let zone of game.zones) {
      if (zone.containsPoint && zone.containsPoint(mouseX, mouseY)) {
        //consoleLog("Update hover zone", zone);
        this.hoveredZone = zone;
      }
      for (let i = zone.cards.length - 1; i >= 0; i--) {
        const card = zone.cards[i];
        if (card.containsPoint && card.containsPoint(mouseX, mouseY)) {
          this.hoveredCard = card;
          //consoleLog("2 Update hover card", card);
          break;
        }
      }
    }
    this.render();
  }


  drawDebugOverlay(ctx) {
    ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
    let lineh = 20, y_margin = 10, y_pad = 10, x_pad = 10;
    let rw = 280, rh = 180;
    let rx = canvas.width - 290, ry = canvas.height - rh - y_margin;
    ctx.fillRect(rx, ry, rw, rh);

    let x = canvas.width - (rw - x_pad); // x start line
    let y = canvas.height - (rh - y_pad); // y start line

    const hover = this.hoveredCard;
    const zone = this.hoveredZone;
    let active = false;
    //consoleLog("Hover", hover, zone);
    for (let card of this.cards) {
      if (card === this.hoveredCard) {
        active = true;
      }
    }

    const lines = [
      `Active: ${active ? true : false}`,
      `Coords: ${this.draggingCard ? `${this.draggingCard.x} ${this.draggingCard.y}` : hover ? `${hover?.x} ${hover?.y}` : '0 0'}`,
      `File Name: ${this.draggingCard ? this.draggingCard.name : hover?.name ?? 'none'}`,
      `Game Cards: ${this.cards.length}`,
      `Deck Size: ${this.deck.cards.length} cards`,
      `Zone: ${zone?.name ?? 'game'} - ${zone?.cards.length ?? this.cards.length}`,
      `Origin: ${this.draggingCard?.originZone?.name ?? hover?.originZone?.name ?? 'game'} - ${this.draggingCard?.originZone?.cards.length ?? hover?.originZone?.cards.length}`,
      `Undo Stack: ${this.undoStack.length}`,
    ];

    ctx.font = '24px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(`${this.draggingCard ? this.draggingCard.emoji : hover?.emoji ?? 'none'}`,x,y);
    y += lineh;
    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    for (let line of lines) {
      ctx.fillText(line, x, y);
      y += lineh;
    }
  }

}
class Deck {
  constructor(cardWidth, cardHeight) {
    consoleLog("New Deck:", cardWidth, cardHeight);
    this.suits = ['diamond', 'heart', 'spade', 'club'];
    //this.values = Array.from({ length: 13 }, (_, i) => i + 1);
    this.values = Array.from({ length: 13 }, (_, i) => i + 2); // 2 through 14
    this.cards = [];
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.total = this.suits.length * this.values.length;
    //this.init();
  }
  
  async init() {
    this.cards.length = 0;
    this.imagesLoaded = false;
    this.loaded = 0;
    //this.back = this.loadCardBack('playing-card-back-design-vector-31-2707375575.jpg');
    //this.back = this.loadCardBack('carys-rohan-anor-nm-final-3793438428.jpg'); // ^^^
    this.back = await this.loadCardBackAsync('c9e561d61fc50771ece1255125f7fb1a-2709866711.jpg'); // *****
    //this.back = this.loadCardBack('8cxrbGE6i-3320164298.jpg');
    await this.loadAllCardsAsync();
  }
  
  getCardBack() {
    //consoleLog("Get Card Back:", this.cardWidth, this.cardHeight);
    return this.back;
  }
  
  loadCardBack(fileName, callback) {
    consoleLog("Load Card Back:", this.cardWidth, this.cardHeight);
    const card = new Card(this, 'backs/' + fileName, null, null, this.cardWidth, this.cardHeight);
    card.loadImage(() => {
      this.loaded++;
      if (this.loaded === this.total + 1) {
        this.imagesLoaded = true;
        if (callback) callback();
      }
    });
    return card;
  }
  
  loadAllCards(callback) {
    for (let suit of this.suits) {
      for (let value of this.values) {
        const name = `${suit}_${value}`;
        const card = new Card(this, name, suit, value === 14 ? 1 : value, this.cardWidth, this.cardHeight);
        card.loadPNG(() => {
          //consoleLog("Push Card:", card);
          this.cards.push(card);
          this.loaded++;
          if (this.loaded === this.total + 1) {
            this.imagesLoaded = true;
            if (callback) callback();
          }
        });
      }
    }
  }
  
  async loadCardBackAsync(fileName) {
    consoleLog("Load Card Back:", this.cardWidth, this.cardHeight);
    const card = new Card(this, 'backs/' + fileName, null, null, this.cardWidth, this.cardHeight);
    await card.loadImageAsync();
    this.loaded++;
    if (this.loaded === this.total + 1) {
      this.imagesLoaded = true;
    }
    return card;
  }
  
  async loadAllCardsAsync() {
    for (let suit of this.suits) {
      for (let value of this.values) {
        const name = `${suit}_${value}`;
        const card = new Card(this, name, suit, value === 14 ? 1 : value, this.cardWidth, this.cardHeight);
        await card.loadPNGAsync();
        //consoleLog("Push Card:", card);
        this.cards.push(card);
        this.loaded++;
        if (this.loaded === this.total + 1) {
          this.imagesLoaded = true;
        }
      }
    }
  }
  
  shuffle() {
    // Fisher-Yates
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // swap
    }
  }

  drawCard() {
    if (!this.imagesLoaded || this.cards.length === 0) return null;
    return this.cards.splice(this.cards.length - 1, 1)[0];
  }
  
  drawRandomCard() {
    if (!this.imagesLoaded || this.cards.length === 0) return null;
    const index = Math.floor(Math.random() * this.cards.length);
    return this.cards.splice(index, 1)[0];
  }
}

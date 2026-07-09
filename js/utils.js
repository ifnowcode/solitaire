let debugoverlay = false;
let tracedebug = true;

if (tracedebug) console.log("Loading Utilities ♠️ ♥️ ♦️ ♣️");

const suitEmojis = {
  spade: "♠️",
  heart: "♥️",
  diamond: "♦️",
  club: "♣️"
};

const suitValues = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};


function getSuitNameByEmoji(emoji) {
  for (let [key, value] of Object.entries(suitEmojis)) {
    if (value === emoji) return key;
  }
  return null; // if not found
}

const emojiToSuit = Object.fromEntries(
  Object.entries(suitEmojis).map(([key, val]) => [val, key])
);

const suitToEmoji = Object.fromEntries(
  Object.entries(suitEmojis).map(([key, val]) => [key, val])
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function array_remove(item, array) {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function array_bring_to_front(index, array) {
  array.push(array.splice(index, 1)[0]);
}

/*
function consoleLog(...args) {
  console.log(...args);
}

function consoleWarn(...args) {
  console.warn(...args);
}

function consoleError(...args) {
  console.error(...args);
}
*/
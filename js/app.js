const cardData = [
  {id: 1, image: './assets/images/card-1.webp', label: "0 == '0'"},
  {id: 2, image: './assets/images/card-2.webp', label: '[] == ![]'},
  {id: 3, image: './assets/images/card-3.webp', label: 'NaN === NaN'},
  {id: 4, image: './assets/images/card-4.webp', label: 'typeof null'},
  {id: 5, image: './assets/images/card-5.webp', label: 'true + false'},
  {id: 6, image: './assets/images/card-6.webp', label: '[] + {}'},
  {id: 7, image: './assets/images/card-7.webp', label: "9 + '1'"},
  {id: 8, image: './assets/images/card-8.webp', label: 'null == undefined'},
];

const cardBackImage = './assets/images/card-back.webp';
const leaderboardStorageKey = 'memoryGameLeaderboard';

let firstCard = null;
let secondCard = null;
let movesCount = 0;
let matchedPairs = 0;
let isBoardLocked = false;
let isGameFinished = false;
let mismatchTimeout = null;

function createDeck() {
  return [...cardData, ...cardData].map((card, index) => ({
    ...card,
    instanceId: index,
  }));
}

function shuffleDeck(deck) {
  const shuffledDeck = [...deck];

  for (let i = shuffledDeck.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledDeck[i], shuffledDeck[randomIndex]] = [
      shuffledDeck[randomIndex],
      shuffledDeck[i],
    ];
  }

  return shuffledDeck;
}

function createCard(cardDataItem) {
  const card = document.createElement('button');
  card.classList.add('card');
  card.type = 'button';
  card.dataset.cardId = cardDataItem.id;
  card.dataset.instanceId = cardDataItem.instanceId;
  card.setAttribute('aria-label', `Memory card: ${cardDataItem.label}`);

  const cardInner = document.createElement('span');
  cardInner.classList.add('card__inner');

  const cardFront = document.createElement('span');
  cardFront.classList.add('card__face', 'card__front');

  const frontImage = document.createElement('img');
  frontImage.src = cardBackImage;
  frontImage.alt = '';

  const cardBack = document.createElement('span');
  cardBack.classList.add('card__face', 'card__back');

  const backImage = document.createElement('img');
  backImage.src = cardDataItem.image;
  backImage.alt = cardDataItem.label;

  cardFront.append(frontImage);
  cardBack.append(backImage);

  cardInner.append(cardFront, cardBack);
  card.append(cardInner);
  card.addEventListener('click', handleCardClick);
  return card;
}

const app = document.createElement('div');
app.classList.add('app');

const header = document.createElement('header');
header.classList.add('header');

const title = document.createElement('h1');
title.classList.add('header__title');
title.textContent = 'Memory Game';

const controls = document.createElement('div');
controls.classList.add('header__controls');

const newGameButton = document.createElement('button');
newGameButton.classList.add('button');
newGameButton.type = 'button';
newGameButton.textContent = 'New Game';
newGameButton.addEventListener('click', startNewGame);

const leaderboardButton = document.createElement('button');
leaderboardButton.classList.add('button');
leaderboardButton.type = 'button';
leaderboardButton.textContent = 'Leaderboard';

leaderboardButton.addEventListener('click', openLeaderboard);

controls.append(newGameButton, leaderboardButton);
header.append(title, controls);

const main = document.createElement('main');
main.classList.add('main');

const stats = document.createElement('div');
stats.classList.add('stats');

const moves = document.createElement('p');
moves.classList.add('stats__item');
moves.textContent = 'Moves: 0';

const pairs = document.createElement('p');
pairs.classList.add('stats__item');
pairs.textContent = 'Pairs: 0 / 8';

stats.append(moves, pairs);

function updateCounters() {
  moves.textContent = `Moves: ${movesCount}`;
  pairs.textContent = `Pairs: ${matchedPairs} / 8`;
}

const board = document.createElement('div');
board.classList.add('game-board');

function renderCards(deck) {
  deck.forEach((cardDataItem) => {
    const card = createCard(cardDataItem);
    board.append(card);
  });
}

function flipCard(card) {
  card.classList.add('card--flipped');
}

function unflipCard(card) {
  card.classList.remove('card--flipped');
}

function resetSelection() {
  firstCard = null;
  secondCard = null;
}

function handleMatch() {
  firstCard.classList.add('card--matched');
  secondCard.classList.add('card--matched');

  matchedPairs += 1;
  updateCounters();
  resetSelection();

  if (matchedPairs === 8) {
    finishGame();
  }
}

function handleMismatch() {
  isBoardLocked = true;

  const firstCardToClose = firstCard;
  const secondCardToClose = secondCard;

  mismatchTimeout = setTimeout(() => {
    unflipCard(firstCardToClose);
    unflipCard(secondCardToClose);

    resetSelection();
    isBoardLocked = false;
    mismatchTimeout = null;
  }, 1000);
}

function checkForMatch() {
  const isMatch = firstCard.dataset.cardId === secondCard.dataset.cardId;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleCardClick(event) {
  const card = event.currentTarget;

  if (
    isBoardLocked ||
    isGameFinished ||
    card === firstCard ||
    card.classList.contains('card--matched')
  ) {
    return;
  }

  flipCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  movesCount += 1;
  updateCounters();

  checkForMatch();
}

function startNewGame() {
  closeModal();
  if (mismatchTimeout !== null) {
    clearTimeout(mismatchTimeout);
    mismatchTimeout = null;
  }

  firstCard = null;
  secondCard = null;
  movesCount = 0;
  matchedPairs = 0;
  isBoardLocked = false;
  isGameFinished = false;

  updateCounters();

  board.replaceChildren();

  const deck = shuffleDeck(createDeck());
  renderCards(deck);
}

function getResults() {
  const storedResults = localStorage.getItem(leaderboardStorageKey);

  if (!storedResults) {
    return [];
  }

  return JSON.parse(storedResults);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function saveResult() {
  const now = new Date();

  const result = {
    moves: movesCount,
    date: formatDate(now),
    timestamp: now.getTime(),
  };

  const results = getResults();

  results.push(result);

  results.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }

    return a.timestamp - b.timestamp;
  });

  const topResults = results.slice(0, 10);

  localStorage.setItem(
    leaderboardStorageKey,
    JSON.stringify(topResults)
  );
}

function createLeaderboardContent() {
  const content = document.createElement('div');

  const title = document.createElement('h2');
  title.classList.add('modal__title');
  title.textContent = 'Leaderboard';

  const results = getResults();

  content.append(title);

  if (results.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.classList.add('modal__text');
    emptyMessage.textContent = 'No results yet';

    content.append(emptyMessage);
  } else {
    const leaderboard = document.createElement('div');
    leaderboard.classList.add('leaderboard');

    const header = document.createElement('div');
    header.classList.add('leaderboard__row', 'leaderboard__header');

    const placeHeader = document.createElement('span');
    placeHeader.textContent = '#';

    const movesHeader = document.createElement('span');
    movesHeader.textContent = 'Moves';

    const dateHeader = document.createElement('span');
    dateHeader.textContent = 'Date';

    header.append(placeHeader, movesHeader, dateHeader);
    leaderboard.append(header);

    results.forEach((result, index) => {
      const row = document.createElement('div');
      row.classList.add('leaderboard__row');

      const place = document.createElement('span');
      place.textContent = String(index + 1);

      const movesValue = document.createElement('span');
      movesValue.textContent = String(result.moves);

      const date = document.createElement('span');
      date.textContent = result.date;

      row.append(place, movesValue, date);
      leaderboard.append(row);
    });

    content.append(leaderboard);
  }

  const actions = document.createElement('div');
  actions.classList.add('modal__actions');

  const closeButton = document.createElement('button');
  closeButton.classList.add('button');
  closeButton.type = 'button';
  closeButton.textContent = 'Close';

  closeButton.addEventListener('click', closeModal);

  actions.append(closeButton);
  content.append(actions);

  return content;
}

function openLeaderboard() {
  const leaderboardContent = createLeaderboardContent();
  openModal(leaderboardContent);
}

main.append(stats, board);
app.append(header, main);

document.body.prepend(app);

startNewGame();

function closeModal() {
  const modalOverlay = document.querySelector('.modal-overlay');

  if (!modalOverlay) {
    return;
  }

  modalOverlay.remove();

  app.inert = false;
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleModalKeydown);
}

function handleModalKeydown(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

function openModal(content) {
  closeModal();

  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');

  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.append(content);
  modalOverlay.append(modal);

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  document.body.append(modalOverlay);

  app.inert = true;
  document.body.classList.add('modal-open');

  document.addEventListener('keydown', handleModalKeydown);

  const firstButton = modal.querySelector('button');

  if (firstButton) {
    firstButton.focus();
  }
}

function createVictoryContent() {
  const content = document.createElement('div');

  const title = document.createElement('h2');
  title.classList.add('modal__title');
  title.textContent = 'You Win!';

  const text = document.createElement('p');
  text.classList.add('modal__text');
  text.textContent = `Moves: ${movesCount}`;

  const actions = document.createElement('div');
  actions.classList.add('modal__actions');

  const newGameModalButton = document.createElement('button');
  newGameModalButton.classList.add('button');
  newGameModalButton.type = 'button';
  newGameModalButton.textContent = 'New Game';

  const closeButton = document.createElement('button');
  closeButton.classList.add('button');
  closeButton.type = 'button';
  closeButton.textContent = 'Close';

  newGameModalButton.addEventListener('click', startNewGame);

  closeButton.addEventListener('click', closeModal);

  actions.append(newGameModalButton, closeButton);
  content.append(title, text, actions);

  return content;
}

function finishGame() {
  isGameFinished = true;

  saveResult();

  const victoryContent = createVictoryContent();
  openModal(victoryContent);
}
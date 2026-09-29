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

const leaderboardButton = document.createElement('button');
leaderboardButton.classList.add('button');
leaderboardButton.type = 'button';
leaderboardButton.textContent = 'Leaderboard';

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

const board = document.createElement('div');
board.classList.add('game-board');

main.append(stats, board);
app.append(header, main);

document.body.prepend(app);
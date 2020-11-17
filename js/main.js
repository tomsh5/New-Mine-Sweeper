const FLOOR = 'FLOOR';
const MINE = 'MINE';
const FLAG = 'FLAG';

const MINE_IMG = '💣';
const FLAG_IMG = '🚩';
const HAERT_IMG = '❤️';
const NO_LIVE = '<h2>No More Lives!</h2>';
const GAME_OVER = '<h2>Game Over!</h2>';

var gStopWatch;
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    minePlaced: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    minesMarked: 0,
    lives: 3
}

function initGame() {
    timerOff();
    gBoard = buildBoard();
    gGame.isOn = true;
    gGame.minePlaced = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.minesMarked = 0;
    gGame.lives = 3;
    renderBoard(gBoard);
    document.querySelector('.smile').innerHTML = '😀';
}

function levelPick(level) {
    switch (level) {
        case 1:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 2:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 3:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    initGame()
}


function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                type: FLOOR
            }
            board[i][j] = cell;
        }
    }

    return board;
}


function renderBoard(board) {

    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })
            if (currCell.type === FLOOR) cellClass += ' floor';
            strHTML += '<td class="cell ' + cellClass +
                '" onclick="cellClicked(this' + ',' + i + ',' + j + ')"';
            strHTML += 'oncontextmenu="rightCellClicked(this' + ',' + i + ',' + j + ')">'

            strHTML += '</td>';
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.querySelector('ul').innerHTML = '<ui1>' + HAERT_IMG + '</ui1>' + '<ui2>' + HAERT_IMG + '</ui2>' + '<ui3>' + HAERT_IMG + '</ui3>';
}

function placeMines(board, elCell, i, j) {
    var mines = [];

    for (var i = 0; i < gLevel.MINES; i++) {
        var location = getRandomMineLocation(gLevel.SIZE);

        if (location.i === i && location.j === j) {
            location = getRandomMineLocation(gLevel.SIZE);
        }
        mines[i] = location;
    }
    for (var i = 0; i < mines.length; i++) {
        board[mines[i].i][mines[i].j].isMine = true
    }

    for (i = 0; i < board.length; i++) {
        for (j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            cell.minesAroundCount = setMinesNegsCount(board, i, j);
        }
    }
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell.isMine) minesCount++
        }
    }
    return minesCount;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;

    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        timerOn();
    }
    if (!gGame.minePlaced) {
        placeMines(gBoard, elCell, i, j);
        gGame.minePlaced = true;
    }
    var cell = gBoard[i][j];

    if (cell.isMarked) return;
    if (cell.isShown) return;
    if (cell.isMine && gGame.lives === 3) {
        gGame.lives--;
        document.querySelector('ul ui3').innerHTML = '';
        elCell.innerHTML = MINE_IMG;
        setTimeout(function () { elCell.innerHTML = '' }, 1000);
    }
    else if (cell.isMine && gGame.lives === 2) {
        gGame.lives--;
        document.querySelector('ul ui2').innerHTML = '';
        elCell.innerHTML = MINE_IMG;
        setTimeout(function () { elCell.innerHTML = '' }, 1000);
    }
    else if (cell.isMine && gGame.lives === 1) {
        gGame.lives--;
        document.querySelector('ul').innerHTML = NO_LIVE;
        elCell.innerHTML = MINE_IMG;
        setTimeout(function () { elCell.innerHTML = '' }, 1000);
    }
    else if (cell.isMine && gGame.lives === 0) {
        document.querySelector('ul').innerHTML = GAME_OVER;
        elCell.innerHTML = MINE_IMG;
        gameOver(cell);
    }


    if (!cell.isMine && !cell.isMarked) {
        cell.isShown = true;
        gGame.shownCount++;
        elCell.innerHTML = '<img src="img/' + cell.minesAroundCount + '.png" />';
    }

    if (cell.minesAroundCount === 0) {
        for (var idxI = i - 1; idxI <= i + 1; idxI++) {
            if (idxI < 0 || idxI > gBoard.length - 1) continue
            for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
                if (idxJ < 0 || idxJ > gBoard[0].length - 1) continue
                if (idxI === i && idxJ === j) continue

                var currCell = gBoard[idxI][idxJ];
                var currCellLoc = { i: idxI, j: idxJ };
                if (!currCell.isShown) {
                    currCell.isShown = true;
                    gGame.shownCount++;
                }
                renderCell(currCellLoc, '<img src="img/' + currCell.minesAroundCount + '.png" />');
            }
        }
    }
    checkIfPlayerWon();
}

function rightCellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        timerOn();
    }
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    gGame.markedCount++

    if (!cell.isMarked) cell.isMarked = true;
    else if (cell.isMarked) cell.isMarked = false;

    if (cell.isMarked) {
        elCell.innerHTML = FLAG_IMG;
    }
    else elCell.innerHTML = '';

    if (cell.isMarked && cell.isMine) {
        gGame.minesMarked++;
    }
    else if (!cell.isMarked && cell.isMine) {
        gGame.minesMarked--;
    }
    checkIfPlayerWon();
}

function getRandomMineLocation(boardSize) {
    var location = {};
    var i = getRandomInt(0, boardSize);
    var j = getRandomInt(0, boardSize);

    location.i = i;
    location.j = j;

    return location;
}
function timerOn() {
    secsPassed = 0;
    gStopWatch = setInterval(function () {
        secsPassed++
        var elTimer = document.querySelector('h3 span');
        elTimer.innerText = secsPassed;
    }, 1000);
}
function timerOff() {
    clearInterval(gStopWatch);
    secsPassed = 0;
    var elTimer = document.querySelector('h3 span');
    elTimer.innerText = secsPassed;
}

function gameOver(elCell) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            var currCellLoc = { i: i, j: j };
            if (cell.isMine & cell !== elCell) {
                renderCell(currCellLoc, MINE_IMG);
            }
            console.log('You Lose!')
            clearInterval(gStopWatch);
            gGame.isOn = false;
            document.querySelector('.smile').innerHTML = '🤯';
        }
    }
}

function checkIfPlayerWon() {
    if (gGame.minesMarked === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        console.log('Player Won!');
        gGame.isOn = false;
        clearInterval(gStopWatch)
        document.querySelector('.smile').innerHTML = '😎';
    }
}
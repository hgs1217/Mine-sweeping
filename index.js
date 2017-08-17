
const ROW = 30,
    COL = 40,
    WIDTH = 30,
    HEIGHT = 30,
    MINES = 300,
    DIR_ARRAY = [-COL-1, -COL, -COL+1, -1, 1, COL-1, COL, COL+1],
    RECT_COLOR = ['#dddddd', '#0099dd', '#00dd00', '#8800ff', '#dddd00', '#dd9900', '#dd0000', '#880000', '#006600', '#000000']

let canvas,
    content,
    timer,
    mineBoard,
    rects = [],
    nums = Array.apply(null, Array(ROW*COL)).map(() => { return 0 }),
    rectStatus = Array.apply(null, Array(ROW*COL)).map(() => { return 0 }),
    isFirst = true,
    isGameOver = false,
    currentTime = 0,
    remain = MINES

function randInt(m, n) {
    let d = n - m,
        x = Math.random() * (d + 1)
    return Math.floor(x + m)
}

function init() {
    canvas = document.getElementById('canvas')
    content = document.getElementById('content')
    timer = document.getElementById('timer')
    mineBoard = document.getElementById('remain')

    document.oncontextmenu = function () {
        event.returnValue = false
    }

    initRect()
    createMine()

    setInterval(function () {
        if (!isGameOver) {
            currentTime++
            timer.innerText = currentTime
        }
    }, 1000)
    mineBoard.innerText = remain
}

function onClick(e) {
    let x = e.pageX,
        y = e.pageY,
        i
    if (!isGameOver && x < COL * WIDTH && y < ROW * HEIGHT) {
        i = Math.floor(y / HEIGHT) * COL + Math.floor(x / WIDTH)
        if (isFirst) {
            isFirst = false
            while (nums[i] === 9) {
                rects = []
                nums = Array.apply(null, Array(ROW*COL)).map(() => { return 0 })
                initRect()
                createMine()
            }
        }
        if (rectStatus[i] >= 0) {
            if (rectStatus[i] === 1) {
                remain++
                mineBoard.innerText = remain
            }
            rectStatus[i] = -1
            if (nums[i] === 0) {
                showBlank(i)
                return
            } else if (nums[i] <= 8) {
                rects[i].innerText = nums[i]
            } else {
                rects[i].innerText = '×'
                isGameOver = true
                gameOver()
            }
            rects[i].style.backgroundColor = RECT_COLOR[nums[i]]
            rects[i].style.color = '#ffffff'
        }
    }
}

function onRightClick(e) {
    let x = e.pageX,
        y = e.pageY,
        i,
        index
    if (!isGameOver && x < COL * WIDTH && y < ROW * HEIGHT && remain >= 0) {
        i = Math.floor(y / HEIGHT) * COL + Math.floor(x / WIDTH)
        if (rectStatus[i] >= 0) {
            rectStatus[i] = (rectStatus[i] + 1) % 3
            switch (rectStatus[i]) {
                case 0: rects[i].innerText = ''
                        rects[i].style.backgroundColor = '#aaaaaa'
                        rects[i].style.color = '#ffffff'
                        break
                case 1: rects[i].innerText = '!'
                        rects[i].style.backgroundColor = '#444444'
                        rects[i].style.color = '#ff0000'
                        remain--
                        mineBoard.innerText = remain
                        examineWin()
                        break
                case 2: rects[i].innerText = '?'
                        rects[i].style.backgroundColor = '#444444'
                        rects[i].style.color = '#00ffff'
                        remain++
                        mineBoard.innerText = remain
                        break
            }
        } else {
            let cnt = 0,
                dealList = [],
                tmp
            for (let j=0; j<DIR_ARRAY.length; ++j) {
                if (!judgeLegalLoc(i, DIR_ARRAY[j])) {
                    continue
                }
                index = i + DIR_ARRAY[j]
                if (rectStatus[index] === 1) {
                    cnt++
                } else if (rectStatus[index] >= 0) {
                    dealList.push(index)
                }
            }
            if (cnt === nums[i]) {
                for (let j=0; j<dealList.length; ++j) {
                    tmp = dealList[j]
                    rectStatus[tmp] = -1
                    if (nums[tmp] === 0) {
                        showBlank(tmp)
                        continue
                    } else if (nums[tmp] <= 8) {
                        rects[tmp].innerText = nums[tmp]
                    } else {
                        rects[tmp].innerText = '×'
                        isGameOver = true
                        gameOver()
                    }
                    rects[tmp].style.backgroundColor = RECT_COLOR[nums[tmp]]
                    rects[tmp].style.color = '#ffffff'
                }
            }
        }
    }
}

function initRect() {
    for (let row = 0; row < ROW; ++row) {
        for (let col = 0; col < COL; ++col) {
            let rect = document.createElement('div')
            rect.className = 'rect'
            rect.id = row*COL+col
            rect.style.left = (col * WIDTH) + 'px'
            rect.style.top = (row * HEIGHT) + 'px'
            rects.push(rect)
            canvas.appendChild(rect)
        }
    }
}

function judgeLegalLoc(index, dir) {
    let row = Math.floor(index / COL),
        col = Math.floor(index % COL)
    switch (dir) {
        case -COL-1:    return row > 0 && col > 0
        case -COL:      return row > 0
        case -COL+1:    return row > 0 && col < COL - 1
        case -1:        return col > 0
        case 1:         return col < COL - 1
        case COL-1:     return col > 0 && row < ROW - 1
        case COL:       return row < ROW - 1
        case COL+1:     return row < ROW - 1 && col < COL - 1
    }
    return false
}

function createMine() {
    let cleanList = Array.apply(null, Array(ROW*COL)).map((item, i) => { return i }),
        index,
        cnt
    for (let i=0; i<MINES; ++i) {
        index = randInt(0, cleanList.length-1)
        nums[cleanList[index]] = 9
        cleanList.splice(index, 1)
    }
    for (let i=0; i<cleanList.length; ++i) {
        cnt = 0
        for (let j=0; j<DIR_ARRAY.length; ++j) {
            if (!judgeLegalLoc(cleanList[i], DIR_ARRAY[j])) {
                continue
            }
            index = cleanList[i] + DIR_ARRAY[j]
            if (index >= 0 && index < ROW*COL && nums[index] === 9) {
                cnt++
            }
        }
        nums[cleanList[i]] = cnt
    }
}

function showBlank(index) {
    let nextList = [],
        zeroList = [index],
        completeList = [],
        tmp
    while (zeroList.length > 0) {
        for (let i=0; i<zeroList.length; ++i) {
            completeList.push(zeroList[i])
            for (let j=0; j<DIR_ARRAY.length; ++j) {
                if (!judgeLegalLoc(zeroList[i], DIR_ARRAY[j])) {
                    continue
                }
                tmp = zeroList[i] + DIR_ARRAY[j]
                if ($.inArray(tmp, zeroList) + $.inArray(tmp, completeList) + $.inArray(tmp, nextList) === -3) {
                    if (nums[tmp] === 0) {
                        nextList.push(tmp)
                    } else {
                        completeList.push(tmp)
                    }
                }
            }
        }
        zeroList = nextList.concat()
        nextList = []
    }
    for (let i=0; i<completeList.length; ++i) {
        tmp = completeList[i]
        if (nums[tmp] === 0) {
            rects[tmp].innerText = ''
        } else {
            rects[tmp].innerText = nums[tmp]
        }
        rects[tmp].style.backgroundColor = RECT_COLOR[nums[tmp]]
        rectStatus[tmp] = -1
    }
}

function examineWin() {
    for (let i=0; i<nums.length; ++i) {
        if (nums[i] === 9 && rectStatus[i] !== 1) {
            return
        }
    }
    isGameOver = true
    setTimeout(function() {
        content.innerText = 'YOU WIN'
        content.style.opacity = 1
        for (let i=0; i<nums.length; ++i) {
            if (rectStatus[i] === 0 || rectStatus[i] === 2) {
                rectStatus[i] = -1
                rects[i].innerText = nums[i]
                rects[i].style.backgroundColor = RECT_COLOR[nums[i]]
                rects[i].style.color = '#ffffff'
            }
        }
    }, 50)
}

function gameOver() {
    setTimeout(function() {
        content.innerText = 'GAME OVER'
        content.style.opacity = 1
    }, 50)
}

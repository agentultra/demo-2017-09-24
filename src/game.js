const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, sw = 480
, sh = 720
, pi = Math.PI
, ballStates = {
    GRABBED: 0,
    BOUNCING: 1
}
, gameStates = {
    RUNNING: 0,
    GAMEOVER: 1
}
, blkW = 40
, blkH = 10
, buttons = {
    Left: 0,
    Right: 0,
    Space: 0
}

const copyLevel = lvl => Array.from(lvl.map(r => r.slice(0)))

let then = Date.now()
, state = gameStates.RUNNING
, br = 12.0 // b - ball
, bx = (sw / 2)
, by = 670
, bxV = -2
, byV = -8
, bState = ballStates.GRABBED
, px = sw / 2 // p - paddle
, py = 700
, pw = 60
, ph = 20
, pA = 0.895
, pD = 0.155
, pS = 1.3
, pV = 0
, tries = 3
, level = 1
, blocks = {
    1: [[1, 1, 1, 1, 1, 1]],
    2: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
}
, currentLevel = copyLevel(blocks[level])

canvas.width = sw
canvas.height = sh

document.addEventListener('keydown', ev => {
    switch (ev.key) {
    case 'ArrowLeft':
        if (!buttons.Left) buttons.Left = 1
        break;
    case 'ArrowRight':
        if (!buttons.Right) buttons.Right = 1
        break;
    case ' ':
        if (!buttons.Space) buttons.Space = 1
        break;
    }
    console.log(buttons)
})

document.addEventListener('keyup', ev => {
    switch (ev.key) {
    case 'ArrowLeft':
        if (buttons.Left) buttons.Left = 0
        break;
    case 'ArrowRight':
        if (buttons.Right) buttons.Right = 0
        break;
    case ' ':
        if (buttons.Space) buttons.Space = 0
    }
})

const btn = name => name in buttons && buttons[name]

const clamp = (v, min, max) =>
      v < min ? min : v > max ? max : v

const flatten = arr =>
      arr.reduce((acc, cur) => acc.concat(cur), [])

const updatePaddle = () => {
    if (bState === ballStates.GRABBED && btn('Space'))
        bState = ballStates.BOUNCING
    if (btn('Left')) pV = -1 * pA
    if (btn('Right')) pV = 1 * pA
    const pVel = Math.abs(pV) / pS
    ,     pXspd = Math.sign(pV)
    pV -= pD * pV * pVel
    if (pXspd != Math.sign(pV)) pV = 0
    px = px + (pS * pV)
    if (px - (pw / 2) < 0 || px + (pw / 2) > sw) pV = -pV
    px += pS * pV
}

const ballIntersects = (x, y, w, h) => {
    const closestX = clamp(bx, x - w / 2, x + w / 2)
    , closestY = clamp(by, y - h / 2, y + h / 2)
    , distX = bx - closestX
    , distY = by - closestY
    , dist = (distX * distX) + (distY * distY)

    if (dist < (br * br)) {
        return [distX, distY]
    } else {
        return [null, null]
    }
}

const doBlockCollisions = () => {
    for (let j = 0; j < currentLevel.length; j++) {
        for (let i = 0; i < currentLevel[j].length; i++) {
            if (currentLevel[j][i] != 0) {
                const blkX = 20 + (i * blkW) * 1.4
                ,     blkY = (j * blkH) + 20
                const [distX, distY] = ballIntersects(blkX, blkY, blkW, blkH)
                if (distX != null && distY != null) {
                    if (distY < distX) {
                        byV = -byV
                    } else {
                        bxV = -bxV
                    }
                    currentLevel[j][i] = 0
                }
            }
        }
    }
}

const checkForLevelComplete = () => {
    const complete = flatten(currentLevel)
          .reduce((sum, v) => sum + v, 0)
    if (complete === 0) {
        level++;
        currentLevel = copyLevel(blocks[level])
    }
}

const update = dt => {
    if (state === gameStates.GAMEOVER && btn('Space')) {
        tries = 3
        bState = ballStates.GRABBED
        px = sw / 2
        bx = px
        by = py - (ph + 8)
        state = gameStates.RUNNING
    }
    updatePaddle()
    if (bState === ballStates.BOUNCING) {
        if ((by - br / 2) + byV <= 0) {
            byV = -byV
        } else if ((by + br / 2) + byV >= sh) {
            if (tries > 0) {
                byV = -byV
                tries -= 1
                bState = ballStates.GRABBED
                px = sw / 2
                bx = px
                by = (py - ph / 2) - 8
            } else {
                tries = 'GAME OVER'
                state = gameStates.GAMEOVER
                level = 1
                currentLevel = copyLevel(blocks[level])
            }
        }
        if ((bx - bx / 2) + bxV <= 0) {
            bxV = -bxV
        } else if ((bx + br / 2) + bxV >= sw) {
            bxV = -bxV
        }

        doBlockCollisions()
        checkForLevelComplete()

        const [distX, distY] = ballIntersects(px, py, pw, ph)

        if (distX != null && distY != null) {
            if (distY < distX) {
                byV = -byV
            } else {
                bxV = -bxV
            }
        }
        by += byV
        bx += bxV
    } else {
        by = py - (ph + 8)
        bx = px
    }
}

const render = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, sw, sh)

    for (let j = 0; j < currentLevel.length; j++) {
        for (let i = 0; i < currentLevel[j].length; i++) {
            if (currentLevel[j][i] != 0) {
                stage.fillStyle = 'purple'
                stage.fillRect(20 + (i * blkW) * 1.4,
                               (j * blkH) + 20,
                               blkW, blkH)
            }
        }
    }

    stage.fillStyle = 'white'
    stage.strokeStyle = 'white'
    stage.beginPath()
    stage.arc(bx, by, br, 0, 2 * pi, false)
    stage.fill()
    stage.closePath()
    stage.stroke()

    stage.fillStyle = 'green'
    stage.fillRect(px - pw / 2, py - ph / 2, pw, ph)

    stage.fillStyle = 'white'
    stage.fillText(`Tries: ${tries}`, 10, sh - 20)
}

const loop = () => {
    const now = Date.now()
    , dt = now - then
    update(dt / 1000)
    render()
    then = now
    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)

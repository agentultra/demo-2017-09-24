const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, sw = 480
, sh = 800
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

let then = Date.now()
, state = gameStates.RUNNING
, br = 12.0 // b - ball
, bx = (sw / 2)
, by = 750
, bxV = -2
, byV = -8
, bState = ballStates.GRABBED
, px = sw / 2 // p - paddle
, py = 780
, pw = 60
, ph = 20
, pV = 8
, tries = 3
, level = 1
, blocks = {
    1: [[0, 0, 0, 0, 0, 0 ]]
}

canvas.width = sw
canvas.height = sh

window.onkeypress = ev => {
    if (state === gameStates.RUNNING) {
        switch (ev.key) {
        case 'ArrowLeft':
            px -= pV
            break;
        case 'ArrowRight':
            px += pV
            break;
        case ' ':
            if (bState === ballStates.GRABBED) {
                bState = ballStates.BOUNCING
            }
            break;
        }
    } else {
        switch (ev.key) {
        case ' ':
            tries = 3
            bState = ballStates.GRABBED
            px = sw / 2
            bx = px
            by = py - (ph + 8)
            state = gameStates.RUNNING
        }
    }
}

const clamp = (v, min, max) =>
      v < min ? min : v > max ? max : v

const update = dt => {
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
            }
        }
        if ((bx - bx / 2) + bxV <= 0) {
            bxV = -bxV
        } else if ((bx + br / 2) + bxV >= sw) {
            bxV = -bxV
        }

        const closestX = clamp(bx, px - pw / 2, px + pw / 2)
        , closestY = clamp(by, py - ph / 2, py + ph / 2)
        , distX = bx - closestX
        , distY = by - closestY
        , dist = (distX * distX) + (distY * distY)

        if (dist < (br * br)) {
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

    stage.fillStyle = 'purple'
    for (let j = 0; j < blocks[level].length; j++) {
        for (let i = 0; i < blocks[level][j].length; i++) {
            stage.fillStyle = 'purple'
            stage.fillRect(20 + (i * blkW) * 1.4,
                           (j * blkH) + 20,
                           blkW, blkH)
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

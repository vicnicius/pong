function Game () {
  let waiting = false
  const gameEl = document.getElementById('game')
  const {top, bottom} = gameEl.getBoundingClientRect()
  const eng = Engine(gameEl.getContext('2d'))
  const state = {
    player1y: 25,
    player1x: 775,
    score1: 0,
    player2y: 25,
    player2x: 0,
    score2: 0,
    ball: [65, 65],
    speed: [5, Math.PI / 6] // Speed, Angle (rad)
  }
  const ballDx = () => state.ball[0] + state.speed[0] * Math.cos(state.speed[1])
  const ballDy = () => state.ball[1] + state.speed[0] * Math.sin(state.speed[1])

  function reset () {
    state.player1y = 25
    state.player2y = 25
    state.ball = [65, 65]
    waiting = true
    setTimeout(() => {
      waiting = false
      state.speed = [8, Math.PI / 6]
      draw()
    }, 3000)
  }

  function newSpeed () {
    const y = state.ball[1]
    const x = state.ball[0]
    let resultSpeed = state.speed[0]
    let resultAngle = state.speed[1]

    // If the ball colides with the game top-bottom screen limit, revert it's angle
    if (y >= bottom || y <= top) {
      resultAngle = -state.speed[1]
    }

    // If the ball colides with player x-axis (The one on the right)
    if (x + 15 >= state.player1x) {
      // Check if it colides with the players y-axis also
      if (state.player1y <= y && y <= state.player1y + 100) {
        // resultAngle = eng.reflectionAngle(state.player1y, y, state.speed[1])
        resultAngle = Math.PI - resultAngle
        resultSpeed = state.speed[0] + .5
      } else {
        state.score1 = state.score1 + 1
        reset()
      }
    }

    if (x <= state.player2x + 25) {
      if (state.player2y <= y && y <= state.player2y + 100) {
        // resultAngle = eng.reflectionAngle(state.player2y, y, state.speed[1])
        resultAngle = Math.PI - resultAngle
        resultSpeed = state.speed[0] + .5
      } else {
        state.score2 = state.score2 + 1
        reset()
      }
    }

    return [resultSpeed, resultAngle]
  }

  let player1Last, player2Last
  function drawPlayers () {
    eng.drawPlayer(state.player1x, state.player1y, player1Last)
    eng.drawPlayer(state.player2x, state.player2y, player2Last)
    player1Last = [state.player1x, state.player1y, 25, 100]
    player2Last = [state.player2x, state.player2y, 25, 100]
  }

  function moveAI () {
    const proposedDy = state.speed[0] * Math.sin(state.speed[1])
    const player2dy = Math.abs(proposedDy) > 8
                        ? proposedDy > 0 ? 8 : -8
                        : proposedDy

    return state.player2y + player2dy
  }

  function draw () {
    if (!waiting) {
      state.ball = [ballDx(), ballDy()]
      state.speed = newSpeed()
      state.player2y = moveAI()
      eng.clear()
      eng.drawBall(state.ball, state.speed[1])
      drawPlayers()
      eng.drawScores(state.score1, state.score2)
      eng.drawNet()
      window.requestAnimationFrame(draw)
    }
  }
  eng.setEvents(gameEl, top, bottom, state)

  draw()
}

function Engine (ctx) {
  function blurGradient (x, y, w, h, dx) {
    const x0 = x
    const y0 = y - h / 2
    const x1 = x + w
    const y1 = y0
    const linearGradient = ctx.createLinearGradient(x0, y0, x1, y1)
    const solid = 'rgba(0, 0, 0, 1)'
    const transparent = 'rgba(0, 0, 0, 0)'
    const color1 = dx < 0 ? solid : transparent
    const color2 = dx >= 0 ? solid : transparent

    linearGradient.addColorStop(0, color1)
    linearGradient.addColorStop(dx < 0 ? 0.6 : 0.4, solid)
    linearGradient.addColorStop(1, color2)

    return linearGradient
  }

  let lastBallBlur
  function drawBallBlur (x0, y0, dx, dy, angle) {
    const w = 15 + Math.abs(dx) + Math.abs(Math.cos(angle) * dy)
    const h = 15 + Math.abs(dy)
    const x = dx < 0 ? x0 + dx : x0
    const y = dy < 0 ? y0 + dy : y0
    ctx.fillStyle = blurGradient(x, y, w, 15, dx)

    if (lastBallBlur) {
      ctx.clearRect.apply(ctx, lastBallBlur)
    }

    lastBallBlur = [x, y, w, h]
    // ctx.translate(x0 + w / 2, y0 + h / 2)
    // ctx.rotate(angle)
    ctx.fillRect(x, y, w, 15)
  }

  function drawPlayer (x, y, cache) {
    if (cache) {
      ctx.clearRect.apply(ctx, cache)
    }
    return ctx.fillRect(x, y, 25, 100)
  }

  function drawNet () {
    ctx.save()
    ctx.fillStyle = '#111'
    for (let y = 10; y <= 800; y = y + 40) {
      ctx.fillRect(390, y, 20, 20)
    }
    ctx.restore()
  }

  let prevBallPosition
  function drawBall ([x1, y1], angle) {
    let [x0, y0, dx, dy] = [0, 0, 0, 0]
    if (prevBallPosition) {
      [x0, y0] = prevBallPosition
      dx = x1 - x0
      dy = y1 - y0
      // ctx.save()
      // if (dx === 0 && dy === 0) {
      ctx.fillRect(x1, y1, 15, 15)
      // } else {
        // drawBallBlur(x0, y0, dx, dy, angle)
      // }
      // ctx.restore()
    }

    //ClearRect issue
    prevBallPosition = [x1 - 5, y1 - 5, 15 + 10, 15 + 10]
  }

  function reflectionAngle (playerY, ballY, ballCurrentAngle) {
    const angleCoeficient = (Math.PI / 4) * (50 / (ballY - playerY + 50))
    const angleCoeficientReduced = (Math.PI) * (50 / (ballY - playerY + 50))
    const softMargin = (ballY >= playerY + 25) && (ballY <= playerY + 75)
    let resultAngle = 0

    if (softMargin) {
      resultAngle = ballCurrentAngle + Math.abs(angleCoeficientReduced)
    } else {
      resultAngle = ballCurrentAngle + Math.abs(angleCoeficient)
    }

    return ballCurrentAngle < 0 ? -resultAngle : resultAngle
  }

  function drawScores (score1, score2) {
    ctx.font = 'bold 54px sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillText(score1, 320, 50)
    ctx.fillText(score2, 450, 50)
  }

  function clear () {
    ctx.clearRect(0, 0, 800, 600)
  }

  function handleMousemove (state, top, bottom) {
    return (event) => {
      const yPos = event.clientY
      state.player1y = yPos - top - 50
    }
  }

  function setEvents (element, top, bottom, state) {
    element.onmousemove = handleMousemove(state, top, bottom)
  }

  return {
    setEvents: setEvents,
    reflectionAngle: reflectionAngle,
    drawScores: drawScores,
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    drawNet: drawNet,
    clear: clear
  }
}

Game()

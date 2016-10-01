function Game () {
  const gameEl = document.getElementById('game')
  const eng = Engine(gameEl.getContext('2d'))
  const state = {
    player1y: 25,
    player1x: 775,
    score1: 0,
    player2y: 25,
    player2x: 0,
    score2: 0,
    ball: [65, 65],
    speed: [10, 0] // Speed, Angle (rad)
  }
  const ballDx = () => state.ball[0] + state.speed[0] * Math.cos(state.speed[1])
  const ballDy = () => state.ball[1] + state.speed[0] * Math.sin(state.speed[1])
  const newSpeed = () => {
    const y = state.ball[1]
    const x = state.ball[0]
    let resultSpeed = state.speed[0]
    let resultAngle = state.speed[1]

    // If the ball colides with the game top-bottom screen limit
    if (y >= 800 || y <= 0) {
      resultAngle = state.speed[1] - Math.PI
    }

    // If the ball colides with one of the players
    if (x + 15 >= state.player1x || x <= state.player2x + 25) {
      resultSpeed = state.speed[0] * -1
      drawPlayers()
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

  function draw () {
    state.ball = [ballDx(), ballDy()]
    state.speed = newSpeed()
    eng.drawBall(state.ball)
    drawPlayers()
    eng.drawScores(state.score1, state.score2)
    eng.drawNet()
    window.requestAnimationFrame(draw)
  }
  eng.setEvents(gameEl, state)
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
  function drawBallBlur (x0, y0, dx, dy) {
    const w = 15 + Math.abs(dx)
    const h = 15 + Math.abs(dy)
    const x = dx < 0 ? x0 + dx : x0
    const y = dy < 0 ? y0 + dy : y0
    ctx.fillStyle = blurGradient(x, y, w, h, dx)

    if (lastBallBlur) {
      ctx.clearRect.apply(ctx, lastBallBlur)
    }

    lastBallBlur = [x, y, w, h]
    ctx.fillRect(x, y, w, h)
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
  function drawBall ([x1, y1]) {
    if (prevBallPosition) {
      const [x0, y0] = prevBallPosition
      const [dx, dy] = [x1 - x0, y1 - y0]
      ctx.clearRect.apply(ctx, prevBallPosition)
      ctx.save()
      if (dx === 0 && dy === 0) {
        ctx.fillRect(x1, y1, 15, 15)
      } else {
        drawBallBlur(x0, y0, dx, dy)
      }
      ctx.restore()
    }

    prevBallPosition = [x1, y1, 15, 15]
  }

  function drawScores (score1, score2) {
    ctx.font = 'bold 54px sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillText(score1, 320, 50)
    ctx.fillText(score2, 450, 50)
  }

  function handleMousemove (state, top, bottom) {
    return (event) => {
      const yPos = event.clientY
      state.player1y = yPos - top - 50
    }
  }

  function setEvents (element, state) {
    const {top, bottom} = element.getBoundingClientRect()
    element.onmousemove = handleMousemove(state, top, bottom)
  }

  return {
    setEvents: setEvents,
    drawScores: drawScores,
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    drawNet: drawNet
  }
}

Game()

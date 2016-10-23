function Game () {
  const getRandom = (min, max) => Math.random() * (max - min) + min
  const gameEl = document.getElementById('game')
  const {top, bottom} = gameEl.getBoundingClientRect()
  const eng = Engine(gameEl.getContext('2d'))
  const state = {
    level: 5,
    waiting: false,
    player1y: 25,
    player1x: 775,
    score1: 0,
    player2y: 25,
    player2x: 0,
    score2: 0,
    ball: [65, 65],
    speed: [5, getRandom(-Math.PI / 6, Math.PI / 6)] // Speed, Angle (rad)
  }
  const ballDx = () => state.ball[0] + state.speed[0] * Math.cos(state.speed[1])
  const ballDy = () => state.ball[1] + state.speed[0] * Math.sin(state.speed[1])

  function reset () {
    eng.resetEngine()
    state.player1y = 25
    state.player2y = 25
    state.ball = [65, 65]
    eng.drawBall(state.ball, state.speed[1], state.speed[0])
    drawPlayers(state)
    eng.drawScores(state.score1, state.score2)
    eng.drawNet()
    state.waiting = true
    setTimeout(() => {
      state.waiting = false
    }, 3000)
  }

  function newSpeed (state) {
    let resultSpeed = state.speed[0]
    let resultAngle = state.speed[1]
    const y = state.ball[1]
    const x = state.ball[0]

    function getNewAngle (playerY, ballY, fromLeft) {
      const isOnAngleLimit = (proposed) => {
        const angle = proposed * (180 / Math.PI)
        const reducedAngle = (toReduceAngle) => {
          let limited = toReduceAngle
          if (limited > 180) {
            limited = toReduceAngle - 360
          } else if (limited < -180) {
            limited = toReduceAngle + 360
          }

          return limited > 180 || limited < -180 ? reducedAngle(limited) : limited
        }
        const condition = reducedAngle(angle) > -90 && reducedAngle(angle) < 90
        return fromLeft ? !condition : condition
      }
      const randomFactor = getRandom(-Math.PI / 8, Math.PI / 8)
      let proposed

      if (playerY + 25 <= ballY && ballY <= playerY + 50) {
        proposed = Math.PI - resultAngle
      } else {
        proposed = Math.PI - resultAngle - (ballY / (playerY + 50) * randomFactor)
      }

      return isOnAngleLimit(proposed) ? proposed : getNewAngle(playerY, ballY, fromLeft)
    }

    // If the ball colides with the game top-bottom screen limit, revert it's angle
    if (y + 15 >= 600 || y <= top) {
      resultAngle = -state.speed[1]
    }

    // If the ball colides with player x-axis (The one on the right)
    if (x + 15 >= state.player1x) {
      // Check if it colides with the players y-axis also
      if (state.player1y - 15 < y && y < state.player1y + 100) {
        // resultAngle = eng.reflectionAngle(state.player1y, y, state.speed[1])
        resultAngle = getNewAngle(state.player1y, y, true)
        resultSpeed = state.speed[0] + 0.5
      } else {
        state.score1 = state.score1 + 1
        reset(state)
      }
    }

    if (x <= state.player2x + 25) {
      if (state.player2y - 15 < y && y < state.player2y + 100) {
        // resultAngle = eng.reflectionAngle(state.player2y, y, state.speed[1])
        resultAngle = getNewAngle(state.player2y, y, false)
        resultSpeed = state.speed[0] + 0.5
      } else {
        state.score2 = state.score2 + 1
        reset()
      }
    }

    return [resultSpeed, resultAngle]
  }

  let player1Last, player2Last
  function drawPlayers (state) {
    eng.drawPlayer(state.player1x, state.player1y, player1Last)
    eng.drawPlayer(state.player2x, state.player2y, player2Last)
    player1Last = [state.player1x, state.player1y, 25, 100]
    player2Last = [state.player2x, state.player2y, 25, 100]
  }

  function moveAI (state) {
    const proposedDy = state.ball[1] - (state.player2y + 42.5)
    const player2dy = Math.abs(proposedDy) > state.level
                        ? proposedDy > 0 ? state.level : -state.level
                        : proposedDy
    const pos = state.player2y + player2dy

    return pos < 0 ? 0 : pos >= (600 - 100) ? 500 : pos
  }

  function draw () {
    if (!state.waiting) {
      state.ball = [ballDx(), ballDy()]
      state.speed = newSpeed(state)
      state.player2y = moveAI(state)
      eng.clear()
      eng.drawBall(state.ball, state.speed[1], state.speed[0])
      drawPlayers(state)
      eng.drawScores(state.score1, state.score2)
      eng.drawNet()
    } else {
      state.speed = [5, getRandom(-Math.PI / 6, Math.PI / 6)]
    }
    window.requestAnimationFrame(draw)
  }
  eng.setEvents(gameEl, top, bottom, state)

  draw()
}

function Engine (ctx) {
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

  function drawBluriedBall (position, idx) {
    if (position) {
      ctx.save()
      ctx.fillStyle = `rgba(0, 0, 0, .05)`
      ctx.fillRect(position[0], position[1], 15, 15)
      ctx.restore()
    }
  }

  let prevBallPositions = []
  function drawBall ([x1, y1], angle, speed) {
    prevBallPositions.map(drawBluriedBall)
    ctx.fillRect(x1, y1, 15, 15)
    prevBallPositions.push([x1, y1])
    if (prevBallPositions.length >= speed - 9.5) {
      prevBallPositions.shift()
    }
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

  function resetEngine () {
    prevBallPositions = []
  }

  function clear () {
    ctx.clearRect(0, 0, 800, 600)
  }

  function handleMousemove (state, top, bottom) {
    return (event) => {
      const pos = event.clientY - top - 50
      // Do not allow player to cross game canvas borders
      state.player1y = pos < 0 ? 0 : pos >= (600 - 100) ? 500 : pos
    }
  }

  function setEvents (element, top, bottom, state) {
    element.onmousemove = handleMousemove(state, top, bottom)
    element.onclick = () => {
      if (state.waiting) {
        state.waiting = false
      }
    }
  }

  return {
    setEvents: setEvents,
    resetEngine: resetEngine,
    reflectionAngle: reflectionAngle,
    drawScores: drawScores,
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    drawNet: drawNet,
    clear: clear
  }
}

Game()

function Game () {
  const eng = Engine(document.getElementById('game').getContext('2d'))
  const state = {
    player1y: 25,
    player1x: 775,
    score1: 0,
    player2y: 25,
    player2x: 0,
    score2: 0,
    ball: [65, 65],
    speed: [9, 0] //Speed, Angle (rad)
  };
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
    if (x + 15 >= state.player1x || x  <= state.player2x + 25) {
      resultSpeed = state.speed[0] * -1
      drawPlayers()
    }

    return [resultSpeed, resultAngle]
  }
  let cache = {
    player1: [0, 0],
    player2: [0, 0]
  };

  eng.drawScores(state.score1, state.score2)
  eng.drawNet()

  function drawPlayers () {
      eng.drawPlayer(state.player1x, state.player1y)
      eng.drawPlayer(state.player2x, state.player2y)
  }

  function draw () {
    state.ball = [ballDx(), ballDy()]
    state.speed = newSpeed()
    eng.drawBall(state.ball)
    drawPlayers()
    window.requestAnimationFrame(draw)
  }
  // window.setInterval(draw, 1000 / 60)

  window.requestAnimationFrame(draw)
}

function Engine (ctx) {
  function drawPlayer (x, y) {
    return ctx.fillRect(x, y, 25, 100)
  }

  function drawNetTile (y) {
    ctx.fillRect(390, y, 20, 20)
  }

  function drawTiles () {
    for (let i = 10; i <= 800; i = i + 40) {
      drawNetTile(i)
    }
  }

  function drawNet () {
    return drawTiles()
  }

  let prevBallPosition
  function drawBall ([x1, y1]) {
    if (prevBallPosition) {
      const [x0, y0] = prevBallPosition
      ctx.clearRect(x0, y0, 15, 15)
    }
    ctx.fillRect(x1, y1, 15, 15)
    prevBallPosition = [x1, y1]
  }

  function drawScores (score1, score2) {
    ctx.font = 'bold 54px sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillText(score1, 320, 50)
    ctx.fillText(score2, 450, 50)
  }

  return {
    drawScores: drawScores,
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    drawNet: drawNet
  }
}

Game()

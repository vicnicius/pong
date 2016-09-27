function Game () {
  const eng = Engine(document.getElementById('game').getContext('2d'))
  const state = {
    player1: 25,
    score1: 0,
    player2: 25,
    score2: 0,
    ball: [65, 65]
  }
  eng.drawPlayer(775, state.player1)
  eng.drawPlayer(0, state.player2)
  eng.drawScores(state.score1, state.score2)
  eng.drawNet()

  function draw () {
    state.ball = [state.ball[0] + 8, state.ball[1]]
    eng.drawBall(state.ball)
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

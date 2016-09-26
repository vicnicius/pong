const Path2D = window.Path2D

function Game () {
  const canvas = document.getElementById('game')
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d')
    const eng = Engine(ctx)

    eng.drawPlayer(0, 25)
    eng.drawPlayer(775, 25)
    eng.drawBall(65, 65)
    eng.drawNet()
    eng.drawScores()
  }
}

function Engine (ctx) {
  const drawPlayer = (x, y) => new Path2D(ctx.fillRect(x, y, 25, 100))
  const drawNetTile = (y) => ctx.fillRect(390, y, 20, 20)
  const drawBall = (x, y) => new Path2D(ctx.fillRect(x, y, 15, 15))
  const drawNet = () => new Path2D(drawTiles())
  const drawTiles = () => {
    for (let i = 10; i <= 800; i = i + 40) {
      drawNetTile(i)
    }
  }
  const drawScores = () => {
    ctx.font = 'bold 54px sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillText('0', 320, 50)
    ctx.fillText('0', 450, 50)
  }

  return {
    drawScores: drawScores,
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    drawNet: drawNet
  }
}

Game()

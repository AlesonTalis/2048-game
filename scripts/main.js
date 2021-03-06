import Grid from './Grid.js'
import Tile from './Tile.js'

const gridArea = document.getElementById("grid-area");

const grid = new Grid(gridArea);

grid.randomEmptyCell().tile = new Tile(gridArea)
grid.randomEmptyCell().tile = new Tile(gridArea)

setupInput()

function setupInput()
{
  window.addEventListener("keydown", handleInput, {once: true})
}

async function handleInput(e)
{
  switch(e.key)
  {
    case "ArrowUp":
      if (!canMoveUp())
      {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown())
      {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft())
      {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight())
      {
        setupInput()
        return
      }
      await moveRight() 
      break
    default:
      setupInput()
      break
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gridArea)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight())
  {
    newTile.waitForTransition(true).then(() => {
      alert("You lose")
    })
    return
  }
  
  setupInput()
}

function moveUp()
{
  return slideTiles(grid.cellsByColumn)
}
function moveDown()
{
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}
function moveLeft()
{
  return slideTiles(grid.cellsByRow)
}
function moveRight()
{
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells)
{
  return Promise.all(
    cells.flatMap(group => {
      const promises = []
      for(let i = 1; i < group.length; i++)
      {
        const cell = group[i]

        if (cell.tile == null) continue

        let lastValidCell
        for(let j = i - 1; j >= 0; j--)
        {
          // celula alvo para mover
          const moveToCell = group[j]

          // se o bloco pode aceitar o bloco atual, para por aqui
          if (!moveToCell.canAccept(cell.tile)) break

          // define a celula que poder?? mover como a celula atual
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) 
        {
          promises.push(cell.tile.waitForTransition())
          // se for poss??vel mover o bloco, executa:
          if (lastValidCell.tile != null)
          {
            // se o bloco n??o for vazio, junta os blocos
            lastValidCell.mergeTile = cell.tile
          }
          else
          {
            // caso contrario, adiciona o bloco
            lastValidCell.tile = cell.tile
          }

          // define o bloco atual como nulo
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp()
{
  return canMove(grid.cellsByColumn)
}

function canMoveDown()
{
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft()
{
  return canMove(grid.cellsByRow)
}

function canMoveRight()
{
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells)
{
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}
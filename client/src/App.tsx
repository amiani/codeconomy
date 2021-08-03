import React, { useEffect } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "./world"

function App() {
  useEffect(() => {
    let running = true
    const step = (t: number) => {
      if (running) {
        world.step()
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)

    return () => {
      running = false
    }
  }, [])

  return (
    <div className="App">
      <Game />
    </div>
  )
}

export default App
;(window as any).world = world

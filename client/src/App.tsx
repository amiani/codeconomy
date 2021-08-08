import React, { useEffect } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "./world"
import Editor from './Editor'

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
      <Editor />
    </div>
    )
  }

  ;(window as any).world = world
export default App

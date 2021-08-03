import React, { forwardRef, useEffect, useRef } from "react"
import "./App.css"
import { Canvas, CanvasRef } from "./Canvas"
import Game from './Game'
import { useWindowSize } from "./hooks/useWindowSize"
import { world } from "./world"
import * as PIXI from 'pixi.js'

const Render = forwardRef<CanvasRef>(function Render(props, ref) {
  const size = useWindowSize()
  return <Canvas {...size} ref={ref} />
})

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

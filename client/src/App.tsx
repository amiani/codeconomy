import React, { useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "./world"
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

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

const [code, setCode] = useState(`function add(a, b) {
  return a + b;
}
`)

const [hidden, setHidden] = useState(false)

  return (
    <div className="App">
      <Game />
      <div
        className="editor"
        style={{ position: 'absolute', top: 0, left: 0 }}>
        {!hidden && <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => highlight(code, languages.js, 'js')}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", Consolas, Menlo, monospace',
            fontSize: 12,
            background: 'white',
          }}
        />}
        <button onClick={e => { setHidden(!hidden) }}>{hidden ? 'Show' : 'Hide'}</button>
        {!hidden && <button onClick={e => console.log()}>Upload</button>}
      </div>
    </div>
    )
  }

  ;(window as any).world = world
export default App

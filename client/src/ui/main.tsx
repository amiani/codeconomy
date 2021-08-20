import React from "react"
import ReactDOM from "react-dom"

import "./index.css"
import App from "./App"
import { states, actions } from './state'

ReactDOM.render(
  <React.StrictMode>
    <App states={states} actions={actions} />
  </React.StrictMode>,
  document.getElementById("root"),
)

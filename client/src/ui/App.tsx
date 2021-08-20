import React, { useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "../world"
import firebase from 'firebase/app';
import 'firebase/auth'
import testScript from '../../../scripts/testScript'
import { uploadTopic } from '../topics'
import Overlay from './Overlay'
import { Feedback } from './Feedback';
import Scoreboard from './Scoreboard';
import * as store from './store'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4laElkOwByaMHNAChLkvu825S4k6o4ec",
  authDomain: "codeconomy0.firebaseapp.com",
  projectId: "codeconomy0",
  storageBucket: "codeconomy0.appspot.com",
  messagingSenderId: "817410369808",
  appId: "1:817410369808:web:039a84fe15916b6c33dd95",
  measurementId: "G-1Q85KBS613"
};
firebase.initializeApp(firebaseConfig);

const scores = [{ name: 'amiani', points: 50000 }]

interface AppProps {
  states: typeof store.states,
  actions: typeof store.actions,
}

function App({ states, actions }: AppProps) {
  useEffect(() => {
    firebase.auth().signInAnonymously()
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        actions.setToken(await user.getIdToken())
      }
    })
    return () => {}
  }, [])

  const [init, setInit] = useState(false)
  const [state, setState] = useState(states())

  if (!init) {
    setInit(true)
    actions.setCode(localStorage.getItem('code') || testScript)
    states.map(setState)
  }
  
  const upload = () => uploadTopic.push({ code: state.editor.code })

  return (
    <div className="App">
      <Game />
      <Overlay
        state={state}
        actions={actions}
        upload={upload}
      />
      <Scoreboard timer={180} scores={scores} style={scoreboardStyle} />
    </div>
  )
}

const scoreboardStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0',
  top: '0',
  zIndex: 1000
}

;(window as any).world = world
export default App
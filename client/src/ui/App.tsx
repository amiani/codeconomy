import React, { CSSProperties, useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "../world"
import firebase from 'firebase/app';
import 'firebase/auth'
import testScript from '../../../scripts/testScript'
import { uploadTopic } from '../topics'
import Overlay from './components/Overlay'
import CornerScoreboard from './components/CornerScoreboard';
import * as store from './state'
import DebugPanel from './components/DebugPanel';
import Welcome from './components/Welcome'
import { Phase } from '../../../common/types';
import Modal from './components/Modal';
import BigScoreboard from './components/BigScoreboard';
import RightSidebar from './components/RightSidebar';

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

interface AppProps {
  states: typeof store.states,
  actions: typeof store.actions,
}

function App({ states, actions }: AppProps) {
  useEffect(() => {
    firebase.auth().signInAnonymously()
    return () => {}
  }, [])

  const [init, setInit] = useState(false)
  const [state, setState] = useState(states())

  if (!init) {
    setInit(true)
    actions.setCode(localStorage.getItem('code') || testScript)
    states.map(setState)
  }
  
  const closeModal = () => {
    localStorage.setItem('showWelcomeModal', 'false')
    actions.hideWelcomeModal()
  }
  const upload = () => uploadTopic.push({ code: state.ui.editor.code })

  return (
    <div className="App">
      <Game />
      <Overlay
        state={state}
        actions={actions}
        upload={upload}
      />
      <RightSidebar
        gameState={state.game}
        style={styles.rightSidebar}
      />
      {state.game.phase == Phase.end &&
        <Modal>
          <BigScoreboard gameState={state.game} />
        </Modal>
      }
      {state.ui.showWelcomeModal &&
        <Modal onClose={closeModal}><Welcome /></Modal>
      }

      <DebugPanel debugState={state.debug} style={styles.debugPanelStyle} />
    </div>
  )
}

const styles = {
  modalScoreboardStyle: {
  } as CSSProperties,

  debugPanelStyle: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    zIndex: 1000
  } as CSSProperties,

  rightSidebar: {
    position: 'absolute',
    right: '0',
    top: '0',
    zIndex: 1000
  } as CSSProperties,
}


;(window as any).world = world
export default App
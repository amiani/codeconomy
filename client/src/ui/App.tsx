import React, { useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "../world"
import Editor from './Overlay'
import firebase from 'firebase/app';
import 'firebase/auth'
import testScript from '../../../scripts/testScript'
import { uploadTopic } from '../topics'

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

function App(props: any) {
  const [token, setToken] = useState('')
  useEffect(() => {
    firebase.auth().signInAnonymously()
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        setToken(await user.getIdToken())
      }
    })
    return () => {
    }
  }, [])

	const [code, setCode] = useState(localStorage.getItem('code') || testScript)
  const onCodeChanged = (code: string) => {
    setCode(code)
    localStorage.setItem('code', code)
  }
  
  const upload = () => uploadTopic.push({ code })

  return (
    <div className="App">
      <Game />
      <Editor
        code={code}
        setCode={onCodeChanged}
        upload={upload}
      />
    </div>
  )
}

;(window as any).world = world
export default App

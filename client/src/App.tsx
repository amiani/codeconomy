import React, { useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "./world"
import Editor from './Editor'
import firebase from 'firebase/app';
import 'firebase/auth'
import testScript from '../../scripts/testScript'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5lM3rz3fEPakainaLNkMjpa1JuaHiFUw",
  authDomain: "codeconomy.firebaseapp.com",
  projectId: "codeconomy",
  storageBucket: "codeconomy.appspot.com",
  messagingSenderId: "988361932576",
  appId: "1:988361932576:web:769f19869986f8d3c9e145",
  measurementId: "G-HG70D4SBGN"
};
firebase.initializeApp(firebaseConfig);

function App() {
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

  const upload = () => {
    fetch('http://localhost:8000/upload', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(code)
    })
  }

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

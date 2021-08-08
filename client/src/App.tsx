import React, { useEffect, useState } from 'react'
import "./App.css"
import Game from './Game'
import { world } from "./world"
import Editor from './Editor'
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth'
import { useRef } from '@javelin/ecs'
//import * as firebaseui from 'firebaseui'

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

/*
// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  signInOptions: [
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
      console.log(authResult)
      return true
    }
  }
  // We will display Google and Facebook as auth providers.
};
*/

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

  useEffect(() => {
    firebase.auth().signInAnonymously()
    return () => {
    }
  }, [])

	const [code, setCode] = useState(`function add(a, b) {
	return a + b;
	}
	`)

  const upload = () => {
    fetch('http://localhost:8000', {
      method: 'POST',
      headers: {
        'content-type': 'text/plain'
      },
      body: code
    })
  }

  return (
    <div className="App">
      {/*<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />*/}
      <Game />
      <Editor
        code={code}
        setCode={setCode}
        upload={upload}
      />
    </div>
    )
  }

  ;(window as any).world = world
export default App

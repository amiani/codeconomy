import React, { useState}  from 'react'
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import Button from './Button'
import Editor from './Editor'
import { actions } from './state'

interface OverlayProps {
	state: any,
	actions: typeof actions,
	upload: () => void,
}

export default function Overlay({ state, actions, upload }: OverlayProps) {
	const [hidden, setHidden] = useState(false)
	const [mute, setMute] = useState(true)

	const toggleMute = () => {
		Pizzicato.context.resume()
		if (mute) {
			Pizzicato.volume = 1
			setMute(false)
		} else {
			Pizzicato.volume = 0
			setMute(true)
		}
	}

	return (
		<div
			style={{ 
				position: 'absolute',
				top: 0,
				left: 0,
				paddingBottom: 5,
				minWidth: '30vw'
			}}
		>
			<div className='toolbar' style={{ display: 'flex' }}>
				<Button onClick={e => setHidden(!hidden)}>{hidden ? 'Show' : 'Hide'}</Button>
				<Button onClick={upload}>Upload</Button>
				<Button onClick={e => toggleMute()}>{mute ? 'Unmute' : `Mute`}</Button>
				<Button onClick={e => window.open('mailto:amianijohns@gmail.com')}>Feedback</Button>
			</div>
			{!hidden && <Editor code={state.editor.code} setCode={actions.setCode} />}
		</div>
	)
}
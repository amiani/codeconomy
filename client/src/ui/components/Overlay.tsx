import React, { useState}  from 'react'
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import Button from './Button'
import Editor from './Editor'
import { actions } from '../state'
import apiPage from '../../../api.html?url'

interface OverlayProps {
	state: any,
	actions: typeof actions,
	upload: () => void,
}

export default function Overlay({ state, actions, upload }: OverlayProps) {
	const [showEditor, setShowEditor] = useState(true)
	const [mute, setMute] = useState(true)

	const toggleMute = () => {
		Pizzicato.context.resume()
		if (mute) {
			Pizzicato.volume.set(1)
			setMute(false)
		} else {
			Pizzicato.volume.set(0)
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
				<Button 
					style={{ width: '88px' }}
					onClick={e => setShowEditor(!showEditor)}
				>
					{showEditor ? 'Show Editor' : 'Hide Editor'}
				</Button>
				<Button onClick={e => window.open('mailto:ratang@buns.run')}>Feedback</Button>
				<Button onClick={e => toggleMute()}>{mute ? 'Unmute' : `Mute`}</Button>
				<Button><a href={apiPage} target='_blank'>Open API</a></Button>
			</div>
			{!showEditor && <div>
				<Editor code={state.ui.editor.code} setCode={actions.setCode} />
				<Button onClick={upload}>Upload</Button>
			</div>}
		</div>
	)
}
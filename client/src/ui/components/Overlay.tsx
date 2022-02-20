import React, { useState}  from 'react'
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import Button from './Button'
import Editor from './Editor'
import { actions } from '../state'

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
				<Button><a href='api.html' target='_blank'>Docs</a></Button>
			</div>
			{!showEditor && <div>
				<Editor code={state.ui.editor.code} setCode={actions.setCode} />
				<Button onClick={upload}>Upload</Button>
			</div>}
		</div>
	)
}

function dataURItoBlob(dataURI: any) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], {type: mimeString});
  return blob;

}
import React, { useState}  from 'react'
import SimpleEditor from 'react-simple-code-editor'
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import { highlight, languages } from 'prismjs'
import './prism-vsc-dark-plus.css'

interface EditorProps {
	code: string,
	setCode: (code: string) => void,
	upload: () => void
}

export default function Editor({ code, setCode, upload }: EditorProps) {
	const [hidden, setHidden] = useState(false)

	return (
		<div
			style={{ 
				position: 'absolute',
				top: 0,
				left: 0,
				paddingBottom: 5
			}}
		>
			<div className='toolbar' style={{ display: 'flex' }}>
				<button onClick={e => setHidden(!hidden)}>{hidden ? 'Show' : 'Hide'}</button>
				{!hidden && <button onClick={upload}>Upload</button>}
				<button onClick={e => Pizzicato.context.resume()}>Unmute</button>
				<button onClick={e => {}}>Reset</button>
			</div>
			{!hidden &&
				<div
					className='editor-container'
					style={{
						overflow: 'auto',
						flex: 1,
						maxHeight: '95vh',
						maxWidth: '50vw',
					}}
				>
					<SimpleEditor
						value={code}
						onValueChange={setCode}
						preClassName='language-js'
						highlight={code => highlight(code, languages.js, 'js')}
						padding={10}
						tabSize={4}
						style={{
							fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
							fontSize: 12,
						}}
					/>
				</div>
			}
		</div>
	)
}
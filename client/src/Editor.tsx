import React, { useState}  from 'react'
import SimpleEditor from 'react-simple-code-editor'
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import { highlight, languages } from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

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
						highlight={code => highlight(code, languages.js, 'js')}
						padding={10}
						style={{
							fontSize: 12,
							fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
							background: 'white',
							whiteSpace: 'pre',
						}}
					/>
				</div>
			}
		</div>
	)
}
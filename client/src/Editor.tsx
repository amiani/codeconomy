import React, { useState}  from 'react'
import SimpleEditor from 'react-simple-code-editor'
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
			className="editor"
			style={{ position: 'absolute', top: 0, left: 0 }}>
			{!hidden &&
				<SimpleEditor
					value={code}
					onValueChange={setCode}
					highlight={code => highlight(code, languages.js, 'js')}
					padding={10}
					style={{
						fontFamily: '"Fira code", "Fira Mono", Consolas, Menlo, monospace',
						fontSize: 12,
						background: 'white',
					}}
				/>
			}
			<button onClick={e => { setHidden(!hidden) }}>{hidden ? 'Show' : 'Hide'}</button>
			{!hidden && <button onClick={upload}>Upload</button>}
		</div>
	)
}
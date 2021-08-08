import React, { useState}  from 'react'
import SimpleEditor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

export default function Editor() {
	const [code, setCode] = useState(`function add(a, b) {
	return a + b;
	}
	`)

	const [hidden, setHidden] = useState(false)

	return (
		<div
			className="editor"
			style={{ position: 'absolute', top: 0, left: 0 }}>
			{!hidden && <SimpleEditor
			value={code}
			onValueChange={setCode}
			highlight={code => highlight(code, languages.js, 'js')}
			padding={10}
			style={{
				fontFamily: '"Fira code", "Fira Mono", Consolas, Menlo, monospace',
				fontSize: 12,
				background: 'white',
			}}
			/>}
			<button onClick={e => { setHidden(!hidden) }}>{hidden ? 'Show' : 'Hide'}</button>
			{!hidden && <button onClick={e => console.log()}>Upload</button>}
		</div>
	)
}
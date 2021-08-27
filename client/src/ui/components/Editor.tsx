import React from 'react'
import SimpleEditor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import '../prism-vsc-dark-plus.css'

interface EditorProps {
	code: string,
	setCode: (code: string) => void,
}

export default function Editor({ code, setCode }: EditorProps) {
	return (
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
	)
}
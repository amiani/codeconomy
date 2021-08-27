import React, { MouseEventHandler } from 'react'

interface ButtonProps {
	onClick?: MouseEventHandler
	children?: React.ReactNode
	style?: React.CSSProperties
}

export default function Button({ onClick, children, style }: ButtonProps) {
	return (
		<button
			style={{
				...style,
				minWidth: '50px',
			}}
			onClick={onClick}
		>
			{children}
		</button>
	)
}
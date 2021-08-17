import React, { MouseEventHandler } from 'react'

interface ButtonProps {
	onClick?: MouseEventHandler
	children?: React.ReactNode
}

export default function Button({ onClick, children }: ButtonProps) {
	return (
		<button
			style={{
				minWidth: '50px'
			}}
			onClick={onClick}
		>
			{children}
		</button>
	)
}
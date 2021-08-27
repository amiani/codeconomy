import React, { CSSProperties, useRef } from 'react'
import ReactDOM from 'react-dom'

interface WelcomeModalProps {
	onClose: () => void,
}

export default function WelcomeModal({ onClose }: WelcomeModalProps): React.ReactPortal {
	const modal = useRef(document.getElementById('modal') as HTMLDivElement)
	return ReactDOM.createPortal(
		<div style={containerStyle}>
			<div style={closeButtonStyle} onClick={onClose}>X</div>
			Hello
		</div>,
		modal.current
	)
}

const containerStyle: CSSProperties = {
	position: 'absolute',
	top: '200px',
	left: 'calc(50% - 250px)',
	width: '500px',
	minHeight: '200px',
	zIndex: 2,
	maxHeight: 'calc(100% - 200)',
	color: 'rgb(212, 212, 212)',
	backgroundColor: '#1e1e1e',
	opacity: .92,
}

const closeButtonStyle: CSSProperties = {
	position: 'absolute',
	top: '0',
	right: '0',
	width: '15px',
	height: '15px',
	color: 'blue',
	userSelect: 'none',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
	fontSize: '17px',
	fontStyle: 'bold',
	padding: '2px',
}
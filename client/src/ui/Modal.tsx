import React from 'react'
import ReactDOM from 'react-dom'

interface ModalProps {
	children: React.ReactNode
	onClose?: () => void
	style?: React.CSSProperties
}

export default function Modal({ children, onClose }: ModalProps) {
	return ReactDOM.createPortal(
		<div style={modalContainerStyle}>
			{onClose && <div style={closeButtonStyle} onClick={onClose}>X</div>}
			<div style={childrenStyle}>{children}</div>
		</div>,
		document.getElementById('modal') as HTMLDivElement
	)
}

const modalContainerStyle: React.CSSProperties = {
	position: 'absolute',
	top: '150px',
	left: 'calc(50% - 250px)',
	width: '500px',
	minHeight: '200px',
	zIndex: 2,
	maxHeight: 'calc(100% - 200)',
	color: 'rgb(212, 212, 212)',
	backgroundColor: '#1e1e1e',
	opacity: .92,
	padding: '20px',
}

const closeButtonStyle: React.CSSProperties = {
	position: 'absolute',
	top: '0',
	right: '0',
	width: '15px',
	height: '15px',
	color: '#7A3CE5',
	userSelect: 'none',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
	fontSize: '17px',
	fontStyle: 'bold',
	padding: '2px',
}

const childrenStyle: React.CSSProperties = {
}
import React, { CSSProperties, useState } from 'react';

interface CollapsiblePanelProps {
	title: string
	style?: CSSProperties
	children: React.ReactNode
}

export default function CollapsiblePanel(props: CollapsiblePanelProps) {
	const { title, style, children } = props
	const [isOpen, setIsOpen] = useState(true);
	return (
		<div style={style}>
			<div style={styles.container}>
				<div style={styles.header} onClick={()=>setIsOpen(!isOpen)}>
					<div style={styles.arrow} />
					<div style={styles.title}>{title}</div>
				</div>
				{isOpen &&
					<div style={styles.content}>
						{children}
					</div>
				}
			</div>
		</div>
	)
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: '100%',
		border: '1px solid #ccc',
		backgroundColor: '#000',
		opacity: 0.8,
		color: 'rgb(212,212,212)'
	} as CSSProperties,

	header: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		height: '30px',
		borderBottom: '1px solid #ccc',
		cursor: 'pointer',
	} as CSSProperties,

	arrow: {
	} as CSSProperties,

	title: {
		marginLeft: '10px',
		marginTop: '5px',
	} as CSSProperties,

	content: {
	} as CSSProperties,
}
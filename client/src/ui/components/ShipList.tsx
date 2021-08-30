import React, { CSSProperties } from 'react'

interface ShipDesc {
	id: number
}

interface ShipListProps {
	ships: ShipDesc[]
	onSelect: (id: number) => void
	style?: CSSProperties
}

export default function ShipList(props: ShipListProps) {
	const { ships, onSelect, style } = props
	return (
		<div style={style}>
			<div style={styles.container}>
				<ol style={styles.list}>
					{ships.map(ship => (
						<li key={ship.id} style={styles.item}>
							{ship.id}
						</li>
					))}
				</ol>
			</div>
		</div>
	)
}

const styles: { [key: string]: CSSProperties } = {
	container: {
	},
	list: {
		listStyle: 'none',
		padding: 0,
		margin: 0,
	},
	item: {
		cursor: 'pointer',
		padding: '0.5em',
		borderBottom: '1px solid #ccc',
	},
}
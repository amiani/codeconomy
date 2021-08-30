import React, { CSSProperties, useState } from 'react'
import { Phase } from '../../../../common/types'
import { GameState } from '../state'
import CollapsiblePanel from './CollapsiblePanel'
import CornerScoreboard from './CornerScoreboard'


interface RightSidebarProps {
	gameState: GameState
	style: CSSProperties
}

export default function RightSidebar(props: RightSidebarProps) {
	const { gameState, style } = props
	const [showPanels, setShowPanels] = useState(true)
	return (
		<div style={style}>
			<div style={styles.container}>
				{gameState.phase == Phase.run && 
					<CornerScoreboard gameState={gameState} style={styles.scoreboard} />
				}
				{showPanels &&
					<div style={styles.panelContainer}>
						<CollapsiblePanel title='Ships'>
							{/*<ShipList ships={gameState.ships} />*/}
						</CollapsiblePanel>
						<CollapsiblePanel title='Ship Log'>

						</CollapsiblePanel>
					</div>
		}
			</div>
		</div>

	)
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		height: '100%',
	} as CSSProperties,

	scoreboard: {
	} as CSSProperties,

	panelContainer: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: '400px',
	} as CSSProperties,
}
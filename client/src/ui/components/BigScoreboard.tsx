import React, { CSSProperties } from 'react'
import ScoreList from './ScoreList';
import { GameState } from '../state';

interface BigScoreboardProps {
	gameState: GameState
	style?: CSSProperties
}

export default function BigScoreboard({ gameState, style }: BigScoreboardProps) {
	const winner = gameState.scores.sort((a, b) => b.points - a.points)[0]
	return (
		<div style={style}>
			<div style={scoreboardStyle}>
				<div style={{ ...winnerStyle, color: winner.color }}>
					{winner.name} wins!
				</div>
				<ScoreList scores={gameState.scores} itemStyle={itemStyle} />
			</div>
		</div>
	)
}

const scoreboardStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'flex-start'
}

const winnerStyle: CSSProperties = {
	fontSize: '3em',
}

const itemStyle: CSSProperties = {
	fontSize: '1.5em',
	width: '190px',
}
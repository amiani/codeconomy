import React, { CSSProperties } from 'react'
import ScoreList from './ScoreList';
import { GameState } from './state'

interface ScoreboardProps {
	gameState: GameState,
	style: CSSProperties;
}

export default function CornerScoreboard({ gameState, style }: ScoreboardProps) {
	const { scores, timer } = gameState
	const minutes = Math.floor(timer / 60);
	const seconds = Math.round(timer % 60);

	return (
		<div className="scoreboard-container" style={style}>
			<div className="scoreboard" style={scoreboardStyle}>
				<div className="timer" style={timerStyle}>
					<span style={minutesStyle}>{minutes}</span>
					:
					<span style={secondsStyle}>{seconds < 10 ? '0'+seconds : seconds}</span>
				</div>
				<ScoreList scores={scores} itemStyle={itemStyle} />
			</div>
		</div>
	)
}

const scoreboardStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	background: '#000',
	opacity: '60%',
	minWidth: '115px'
}

const timerStyle: CSSProperties = {
	fontSize: '3em',
	color: 'white'
}

const minutesStyle: CSSProperties = {
}

const secondsStyle: CSSProperties = {
}

const itemStyle: CSSProperties = {
	fontSize: '1em',
}
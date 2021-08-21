import React, { CSSProperties } from 'react'
import { GameState } from './state'

interface ScoreboardProps {
	gameState: GameState,
	style: CSSProperties;
}

export default function Scoreboard({ gameState, style }: ScoreboardProps) {
	const { scores, timer } = gameState
	const minutes = Math.floor(timer / 60);
	const seconds = timer % 60;

	return (
		<div className="scoreboard-container" style={style}>
			<div className="scoreboard" style={scoreboardStyle}>
				<div className="timer" style={timerStyle}>
					<span style={minutesStyle}>{minutes}</span>
					:
					<span style={secondsStyle}>{seconds < 10 ? '0'+seconds : seconds}</span>
				</div>
				<ol style={scoreListStyle}>
					{scores
						.sort((a, b) => b.points - a.points)
						.map((score, i) => (
							<li key={i} className="score" style={scoreStyle}>
								<div style={{ ...nameStyle, color: score.color }}>{score.name}</div>
								<div style={pointsStyle}>{score.points}</div>
							</li>
						)
					)}
				</ol>
			</div>
		</div>
	)
}

const scoreboardStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	background: '#000',
	opacity: '60%'
}

const timerStyle: CSSProperties = {
	fontSize: '3em',
	color: 'white'
}

const minutesStyle: CSSProperties = {
}

const secondsStyle: CSSProperties = {
}

const scoreListStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	padding: 5,
	margin: 5,
}

const scoreStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-around',
	alignItems: 'center',
	color: 'white'
}

const nameStyle: CSSProperties = {
	fontSize: '1em',
	fontWeight: 'bold',
	marginRight: '0.5em',
}

const pointsStyle: CSSProperties = {
	fontSize: '1.5em',
}
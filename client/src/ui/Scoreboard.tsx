import React, { CSSProperties } from 'react'

interface Score {
	name: string;
	points: number;
}

interface ScoreboardProps {
	timer: number;
	scores: Array<Score>;
	style: CSSProperties;
}

export default function Scoreboard({ timer, scores, style }: ScoreboardProps) {
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
								<div style={nameStyle}>{score.name}</div>
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
	background: '#fff',
	opacity: '50%'
}

const timerStyle: CSSProperties = {
	fontSize: '3em',
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
}

const nameStyle: CSSProperties = {
	fontSize: '1.5em',
	fontWeight: 'bold',
	marginRight: '0.5em',
}

const pointsStyle: CSSProperties = {
	fontSize: '1.5em',
}
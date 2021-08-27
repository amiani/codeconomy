import React, { CSSProperties } from 'react'
import { Score } from './state';

interface ScoreListProps {
	scores: Score[],
	style?: CSSProperties
	itemStyle?: CSSProperties
}

export default function ScoreList({ scores, style, itemStyle }: ScoreListProps) {
	return (
		<div style={style}>
			<ol style={scoreListStyle}>
				{scores
					.sort((a, b) => b.points - a.points)
					.map((score, i) => (
						<li key={i} className="score" style={itemStyle}>
							<div style={scoreStyle}>
								<div style={{ ...nameStyle, color: score.color }}>{score.name}</div>
								<div style={pointsStyle}>{score.points}</div>
							</div>
						</li>
					)
				)}
			</ol>
		</div>
	)
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
	justifyContent: 'space-between',
	alignItems: 'center',
	color: 'white',
	width: '100%',
}

const nameStyle: CSSProperties = {
	fontWeight: 'bold',
	marginRight: '0.5em',
}

const pointsStyle: CSSProperties = {
	fontSizeAdjust: 1.5
}
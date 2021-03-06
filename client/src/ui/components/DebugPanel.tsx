import React from 'react'
import { DebugState } from "../state"

interface DebugPanelProps {
	debugState: DebugState;
	style?: React.CSSProperties
}

export default function DebugPanel({ debugState, style }: DebugPanelProps) {
	return (
		<div className="debug-panel-container" style={style}>
			<div className="debug-panel" style={debugPanelStyle}>
				<div>{debugState.tick}</div>
				<div style={rateStyle}>{debugState.downloadRate.toFixed(1)}kb/s</div>
			</div>
		</div>
	)
}

const debugPanelStyle: React.CSSProperties = {
	background: '#fff',
	opacity: 0.5
}

const rateStyle: React.CSSProperties = {
}
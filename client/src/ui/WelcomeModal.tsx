import React, { CSSProperties, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

interface WelcomeModalProps {
	onClose: () => void,
}

export default function WelcomeModal({ onClose }: WelcomeModalProps): React.ReactPortal {
	const modal = useRef(document.getElementById('modal') as HTMLDivElement)
	const [currPage, setCurrPage] = useState(0)
	const nextPage = () => setCurrPage(Math.min(currPage + 1, pages.length-1))
	return ReactDOM.createPortal(
		<div style={containerStyle}>
			<div style={closeButtonStyle} onClick={onClose}>X</div>
			{pages[currPage]}
			{currPage < pages.length - 1 &&
				<a style={pageTurnButtonStyle} onClick={nextPage}>Next</a>
			}
		</div>,
		modal.current
	)
}

const pages = [<Intro />, <Rules />, <API />]
function Intro(): JSX.Element {
	return (
		<>
			<h2>Welcome to Space Code!</h2>
			<h3>Prototype 1</h3>
			<p style={introStyle}>
				This is the first prototype of Space Code, an online PvP programming game. <br/>

				In Space Code, you will command a carrier starship capable of building and launching hundreds of fighters, frigates and more.
				Every ship is controlled by code written by you or other players.
			</p>
			<p style={introStyle}>
				Prototype 1 represents only a tiny fraction of what I'm imagining, but I hope you enjoy it! <br />
				Thanks for playing, and I would be very grateful to hear any feedback you have, especially about the api.
			</p>
		</>
	)
}

function Rules() : JSX.Element {
	return (
		<>
			<h4>How to Play</h4>
			<p style={rulesStyle}>
				The rules of prototype 1 are simple:<br/>
				- Each time one of your fighters kills an enemy, you gain a point.<br/>
				- After three minutes whoever has the most points wins.<br/><br/>

				Open the code editor by clicking the Show Editor button in the top left of your screen.
				This is where you write the script that your ships will run. You are free to write any
				valid javascript, but your script's default export must be a function that takes a single
				argument and returns an object.<br/>
				Once you are happy with your script, click the Upload button to send it to your carrier.
				New ships will be launched with your script onboard.
			</p>
		</>
	)
}

function API(): JSX.Element {
	return (
		<>
			<h3>API</h3>
			<p style={apiStyle}>
				Each ship runs its default function at a set interval in its own global context i.e. there is no way
				to communicate between ships (for now).<br/>
				Your default function is passed an Observation and must return a Command.<br/>

				<h4 style={typeStyle}>Observation</h4>
				<div style={indentStyle}>
					Represents the ship's observation of its environment.<br/>
					<h5>Properties</h5>
					self: <span style={typeStyle}>SelfState</span><br/>
					allies: <span style={typeStyle}>ShipObservation[]</span> -- The currently observed allies.<br/>
					enemies: <span style={typeStyle}>ShipObservation[]</span> -- The currently observed enemies.<br/>
				</div>

				<h4 style={typeStyle}>SelfState</h4>
				<div style={indentStyle}>
					Represents the ship's current state.<br/>
					<h5>Properties</h5>
					position: <span style={typeStyle}>Vector</span> -- The ship's current position.<br/>
					velocity: <span style={typeStyle}>Vector</span> -- The ship's current velocity.<br/>
					rotation: <span style={typeStyle}>number</span> -- The ship's current rotation in radians.<br/>
					angularVelocity: <span style={typeStyle}>number</span> -- The ship's current angular velocity.<br/>
				</div>

				<h4 style={typeStyle}>ShipObservation</h4>
				<div style={indentStyle}>
					The data known about another ship.<br/>
					<h5>Properties</h5>
					position: <span style={typeStyle}>Vector</span> -- The ship's current position.<br/>
					rotation: <span style={typeStyle}>number</span> -- The ship's current rotation in radians.<br/>
					health: <span style={typeStyle}>number</span> -- The ship's current health.<br/>
					team: <span style={typeStyle}>number</span> -- The ship's team.<br/>
				</div>

				<h4 style={typeStyle}>Command</h4>
				<div style={indentStyle}>
					The ship's desired action.<br/>
					<h5>Properties</h5>
					throttle: <span style={typeStyle}>number</span> -- How much forward thrust to apply.<br/>
					yaw: <span style={typeStyle}>number</span> -- How much turning force to apply.<br/>
					fire: <span style={typeStyle}>boolean</span> -- Whether to fire the laser or not.<br/>
				</div>

				<h4 style={typeStyle}>Vector</h4>
				<div style={indentStyle}>
					<h5>Properties</h5>
					x: <span style={typeStyle}>number</span><br/>
					y: <span style={typeStyle}>number</span><br/>
				</div>
			</p>
		</>
	)
}

const containerStyle: CSSProperties = {
	position: 'absolute',
	top: '200px',
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

const closeButtonStyle: CSSProperties = {
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

const introStyle: CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.4',
}

const rulesStyle: CSSProperties = {
	...introStyle,
}

const pageTurnButtonStyle: CSSProperties = {
	color: '#7A3CE5',
	cursor: 'pointer',
	fontSize: '17px',
	fontStyle: 'bold',
}

const apiStyle: CSSProperties = {
	...introStyle
}

const indentStyle: CSSProperties = {
	paddingLeft: '20px',
}

const typeStyle: CSSProperties = {
	color: '#559BE1'
}
import React, { CSSProperties, useState } from 'react'

export default function Welcome() {
	const [currPage, setCurrPage] = useState(0)
	const nextPage = () => setCurrPage(Math.min(currPage + 1, pages.length-1))
	return (
		<div style={containerStyle}>
			{pages[currPage]}
			{currPage < pages.length - 1 &&
				<a style={pageTurnButtonStyle} onClick={nextPage}>Next</a>
			}
		</div>
	)
}

const pages = [<Intro />, <Rules />]
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
				Thanks for playing, and I would be very grateful to hear any feedback you have.
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

				Your carrier spawns a fighter every few seconds that is controlled by code that you write.<br/>
				Open the code editor by clicking the Show Editor button in the top left of your screen.
				This is where you write the script that your ships will run. You are free to write any
				valid javascript, but your script's default export must be a function that takes a single
				argument and returns an object.<br/><br/>
				Click the Open API button to see the documentation for the api.<br/>
				Once you are happy with your script, click the Upload button to send it to your carrier.
				New ships will be launched with your script onboard.
			</p>
		</>
	)
}

const containerStyle: CSSProperties = {
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
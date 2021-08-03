interface State {
	dummy: string
}

const action = () => ({
	throttle: 0,
	rotate: 0,
	fire: false
})

export default (state: State) => ({
	state,
	action: action(),
	setThrottle: function(amt: number) { this.action.throttle = amt },
	setRotate: function(amt: number) {this.action.rotate = amt },
	fire: function() { this.action.fire = true },
	clear: function() { this.action = action() },
})
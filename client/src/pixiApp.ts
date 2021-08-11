import * as PIXI from 'pixi.js';
import ship from '../../assets/images/ship1.png'
import smallbluelaser from '../../assets/images/smallbluelaser.png'

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
})

app.loader
    .add('ship', ship)
    .add('smallbluelaser', smallbluelaser)
    .load()

export default app
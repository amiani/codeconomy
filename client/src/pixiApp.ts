import * as PIXI from 'pixi.js';
import ship from '../../assets/images/ship1.png'
import smallbluelaser from '../../assets/images/smallbluelaser.png'
import goldstartile from '../../assets/images/goldstartile.jpg'
import spawn2 from '../../assets/images/spawn2.png'
import { world } from './world';

const runJavelin = () => {
	console.log('starting javelin')
	let running = true
    const step = (t: number) => {
      if (running) {
        world.step()
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
}

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
})

app.loader
    .add('ship', ship)
    .add('smallbluelaser', smallbluelaser)
	.add('goldstartile', goldstartile)
	.add('spawn2', spawn2)
    .load()
	.onComplete.add(runJavelin)

export default app
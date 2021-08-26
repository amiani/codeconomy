import * as PIXI from 'pixi.js';
import ship from '../../assets/images/ship1.png'
import smallbluelaser from '../../assets/images/smallbluelaser.png'
import goldstartile from '../../assets/images/goldstartile.jpg'
import blue_nebula from '../../assets/images/seamless_bgs_1024x1024/Blue Nebula/Blue_Nebula_1_1024x1024.png'
import spawn2 from '../../assets/images/spawn2.png'
import capital1 from '../../assets/images/capital1.png'
import sidewinder from '../../assets/images/sidewinder.png'
import condor from '../../assets/images/condor.png'
import { world } from './world';

function runJavelin() {
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
  resizeTo: window
})

app.loader
    .add('ship', ship)
    .add('smallbluelaser', smallbluelaser)
    .add('goldstartile', goldstartile)
    .add('blue_nebula', blue_nebula)
    .add('spawn2', spawn2)
    .add("capital1", capital1)
    .add("sidewinder", sidewinder)
    .add("condor", condor)
    .load()
	.onComplete.add(runJavelin)

export default app
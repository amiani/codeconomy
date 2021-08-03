import * as PIXI from 'pixi.js';
import ship from '../../assets/images/ship1.png'
const pixiApp = new PIXI.Application()
pixiApp.loader.add('ship', ship).load()
export default pixiApp 
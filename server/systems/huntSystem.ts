import { component, createEffect, createQuery, Entity, toComponent, useInit, useMonitor, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import ivm from 'isolated-vm'

import { playerTopic, shipTopic } from "../topics";
import {
	Countdown,
	Player,
	HuntScore as Score,
	Spawner,
	Allegiance,
	Transform,
	Action,
	Script,
	Isolate,
	Bot,
} from '../components'
import { createBot, createPlayer, createSpawner } from "../factories";
import { MAX_PLAYERS } from "../env";
import { usePhase, useTeams } from "../effects";
import testScript from "../../scripts/testScript";
import { GamePhase } from "../effects/usePhase";

const players = createQuery(Player)
const bots = createQuery(Bot)
const spawners = createQuery(Spawner, Allegiance)
const ships = createQuery(Transform, Action)
const scores = createQuery(Score)

interface SpawnLocation {
	x: number;
	y: number;
	player: Entity;
}

const useSpawnLocations = createEffect(world => {
	const distance = 100
	const spawnLocations = Array<SpawnLocation>()
	for (let i = 0; i != MAX_PLAYERS; ++i) {
		const angle = 2*Math.PI * (((3 * i) % 10) / 10)
		spawnLocations.push({
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance,
			player: -1,
		})
	}

	const next = () => spawnLocations.find(l => l.player == -1)
	const remove = (player: Entity) => {
		const spawnLocation = spawnLocations.find(l => l.player == player)
		spawnLocation && (spawnLocation.player = -1)
	}
	return () => ({
		next,
		remove
	})
})

const handlePlayerJoined = (
	world: World<Clock>,
	player: Entity,
	team: number,
	spawnLocation: SpawnLocation
) => {
	const { x, y } = spawnLocation
	const spawner = createSpawner(world, x, y, Math.PI/2, player, team,10, "capital1")
	spawnLocation.player = player
}

const handlePlayerLeft = (world: World<Clock>, player: Entity) => {
	spawners((e, [spawner, allegiance]) => {
		if (allegiance.player == player) {
			console.log(`removed spawner ${e}`)
			world.destroy(e)
		}
	})
}

const NUM_BOTS = 2
const RUN_TIME = 180
const END_TIME = 20
const phaseTimer = component(Countdown, { current: RUN_TIME, max: RUN_TIME })

export default function huntSystem(world: World<Clock>) {
	const { phase, changePhase } = usePhase()
	const dt = world.latestTickData.dt
	phaseTimer.current -= dt / 1000

	//Score
	useMonitor(players,(e, [p]) => world.attach(e, component(Score)))
	useMonitor(bots,(e, [b]) => world.attach(e, component(Score)))

	switch (phase) {
		//Runs once only at game start
		case GamePhase.setup:
			world.create(phaseTimer)
			const isolate = new ivm.Isolate({ memoryLimit: 128 })
			const script = isolate.compileScriptSync(testScript)
			const owner = world.create(
				toComponent(script, Script),
				toComponent(isolate, Isolate),
				component(Score)
			)
			const teams = useTeams()
			const team = teams.assign(owner)
			createSpawner(world, 0, 0, 0, owner, team, 2, "spawn2")

			for (let i = 0; i < NUM_BOTS; ++i) {
				createBot(world, "bot" + i)
			}
			phaseTimer.current = RUN_TIME
			changePhase(GamePhase.run)
			break

		case GamePhase.run:
			if (phaseTimer.current <= 0) {
				phaseTimer.current = END_TIME
				changePhase(GamePhase.end)
			}

			ships((e, [transform, action]) => {
				const distance = Math.sqrt(Math.pow(transform.x, 2) + Math.pow(transform.y, 2))
				if (distance > 700) {
					world.destroy(e)
				}
			})
			
			for (const shipEvent of shipTopic) {
				if (shipEvent.type === 'ship-destroyed') {
					if (shipEvent.entity !== shipEvent.combatHistory.lastHitByPlayer) {
						try {
							const score = world.get(shipEvent.combatHistory.lastHitByPlayer, Score)
							score && score.points++
							console.log(`Player score: ${score.points}`)
						} catch (err) {
							console.log(err)
						}
					}
				}
			}
			break

		case GamePhase.end:
			if (phaseTimer.current <= 0) {
				scores((e, [score]) => score.points = 0)
				ships((e, [t, a]) => world.destroy(e))
				phaseTimer.current = RUN_TIME
				changePhase(GamePhase.run)
			}
			break

	}

	//Spawn locations
	const spawnLocations = useSpawnLocations()
	for (const playerEvent of playerTopic) {
		switch (playerEvent.type) {
			case 'player-joined':
				try {
					const spawnLocation = spawnLocations.next()
					const team = world.get(playerEvent.entity, Allegiance).team
					if (spawnLocation) {
						handlePlayerJoined(world, playerEvent.entity, team, spawnLocation)
					}
				} catch (err) {
					console.error(`Error handling player join in huntSystem`)
					console.log(err)
				}
				break
			case 'player-left':
				handlePlayerLeft(world, playerEvent.entity)
				spawnLocations.remove(playerEvent.entity)
				break
		}
	}
}
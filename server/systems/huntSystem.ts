import { component, createEffect, createQuery, Entity, toComponent, useMonitor, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import ivm from 'isolated-vm'

import { playerTopic, shipTopic } from "../topics";
import {
	Countdown,
	Player,
	HuntScore,
	Spawner,
	Allegiance,
	Transform,
	Command,
	Isolate,
	Bot,
	Code,
} from '../components'
import { createBot, createSpawner } from "../factories";
import { MAX_PLAYERS } from "../env";
import { usePhase, useTeams } from "../effects";
import testScript from "../../scripts/testScript";
import { Phase } from "../../common/types";

const players = createQuery(Player)
const bots = createQuery(Bot)
const spawners = createQuery(Spawner, Allegiance)//.select(Allegiance)
const ships = createQuery(Transform, Command)
const scores = createQuery(HuntScore)

interface SpawnLocation {
	x: number;
	y: number;
	player: Entity;
}

const useSpawnLocations = createEffect(() => {
	const distance = 200
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

function handlePlayerJoined(
	world: World<Clock>,
	player: Entity,
	team: number,
	spawnLocation: SpawnLocation
) {
	const { x, y } = spawnLocation
	const rotation = Math.random() * Math.PI * 2
	const spawnRate = 8
	createSpawner(world, x, y, rotation, player, team, spawnRate, "capital1")
	spawnLocation.player = player
}

function handlePlayerLeft(world: World<Clock>, player: Entity) {
	spawners((e, [spawner, allegiance]) => {
		if (allegiance.player == player) {
			console.log(`removed spawner ${e}`)
			world.destroy(e)
		}
	})
}

const NUM_BOTS = 3
const RUN_TIME = 180
const END_TIME = 20
const phaseTimer = component(Countdown, { current: RUN_TIME, max: RUN_TIME })

export default function huntSystem(world: World<Clock>) {
	const { phaseComp, changePhase } = usePhase()
	const dt = world.latestTickData.dt
	phaseTimer.current -= dt / 1000

	//Score
	useMonitor(players,(e, [p]) => world.attach(e, component(HuntScore)))
	useMonitor(bots,(e, [b]) => world.attach(e, component(HuntScore)))

	switch (phaseComp.phase as Phase) {
		//Runs once only at game start
		case Phase.setup: {
			world.create(phaseTimer)
			const isolate = new ivm.Isolate({ memoryLimit: 128 })
			const owner = world.create(
				component(Code, { code: testScript }),
				toComponent(isolate, Isolate),
				component(HuntScore)
			)
			const teams = useTeams()
			const team = teams.assign(owner)
			createSpawner(world, 0, 0, 0, owner, team, 2, "spawn2")

			for (let i = 0; i < NUM_BOTS; ++i) {
				createBot(world, `bot${i}`)
			}
			phaseTimer.current = RUN_TIME
			changePhase(Phase.run)
			break
		}
		case Phase.run:
			if (phaseTimer.current <= 0) {
				phaseTimer.current = END_TIME
				changePhase(Phase.end)
			}

			ships((e, [transform, ]) => {
				const distance = Math.sqrt(Math.pow(transform.x, 2) + Math.pow(transform.y, 2))
				if (distance > 700) {
					world.destroy(e)
				}
			})
			
			for (const shipEvent of shipTopic) {
				if (shipEvent.type === 'ship-destroyed') {
					if (shipEvent.entity !== shipEvent.combatHistory.lastHitByPlayer) {
						try {
							const score = world.get(shipEvent.combatHistory.lastHitByPlayer, HuntScore)
							score && score.points++
						} catch (err) {
							//console.log(err)
						}
					}
				}
			}
			break

		case Phase.end:
			if (phaseTimer.current <= 0) {
				scores((e, [score]) => score.points = 0)
				ships((e, [,]) => world.destroy(e))
				phaseTimer.current = RUN_TIME
				changePhase(Phase.run)
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
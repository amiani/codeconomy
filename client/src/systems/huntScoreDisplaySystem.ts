import { createQuery, World } from "@javelin/ecs";
import { HuntScore, Player } from "../../../server/components";

const playerScores = createQuery(Player, HuntScore)

export default function huntScoreDisplaySystem(world: World) {
	const newScores = []
	playerScores((e, [player, score]) => {
		newScores.push({ name: player.name, points: score.points })
	})
}
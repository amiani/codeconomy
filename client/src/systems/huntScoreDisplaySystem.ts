import { createQuery, World } from "@javelin/ecs";
import { HuntScore, Player } from "../../../server/components";
import { actions, Score } from "../ui/state";

const playerScores = createQuery(Player, HuntScore)

export default function huntScoreDisplaySystem(world: World) {
	const scores = Array<Score>()
	playerScores((e, [player, score]) => {
		scores.push({ name: player.name, points: score.points })
	})
	actions.setScores(scores)
}
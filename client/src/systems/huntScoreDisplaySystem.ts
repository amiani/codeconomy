import { createQuery, useInterval, World } from "@javelin/ecs";

import { Allegiance, Countdown, HuntScore } from "../../../server/components";
import { actions, Score } from "../ui/state";
import { teamColors, teamNames } from '../ui/colors'
import { useClient } from "../effects";

const teamScores = createQuery(HuntScore, Allegiance)
const countdowns = createQuery(Countdown)

export default function huntScoreDisplaySystem(world: World) {
	const update = useInterval(1000)
	const { playerEntity } = useClient()
	if (update) {
		const scores = Array<Score>()
		teamScores((e, [score, allegiance]) => {
			const you = e == playerEntity ? ' (You)' : ''
			scores.push({
				name: teamNames[allegiance.team] + you,
				color: '#' + teamColors[allegiance.team].toString(16),
				points: score.points })
		})
		actions.setScores(scores)

		countdowns((e, [countdown]) => {
			actions.setTime(countdown.current)
		})
	}
}
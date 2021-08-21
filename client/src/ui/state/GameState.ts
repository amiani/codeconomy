import React from "react";

export interface Score {
	name: string;
	color: string;
	points: number;
}

export interface GameState {
	scores: Array<Score>,
	timer: number,
}
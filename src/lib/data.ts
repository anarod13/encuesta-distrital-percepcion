import type { Question, Answers, UPL } from './types';
import { base } from '$app/paths';

let questions: Question[] | null = null;
let answers: Answers | null = null;
let upls: UPL[] | null = null;

function asset(path: string) {
	return `${base}${path}`;
}

export async function loadQuestions() {
	if (!questions) questions = await fetch(asset('/data/questions.json')).then((r) => r.json());
	return questions;
}

export async function loadAnswers() {
	if (!answers) answers = await fetch(asset('/data/answers.json')).then((r) => r.json());
	return answers;
}

export async function loadUPLs() {
	if (!upls) upls = await fetch(asset('/data/upls.json')).then((r) => r.json());
	return upls;
}

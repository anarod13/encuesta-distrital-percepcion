import type { Question, Answers, UPL } from './types';
let questions: Question[] | null = null;
let answers: Answers | null = null;
let upls: UPL[] | null = null;

export async function loadQuestions() {
	if (!questions) questions = await fetch('/data/questions.json').then((r) => r.json());
	return questions;
}

export async function loadAnswers() {
	if (!answers) answers = await fetch('/data/answers.json').then((r) => r.json());
	return answers;
}

export async function loadUPLs() {
	if (!upls) upls = await fetch('/data/upls.json').then((r) => r.json());
	return upls;
}

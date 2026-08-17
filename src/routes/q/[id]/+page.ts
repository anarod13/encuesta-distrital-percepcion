import { error } from '@sveltejs/kit';
import { loadAnswers, loadQuestions } from '$lib/data';
import questionsData from '../../../../static/data/questions.json';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => questionsData.map((q) => ({ id: q.id }));

export const load: PageLoad = async ({ params }) => {
	const questions = await loadQuestions();
	const answers = await loadAnswers();
	if (!questions || !answers) error(500, 'No se pudieron cargar los datos');
	const question = questions.find((q) => q.id === params.id);
	const slice = answers[params.id];
	if (!question || !slice) error(404, 'Unknown question');
	return { question, slice };
};

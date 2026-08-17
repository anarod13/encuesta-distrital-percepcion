<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { loadQuestions } from './data';
	import { filters } from './filterState.svelte';
	import type { Question } from './types';

	const questionQuery = $derived.by(() => {
		const params = new URLSearchParams();
		for (const name of filters.selectedUpls) params.append('upl', name);
		if (filters.selectedUpls.length) params.set('measure', filters.measure);
		const q = params.toString();
		return q ? `?${q}` : '';
	});

	let questions = $state<Question[]>([]);
	let search = $state('');

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return questions;
		return questions.filter((item) => item.title.toLowerCase().includes(q));
	});

	onMount(async () => {
		questions = (await loadQuestions()) ?? [];
	});
</script>

<nav class="list">
	<input type="search" placeholder="Buscar pregunta" bind:value={search} />
	{#if filtered.length === 0}
		<p class="empty">No hay preguntas</p>
	{:else}
		<ul>
			{#each filtered as question (question.id)}
				<li>
					<a
						href="/q/{question.id}{questionQuery}"
						class:active={page.params.id === question.id}
					>
						{question.title}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
		min-height: 0;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d0d4dc;
		border-radius: 6px;
		font: inherit;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		overflow: auto;
	}

	a {
		display: block;
		padding: 0.45rem 0.6rem;
		border-radius: 6px;
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		background: #f3f4f7;
	}

	a.active {
		background: #e8eef9;
		font-weight: 600;
	}

	.empty {
		margin: 0;
		color: #667;
		font-size: 0.9rem;
	}
</style>

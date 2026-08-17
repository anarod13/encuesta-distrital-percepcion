<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import QuestionList from '$lib/QuestionList.svelte';
	import { site } from '$lib/site';

	let { children } = $props();

	const updatedAt = new Date(`${site.updatedAt}T12:00:00`).toLocaleDateString('es-CO', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{site.title}</title>
</svelte:head>

<div class="shell">
	<header>
		<h1>{site.title}</h1>
		<dl>
			<div>
				<dt>Actualizado</dt>
				<dd><time datetime={site.updatedAt}>{updatedAt}</time></dd>
			</div>
		</dl>
	</header>
	<aside>
		<QuestionList />
	</aside>
	<main>
		{@render children()}
	</main>
	<footer>
		<dl>
			<div>
				<dt>Fuente</dt>
				<dd>
					<a href={site.sourceUrl} target="_blank" rel="noopener noreferrer">{site.source}</a>
				</dd>
			</div>
			<div class="notes">
				<dt>Notas</dt>
				<dd>{site.notes}</dd>
			</div>
			<div>
				<dt>Desarrollado por</dt>
				<dd>
					<a href={site.developedByUrl} target="_blank" rel="noopener noreferrer"
						>{site.developedBy || '—'}</a
					>
				</dd>
			</div>
		</dl>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		color: #1c2430;
		font-family:
			system-ui,
			-apple-system,
			Segoe UI,
			sans-serif;
	}

	.shell {
		display: grid;
		grid-template-columns: minmax(16rem, 22rem) 1fr;
		grid-template-rows: auto 1fr auto;
		height: 100dvh;
	}

	header {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem 2.5rem;
		padding: 1rem 1.5rem 1.1rem;
		background: #10243e;
		color: #f4f7fb;
		border-bottom: 3px solid #3d7ac9;
		padding-left: 2%;
	}

	h1 {
		margin: 0;
		max-width: 42rem;
		font-size: clamp(1.05rem, 1.6vw, 1.35rem);
		font-weight: 650;
		line-height: 1.3;
	}

	dl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem 1.75rem;
		margin: 0;
	}

	dl div {
		min-width: 12rem;
	}

	dt {
		margin: 0 0 0.15rem;
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #9db6d4;
	}

	dd {
		margin: 0;
		font-size: 0.88rem;
		color: #e8eef6;
	}

	footer {
		grid-column: 1 / -1;
		padding: 0.85rem 1.5rem 1rem;
		background: #0c1b30;
		color: #d5dee9;
		border-top: 1px solid #2a3f5c;
	}

	footer dl {
		align-items: start;
		gap: 1rem 2rem;
	}

	footer dt {
		color: #8aa3c2;
	}

	footer dd {
		font-size: 0.8rem;
		line-height: 1.45;
		color: #c5d0de;
	}

	footer a {
		color: inherit;
		text-decoration: none;
	}

	footer .notes {
		flex: 1 1 22rem;
		min-width: min(100%, 22rem);
	}

	aside {
		min-height: 0;
		overflow: hidden;
		padding: 1rem;
		border-right: 1px solid #e5e7eb;
		background: #fafbfc;
	}

	main {
		min-width: 0;
		padding: 1.5rem;
		overflow: auto;
	}
</style>

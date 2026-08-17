<script lang="ts">
	import type { Measure } from './types';

	const MEASURES: { id: Measure; label: string }[] = [
		{ id: 'personas', label: 'Personas' },
		{ id: 'hogares', label: 'Hogares' }
	];

	let {
		upls,
		selectedUpls = $bindable([]),
		measure = $bindable('personas'),
		maxUpls
	}: {
		upls: string[];
		selectedUpls: string[];
		measure: Measure;
		maxUpls?: number;
	} = $props();

	let uplQuery = $state('');

	const visibleUpls = $derived.by(() => {
		const q = uplQuery.trim().toLowerCase();
		if (!q) return upls;
		return upls.filter((name) => name.toLowerCase().includes(q));
	});

	function toggle(name: string) {
		if (selectedUpls.includes(name)) {
			selectedUpls = selectedUpls.filter((u) => u !== name);
		} else if (maxUpls == null || selectedUpls.length < maxUpls) {
			selectedUpls = [...selectedUpls, name];
		}
	}

	function selectAll() {
		selectedUpls = maxUpls == null ? [...upls] : upls.slice(0, maxUpls);
	}

	function selectNone() {
		selectedUpls = [];
	}
</script>

<section class="filters">
	<div class="field">
		<div class="head">
			<label for="upl-search">UPL</label>
			<span class="count"
				>{selectedUpls.length} / {maxUpls ?? upls.length}{maxUpls ? ' máx' : ''}</span
			>
		</div>
		<input
			id="upl-search"
			type="search"
			placeholder="Buscar UPL"
			bind:value={uplQuery}
		/>
		<div class="actions">
			<button type="button" onclick={selectAll}>Todas</button>
			<button type="button" onclick={selectNone}>Ninguna</button>
		</div>
		<div class="multiselect" role="group" aria-label="UPL">
			{#each visibleUpls as name (name)}
				<label class="option">
					<input
						type="checkbox"
						checked={selectedUpls.includes(name)}
						disabled={maxUpls != null &&
							selectedUpls.length >= maxUpls &&
							!selectedUpls.includes(name)}
						onchange={() => toggle(name)}
					/>
					{name}
				</label>
			{/each}
			{#if visibleUpls.length === 0}
				<p class="empty">No hay UPL</p>
			{/if}
		</div>
	</div>

	<fieldset>
		<legend>Medida</legend>
		{#each MEASURES as item (item.id)}
			<label class="option">
				<input type="radio" name="measure" value={item.id} bind:group={measure} />
				{item.label}
			</label>
		{/each}
	</fieldset>
</section>

<style>
	.filters {
		display: grid;
		grid-template-columns: minmax(16rem, 22rem) auto;
		gap: 1.25rem 2rem;
		align-items: start;
	}

	.field,
	fieldset {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		border: none;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-weight: 600;
	}

	.count,
	.empty {
		font-weight: 400;
		font-size: 0.85rem;
		color: #667;
	}

	.empty {
		margin: 0.5rem;
	}

	legend {
		font-weight: 600;
		padding: 0;
		margin-bottom: 0.35rem;
	}

	input[type='search'] {
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d0d4dc;
		border-radius: 6px;
		font: inherit;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.25rem 0.6rem;
		border: 1px solid #d0d4dc;
		border-radius: 6px;
		background: #fff;
		font: inherit;
		cursor: pointer;
	}

	button:hover {
		background: #f3f4f7;
	}

	.multiselect {
		max-height: 14rem;
		overflow: auto;
		border: 1px solid #d0d4dc;
		border-radius: 6px;
		background: #fff;
	}

	.option {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.35rem 0.6rem;
		cursor: pointer;
	}

	.multiselect .option:hover {
		background: #f3f4f7;
	}
</style>

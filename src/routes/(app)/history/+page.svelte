<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";

	interface OrderItem {
		qty: number;
		name: string;
		price: number;
	}

	interface Order {
		id: string;
		usuario: string;
		fecha: string;
		total: number;
		items: OrderItem[];
	}

	let historial = $state<Order[]>([]);


	onMount(() => {
       	const storedUser = auth.user.isloggedIn;
     	if (!storedUser) {
    		goto('/login');
    		return;
     	}
	

		try {
			const storedHistorial = localStorage.getItem('historial');
			if (storedHistorial) {
				historial = JSON.parse(storedHistorial) as Order[];
			}
			
		} catch (error) {
			console.error("Error al parsear el historial desde localStorage:", error);
			historial = [];
			
		}
	});

	function clearHistorial(): void {
		if (!confirm('¿Borrar todo el historial de pedidos?')) return;
		
		localStorage.removeItem('historial');
		historial = []; 
	}
</script>

<header class="main-header">
	<div class="header-top">
		<div class="brand-area">
			<a href="/" class="back-btn" title="Volver al inicio" style="display: flex; align-items: center;">
				<i class="material-icons">arrow_back</i>
			</a>
			<span class="brand-name" style="font-size:1.1rem;">Historial de Pedidos</span>
		</div>
		
		<button class="btn-qty" onclick={clearHistorial} title="Borrar historial" style="font-size:0; background:none; border:none; cursor:pointer;">
			<i class="material-icons" style="font-size:20px; color:var(--text-muted);">delete_outline</i>
		</button>
	</div>
</header>

<div class="app-container historial-page" style="padding-top:10px;">
	<div id="historial-container">
		{#if historial.length === 0}
			<div class="empty-historial">
				<i class="material-icons">receipt_long</i>
				<p>Aún no tienes pedidos registrados.</p>
				<a href="/" style="color:var(--primary-color); font-weight:600; text-decoration:none; display:inline-block; margin-top:16px;">
					Ver menú →
				</a>
			</div>
		{:else}
			{#each historial as order (order.id)}
				<div class="order-card">
					<div class="order-card-header">
						<div>
							<div class="order-id">{order.id}</div>
							<div style="font-weight:600; margin-top:2px;">{order.usuario}</div>
						</div>
						<div class="order-date">{order.fecha}</div>
					</div>
					<span class="order-status">✓ Procesado</span>
					
					<!-- Sub-renderizado de los ítems del pedido -->
					<div class="order-items-list">
						{#each order.items as item, index}
							<span>{item.qty}x {item.name} — ${(item.price * item.qty).toFixed(2)}</span>
						{/each}
					</div>
					
					<div class="order-total-row">
						<span>Total</span>
						<span>${order.total.toFixed(2)}</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<a class="whatsapp-btn"
	href="_blank"
	target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
		<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.5a.5.5 0 0 0 .61.61l5.701-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.733.967.991-3.648-.235-.374A9.862 9.862 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
	</svg>
</a>
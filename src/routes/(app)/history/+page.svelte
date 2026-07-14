<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";
	
	import IconArrowBack from '~icons/ion/arrow-back';
	import IconTrashOutline from '~icons/ion/trash-outline';

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

<header class="p-5">
    
	<div class="flex items-center justify-between gap-2.5 mb-5">
        
	    <div class="flex items-center gap-2.5">
            <a href="/" class="bg-none border-none cursor-pointer text-text-main flex items-center" title="Volver al menú">
    			<IconArrowBack class="text-[24px]" />
           	</a>

           	<h3 class="text-[1.2rem] font-bold text-text-main m-0">Historial de pedidos</h3>
        </div>
		
		<button onclick={clearHistorial} class="bg-none border-none cursor-pointer text-text-main flex items-center" title="Volver al menú">
			<IconTrashOutline class="text-[20px]" />
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
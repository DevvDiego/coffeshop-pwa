<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";
	
	import IconArrowBack from '~icons/ion/arrow-back';
	import IconTrashOutline from '~icons/ion/trash-outline';
	import IconReceipt from '~icons/ion/receipt-outline';
	import IconWarningOutline from '~icons/ion/warning-outline';

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
	// Estado para controlar la visibilidad del modal
	let isModalOpen = $state<boolean>(false);


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

	function triggerClearConfirm(): void {
		isModalOpen = true;
	}

	function confirmClearHistorial(): void {
		localStorage.removeItem('historial');
		historial = []; 
		isModalOpen = false;
	}

	function closeModal(): void {
		isModalOpen = false;
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
		
		<button onclick={triggerClearConfirm} class="bg-none border-none cursor-pointer text-text-main flex items-center" title="Borrar historial">
			<IconTrashOutline class="text-[20px]" />
		</button>
		
	</div>
	
</header>

<div class="max-w-120 m-auto app-container historial-page" style="padding-top:10px;">
	<div id="historial-container">
		{#if historial.length === 0}
			<div class="empty-historial">
    			<IconReceipt class="inline text-5xl text-primary" />
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


{#if isModalOpen}
	<div class="modal active">
		<div class="modal-content">
    		<IconWarningOutline class="text-xl"/>
			<h3>¿Borrar historial?</h3>
			<p>Esta acción eliminará de forma permanente todos tus registros de pedidos locales. ¿Estás seguro de continuar?</p>
			
			<div class="flex flex-col gap-2 w-full mt-4">
				<button 
					class="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-xl cursor-pointer text-center" 
					onclick={confirmClearHistorial}
				>
					Sí, borrar todo
				</button>
				<button 
					class="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base rounded-xl cursor-pointer text-center" 
					onclick={closeModal}
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}
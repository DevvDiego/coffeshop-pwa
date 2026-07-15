<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";
	
	import IconArrowBack from '~icons/ion/arrow-back';	
	import IconCheckmarkCircleOutline from '~icons/ion/checkmark-circle-outline';

	interface CartItem {
		id: number;
		name: string;
		desc: string;
		price: number;
		img: string;
		qty: number;
	}

	interface OrderItem {
		name: string;
		qty: number;
		price: number;
	}

	interface Order {
		id: string;
		fecha: string;
		usuario: string;
		items: OrderItem[];
		total: number;
	}

	let cart = $state<Record<number, CartItem>>({});
	let isModalOpen = $state<boolean>(false);
	let username = $state<string>("Usuario");

	let cartList = $derived<CartItem[]>(Object.values(cart));
	
	let total = $derived<number>(
		cartList.reduce((acc, item) => acc + item.price * item.qty, 0)
	);

	onMount(() => {
		const storedUser = auth.user.isloggedIn;
		if (!storedUser) {
			goto('/login');
			return;
		}
		
		username = auth.user.name;

		try {
			const storedCart = sessionStorage.getItem('cart');
			if (storedCart) {
				cart = JSON.parse(storedCart) as Record<number, CartItem>;
			}
		} catch (error) {
			console.error("Error al leer el carrito:", error);
			cart = {};
		}
	});

	function changeQty(id: number, amt: number): void {
		if (!cart[id]) return;

		cart[id].qty += amt;

		if (cart[id].qty <= 0) {
			delete cart[id];
		}

		sessionStorage.setItem('cart', JSON.stringify(cart));
	}

	function placeOrder(): void {
		if (cartList.length === 0) {
			alert('Tu carrito está vacío.');
			return;
		}

		try {
			const historial: Order[] = JSON.parse(localStorage.getItem('historial') || '[]');
			
			const order: Order = {
				id: 'P' + Date.now(),
				fecha: new Date().toLocaleString('es-MX'),
				usuario: username,
				items: cartList.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
				total: total
			};

			historial.unshift(order);
			localStorage.setItem('historial', JSON.stringify(historial));
			
			isModalOpen = true;
		} catch (error) {
			console.error("Error al procesar la orden:", error);
		}
	}

	function goToGame(): void {
		sessionStorage.removeItem('cart');
		goto('/game');
	}
</script>


<div class="w-full min-h-screen bg-neutral-100/50 flex justify-center items-center">
	
	<div class="w-full max-w-120 h-screen bg-surface relative shadow-[0_0_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
		
		<!-- HEADER FIJO -->
		<header class="p-5 border-b border-gray-100 shrink-0">
			<div class="flex items-center gap-2.5">
				<a href="/" class="bg-none border-none cursor-pointer text-text-main flex items-center" title="Volver al menú">
					<IconArrowBack class="text-[24px]" />
				</a>
				<h3 class="text-[1.2rem] font-bold text-text-main m-0">Carrito de compras</h3>
			</div>
		</header>

		<!-- LISTA DE PRODUCTOS CON SCROLL INDEPENDIENTE: 
		     Crece dinamicamente (`flex-1`) pero no empuja al total hacia abajo si se llena -->
		<div class="flex-1 overflow-y-auto p-5">
			{#if cartList.length === 0}
				<div class="text-center text-text-muted mt-10">
					<p>Tu carrito está vacío.</p>
					<a href="/home" class="
					    text-primary font-semibold no-underline 
						inline-block mt-2.5
					">
						Regresar al menú
					</a>
				</div>
			{:else}
				<div class="flex flex-col gap-1">
					{#each cartList as item (item.id)}
						<div class="cart-item">
							<div class="cart-item-details">
								<h4>{item.name}</h4>
								<p>${(item.price * item.qty).toFixed(2)}</p>
							</div>
							<div class="quantity-controls">
								<button class="btn-qty" onclick={() => changeQty(item.id, -1)}>−</button>
								<span class="font-semibold">{item.qty}</span>
								<button class="btn-qty" onclick={() => changeQty(item.id, 1)}>+</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- FOOTER FIJO ABAJO -->
		<div class="p-5 pb-21 border-t border-gray-100 bg-surface shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
     			
     			<div class="cart-summary w-full bg-neutral-50/70 p-4 rounded-xl flex flex-col gap-2.5">
        				<div class="summary-row flex justify-between text-sm text-text-muted">
           					<span>Subtotal</span>
           					<span class="font-medium text-text-main">${total.toFixed(2)}</span>
        				</div>
            				<div class="summary-row flex justify-between text-sm text-text-muted">
           					<span>Costo de Entrega</span>
           					<span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
          						Gratis (Sucursal)
           					</span>
        				</div>
        				
        				<!-- Línea divisoria -->
        				<div class="border-t border-dashed border-gray-200 my-1"></div>
        				
        				<div class="summary-row total flex justify-between items-center text-lg font-bold text-text-main">
           					<span>Total</span>
           					<span class="text-xl text-text-main">${total.toFixed(2)}</span>
        				</div>
     			</div>
        
     			<button 
        				onclick={placeOrder} 
        				disabled={cartList.length === 0}
        				class="w-full mt-4 py-4 px-6 bg-primary text-white font-bold text-base rounded-xl
     				       shadow-(--shadow-float) cursor-pointer select-none text-center
     				       transition-all duration-200 
     				       hover:brightness-105
     				       active:scale-[0.97] active:brightness-95
     				       disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none"
     			>
        				<div class="flex items-center justify-center gap-2">
           					<span>Confirmar pedido</span>
       					</div>
     			</button>
        
        </div>
		
		
	</div>
</div>

{#if isModalOpen}
	<div class="modal active">
		<div class="modal-content">
			<IconCheckmarkCircleOutline class="text-5xl inline"/>
			<h3>¡Gracias por tu orden!</h3>
			<p>Tu pedido está siendo procesado de inmediato. Pasa a recogerlo directamente a la sucursal de <strong>Rectoría</strong>.</p>
			<button 
			    class="
					w-full mt-4 py-4 px-6 text-black font-bold text-base rounded-xl
     			    shadow-(--shadow-float) cursor-pointer select-none text-center" 
                onclick={goToGame}
			>
                    Iniciar juego de espera
            </button>
		</div>
	</div>
{/if}

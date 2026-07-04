<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";

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

<div class="app-container">
	<div class="page-header">
		<a href="/" class="back-btn" title="Volver al menú">
			<i class="material-icons">arrow_back</i>
		</a>
		<h3 class="section-title" style="margin:0;">Detalle de tu Pedido</h3>
	</div>

	<div id="cart-items-container" style="flex:1;">
		{#if cartList.length === 0}
			<div class="empty-cart-message" style="text-align:center; color:var(--text-muted); margin-top:40px;">
				<p>Tu carrito está vacío.</p>
				<a href="/" style="color:var(--primary-color); font-weight:600; text-decoration:none; display:inline-block; margin-top:10px;">
					Regresar al menú →
				</a>
			</div>
		{:else}
			{#each cartList as item (item.id)}
				<div class="cart-item">
					<div class="cart-item-details">
						<h4>{item.name}</h4>
						<p>${(item.price * item.qty).toFixed(2)}</p>
					</div>
					<div class="quantity-controls">
						<button class="btn-qty" onclick={() => changeQty(item.id, -1)}>−</button>
						<span style="font-weight:600;">{item.qty}</span>
						<button class="btn-qty" onclick={() => changeQty(item.id, 1)}>+</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="cart-summary">
		<div class="summary-row">
			<span>Subtotal</span>
			<span>${total.toFixed(2)}</span>
		</div>
		<div class="summary-row">
			<span>Costo de Entrega</span>
			<span style="color:#4CAF50; font-weight:600;">Gratis (Sucursal)</span>
		</div>
		<div class="summary-row total">
			<span>Total</span>
			<span>${total.toFixed(2)}</span>
		</div>
	</div>

	<button 
		class="btn btn-accent" 
		style="margin-top:20px;" 
		onclick={placeOrder} 
		disabled={cartList.length === 0}
	>
		Pedir Ahora
	</button>
</div>

{#if isModalOpen}
	<div class="modal active">
		<div class="modal-content">
			<i class="material-icons">check_circle</i>
			<h3>¡Gracias por tu orden!</h3>
			<p>Tu pedido está siendo procesado de inmediato. Pasa a recogerlo directamente a la sucursal de <strong>Rectoría</strong>.</p>
			<button class="btn" onclick={goToGame}>Iniciar juego de espera</button>
		</div>
	</div>
{/if}

<!-- <a class="whatsapp-btn"
	 href="https://wa.me/527226860144?text=Hola%20Lirios%20Quisiera%20hacer%20un%20pedido%20o%20tengo%20una%20pregunta.%20%C2%BFMe%20pueden%20ayudar%3F"
	 target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
		<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.5a.5.5 0 0 0 .61.61l5.701-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.733.967.991-3.648-.235-.374A9.862 9.862 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
	</svg>
</a> -->
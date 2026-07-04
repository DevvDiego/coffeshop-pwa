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
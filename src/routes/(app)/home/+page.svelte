<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { resolve } from "$app/paths";
	import img1 from "$lib/assets/imgs/1.jfif";
	import img2 from "$lib/assets/imgs/2.jfif";
	import img3 from "$lib/assets/imgs/3.jfif";
	import img4 from "$lib/assets/imgs/4.jfif";
	import img5 from "$lib/assets/imgs/5.jfif";
	import { auth } from "$lib/auth.svelte";

	interface Product {
		id: number;
		name: string;
		desc: string;
		price: number;
		img: string;
	}

	interface CartItem extends Product {
		qty: number;
	}

	const products: Product[] = [
     	{ id: 1, name: 'Café Americano',       desc: 'Granos selectos de altura, tostado medio con notas maderosas.',             price: 35.00, img: img2 },
     	{ id: 2, name: 'Capuccino Imperial',    desc: 'Espresso perfecto con una capa densa y cremosa de leche evaporada.',         price: 48.00, img: img3 },
     	{ id: 3, name: 'Café Latte',            desc: 'Suave combinación balanceada de café espresso y leche caliente.',             price: 45.00, img: img4 },
     	{ id: 4, name: 'Frappé Lirios Caramel', desc: 'Café licuado con hielo, jarabe de caramelo premium y crema batida.',         price: 55.00, img: img5 },
     	{ id: 5, name: 'Muffin de Arándanos',   desc: 'Panecillo horneado crujiente por fuera y esponjoso por dentro.',             price: 28.00, img: img3 }
    ];

	let username = $state<string>('Usuario');
	let cart = $state<Record<number, CartItem>>({});

	let totalItems = $derived<number>(
		Object.values(cart).reduce((acc, item) => acc + item.qty, 0)
	);
	let totalPrice = $derived<number>(
		Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0)
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
			console.error("Error parseando el carrito de sessionStorage:", error);
			cart = {};
			
		}
	});

	function addToCart(id: number): void {
		if (cart[id]) {
			cart[id].qty += 1;
			
		} else {
		
			const prod = products.find((p) => p.id === id);
			if (prod) {
				// Clonamos el producto y le añadimos la propiedad obligatoria 'qty'
				cart[id] = { ...prod, qty: 1 };
			}
			
		}
		
		sessionStorage.setItem('cart', JSON.stringify(cart));
	}
</script>

<header class="main-header">
		<div class="header-top">
			<div class="brand-area">
				<div class="logo-placeholder-sm">
					<img src={img1} alt="Logo Lirios">
				</div>
				<span class="brand-name">Lirios</span>
			</div>
			<div style="display:flex; gap:8px; align-items:center;">
				<a href="/history" class="btn-qty" title="Historial de pedidos" style="display: flex; align-items: center;">
					<i class="material-icons" style="font-size:22px; color:var(--text-muted);">receipt_long</i>
				</a>
			</div>
		</div>
		<div class="user-delivery-info">
			<span class="user-name">{username}</span>
			<span class="location-badge">
				<i class="material-icons" style="font-size:16px;">location_on</i>
				Rectoría
			</span>
		</div>
</header>

<div class="app-container" style="padding-top:0;">
		<div class="menu-content">
			<h3 class="section-title">Cafés Tradicionales</h3>
			
			<div id="menu-container">
				{#each products as p (p.id)}
					<div class="product-card">
						<div class="product-info">
							<h4 class="product-title">{p.name}</h4>
							<p class="product-desc">{p.desc}</p>
							<span class="product-price">${p.price.toFixed(2)}</span>
						</div>
						<div class="product-img-container">
							<div class="product-placeholder-img">
								<img 
									src={p.img} 
									alt={p.name} 
									onerror={(e) => (e.currentTarget as HTMLImageElement).style.display='none'}
								>
							</div>
							<button class="btn-add-product" onclick={() => addToCart(p.id)}>Agregar</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
</div>

{#if totalItems > 0}
		<a href="/cart" class="cart-bar-float" id="cart-float" style="display: flex; text-decoration: none; color: inherit;">
			<div class="cart-bar-float-left">
				<div class="cart-count-badge" id="cart-badge-count">{totalItems}</div>
				<span>Ver carrito</span>
			</div>
			<span id="cart-float-total">${totalPrice.toFixed(2)}</span>
		</a>
{/if}

<a class="whatsapp-btn"
		 href="_blank"
		 target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
			<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.5a.5.5 0 0 0 .61.61l5.701-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.733.967.991-3.648-.235-.374A9.862 9.862 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
		</svg>
</a>
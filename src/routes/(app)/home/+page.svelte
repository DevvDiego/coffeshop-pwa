<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { resolve } from "$app/paths";
	import { auth } from "$lib/auth.svelte";
	import img1 from "$lib/assets/imgs/1.jfif";
	import img2 from "$lib/assets/imgs/2.jfif";
	import img3 from "$lib/assets/imgs/3.jfif";
	import img4 from "$lib/assets/imgs/4.jfif";
	import img5 from "$lib/assets/imgs/5.jfif";
	import IconLocationOutline from '~icons/ion/location-outline';
	import IconCartOutline from '~icons/ion/cart-outline';

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

<div class="flex flex-col flex-nowrap">
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
					<IconCartOutline/>
				</a>
			</div>
		</div>
		<div class="user-delivery-info">
			<span class="user-name">{username}</span>
			<span class="location-badge">
				<IconLocationOutline/>
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
		<a href="/cart" class="z-20 cart-bar-float " id="cart-float" style="display: flex; text-decoration: none; color: inherit;">
			<div class="cart-bar-float-left text-white">
				<div class="cart-count-badge" id="cart-badge-count">{totalItems}</div>
				<span>Ver carrito</span>
			</div>
			<span id="cart-float-total" class="text-white">${totalPrice.toFixed(2)}</span>
		</a>
    {/if}
</div>
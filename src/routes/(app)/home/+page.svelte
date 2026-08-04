<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth.svelte';
  import Header from '$lib/components/Header.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import FeaturedCard from '$lib/components/FeaturedCard.svelte';
  import FloatingCart from '$lib/components/FloatingCart.svelte';
  import IconStar from '~icons/ion/star';
  
  import logo from '$lib/assets/imgs/logo.jfif';
  import { db } from '$lib/db.svelte';

  // Productos destacados 
  const featuredProducts = db.products.filter(p => p.featured);

  // Categorías regulares
  const categories: Category[] = [
    {
      name: 'Ofertas imperdibles',
      products: featuredProducts,
      isFeatured: true
    },
    {
      name: 'Cafés Calientes',
      products: db.products.filter(p => p.category === 'cafes' && !p.featured)
    },
    {
      name: 'Bebidas Frías',
      products: db.products.filter(p => p.category === 'frios' && !p.featured)
    },
    {
      name: 'Acompañamientos',
      products: db.products.filter(p => p.category === 'snacks' && !p.featured)
    }
  ];

  let username = $state('Usuario');
  let cart = $state<Record<number, CartItem>>({});
  let totalItems = $derived(Object.values(cart).reduce((acc, item) => acc + item.qty, 0));
  let totalPrice = $derived(Object.values(cart).reduce((acc, item) => acc + item.price * item.qty, 0));

  onMount(() => {
    if (!auth.user.isloggedIn) {
        goto('/login');
        return;
    }
    
    username = auth.user.name;
    
    try {
      
        const stored = sessionStorage.getItem('cart');
        if (stored) cart = JSON.parse(stored) as Record<number, CartItem>;
      
    } catch (e) {
        console.error('Error parseando el carrito:', e);
        cart = {};
      
    }
  });

  function addToCart(id: number): void {
    if (cart[id]) {
        cart[id].qty += 1;
      
    } else {
        const prod = db.products.find((p) => p.id === id);
        if (prod) cart[id] = { ...prod, qty: 1 };
      
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }
</script>

<div class="flex flex-col flex-nowrap">
    <Header {username} logoImg={logo} />
    
    <div class="w-full max-w-120 min-h-screen bg-surface relative shadow-card flex flex-col px-5 pt-0">
        <div class="pb-25">
            {#each categories as cat}
                {#if cat.products.length > 0}
                    
                    <div class="mb-8">
                        
                        <h3 class="text-[1.2rem] font-bold my-4 text-text-main">
                            {#if cat.isFeatured}
                                <span class="flex items-center gap-2">
                                    <IconStar class="text-yellow-400" /> {cat.name}
                                </span>
                            {:else}
                                {cat.name}
                            {/if}
                        </h3>
                        
                        {#if cat.isFeatured}
                            <!-- Layout vertical para destacados -->
                            <div class="flex flex-col gap-0 bg-white rounded-xl shadow-sm border border-primary-light/20 overflow-hidden">
                                {#each cat.products as product (product.id)}
                                    <FeaturedCard {product} onAddToCart={addToCart} featured={true} />
                                {/each}
                            </div>
                        {:else}
                            <!-- Layout horizontal para categorías normales -->
                            <div class="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                {#each cat.products as product (product.id)}
                                    <div class="snap-start">
                                        <ProductCard {product} onAddToCart={addToCart} />
                                    </div>
                                {/each}
                            </div>
                        {/if}

                    </div>

                {/if}
            {/each}
        </div>
    </div>
    
    <FloatingCart {totalItems} {totalPrice} />
</div>

<style global>
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
</style>
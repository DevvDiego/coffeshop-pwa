<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth.svelte';
  import Header from '$lib/components/Header.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import FeaturedCard from '$lib/components/FeaturedCard.svelte';
  import FloatingCart from '$lib/components/FloatingCart.svelte';
  import img1 from '$lib/assets/imgs/1.jfif';
  import img2 from '$lib/assets/imgs/2.jfif';
  import img3 from '$lib/assets/imgs/3.jfif';
  import img4 from '$lib/assets/imgs/4.jfif';
  import img5 from '$lib/assets/imgs/5.jfif';
  import IconStar from '~icons/ion/star';


  const products: Product[] = [
    // ========== cafes ==========
    { id: 1, name: 'Café Americano', desc: 'Granos selectos de altura, tostado medio con notas maderosas.', price: 35.00, img: img2, category: 'cafes' },
    { id: 2, name: 'Capuccino Imperial', desc: 'Espresso perfecto con una capa densa y cremosa de leche evaporada.', price: 48.00, img: img3, category: 'cafes', featured: true },
    { id: 3, name: 'Café Latte', desc: 'Suave combinación balanceada de café espresso y leche caliente.', price: 45.00, img: img4, category: 'cafes' },
    { id: 6, name: 'Espresso Italiano', desc: 'Intenso y concentrado, con crema aterciopelada y aroma profundo.', price: 38.00, img: img2, category: 'cafes' },
    { id: 7, name: 'Mocha Clásico', desc: 'Café espresso con chocolate belga y leche vaporizada, coronado con crema.', price: 52.00, originalPrice: 58.00, img: img4, category: 'cafes', featured: true },
  
    // ========== frios ==========
    { id: 4, name: 'Frappé Lirios Caramel', desc: 'Café licuado con hielo, jarabe de caramelo premium y crema batida.', price: 55.00, img: img5, category: 'frios', featured: true },
    { id: 8, name: 'Cold Brew Nitro', desc: 'Café de fermentación en frío por 24h, infusionado con nitrógeno para textura cremosa.', price: 58.00, img: img5, category: 'frios' },
    { id: 9, name: 'Limonada de Menta', desc: 'Refrescante limonada natural con hojas de menta fresca y hielo picado.', price: 42.00, img: img3, category: 'frios' },
    { id: 10, name: 'Smoothie Fresa-Platano', desc: 'Batido cremoso de fresa y banano con yogurt natural y miel de abeja.', price: 50.00, img: img4, category: 'frios' },
    { id: 11, name: 'Té Helado de Melocotón', desc: 'Infusión de té negro con jugo de melocotón, servido con hielo y rodaja cítrica.', price: 40.00, img: img2, category: 'frios' },
  
    // ========== snacks ==========
    { id: 5, name: 'Muffin de Arándanos', desc: 'Panecillo horneado crujiente por fuera y esponjoso por dentro.', price: 28.00, img: img3, category: 'snacks' },
    { id: 12, name: 'Croissant de Mantequilla', desc: 'Hojaldre francés con capas crujientes y centro suave y mantecoso.', price: 32.00, img: img5, category: 'snacks', featured: true },
    { id: 13, name: 'Galleta Triple Chocolate', desc: 'Galleta crujiente con chispas de chocolate blanco, negro y leche.', price: 22.00, img: img2, category: 'snacks' },
    { id: 14, name: 'Empanada de Queso', desc: 'Masa dorada y crujiente rellena de queso fundido y toques de orégano.', price: 26.00, originalPrice: 32.00, img: img4, category: 'snacks', featured: true },
    { id: 15, name: 'Brownie con Nueces', desc: 'Bizcocho de chocolate intenso con trozos de nuez y textura húmeda.', price: 30.00, img: img3, category: 'snacks' }
  ];

  // Productos destacados 
  const featuredProducts = products.filter(p => p.featured);

  // Categorías regulares
  const categories: Category[] = [
    {
      name: 'Ofertas imperdibles',
      products: featuredProducts,
      isFeatured: true
    },
    {
      name: 'Cafés Calientes',
      products: products.filter(p => p.category === 'cafes' && !p.featured)
    },
    {
      name: 'Bebidas Frías',
      products: products.filter(p => p.category === 'frios' && !p.featured)
    },
    {
      name: 'Acompañamientos',
      products: products.filter(p => p.category === 'snacks' && !p.featured)
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
        const prod = products.find((p) => p.id === id);
        if (prod) cart[id] = { ...prod, qty: 1 };
      
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }
</script>

<div class="flex flex-col flex-nowrap">
    <Header {username} logoImg={img1} />
    
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
<script lang="ts">
    import IconAddOutline from '~icons/ion/add-outline';

    let { 
      product, 
      onAddToCart,
    }: { product: any; onAddToCart: (id: number) => void; featured?: boolean } = $props();
</script>

<div class="flex items-center gap-3.75 
    py-3.75 px-2 border-b border-primary-light/30 
    hover:bg-surface/50 transition-colors 
    rounded-lg">
    
    <div class="flex-1">
        
        <h4 class="text-[1.05rem] font-semibold mb-1">{product.name}</h4>
        
        <p class="text-[0.85rem] text-text-muted mb-2 line-clamp-2">{product.desc}</p>
        
        <div class="flex items-center gap-2">
            
            <span class="font-bold text-[1.1rem]">${product.price.toFixed(2)}</span>
            {#if product.originalPrice}
                <span class="text-[0.85rem] text-text-muted line-through">${product.originalPrice.toFixed(2)}</span>
            {/if}
            
        </div>
        
    </div>
    
    <div class="relative w-23.75 h-23.75 shrink-0">
        <div class="w-full h-full bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] flex items-center justify-center overflow-hidden">
            
            <img
                src={product.img}
                alt={product.name}
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            
        </div>
        
        <button
            class="
            absolute -bottom-2 left-1/2 -translate-x-1/2
            bg-primary text-white
            border border-primary-dark
            py-1 px-5 rounded-[15px] 
            font-bold shadow-sm shadow-gray
            text-xs 
            whitespace-nowrap
            hover:bg-primary-dark active:scale-95 transition-all"
            onclick={() => onAddToCart(product.id)}
        >
            <IconAddOutline class="inline" />
            Agregar
        </button>
        
    </div>
</div>
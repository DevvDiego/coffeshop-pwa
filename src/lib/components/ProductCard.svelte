<script lang="ts">
    import IconAddOutline from '~icons/ion/add-outline';
    
    let { 
      product, 
      onAddToCart 
    }: { product: any; onAddToCart: (id: number) => void } = $props();
</script>

<div class="flex flex-col w-32 shrink-0 bg-white overflow-hidden">

    <!-- Imagen -->
    <div class="relative w-full h-30 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          class="w-full h-full object-cover"
          onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        
        <button class="
            absolute right-1 bottom-1
            bg-primary text-white text-xs font-bold 
            py-2 px-2.5 rounded-md 
            hover:bg-primary-dark transition-colors active:scale-95"
            onclick={() => onAddToCart(product.id)}
        >
          <IconAddOutline />
        </button>
    </div>
  
    <!-- Contenido -->
    <div class="p-2 flex flex-col gap-1 flex-1">
        
        <h5 class="text-[0.9rem] font-semibold leading-tight text-text-main line-clamp-2">{product.name}</h5>
        <p class="text-[0.7rem] text-text-muted line-clamp-2 flex-1">{product.desc}</p>
        
        <div class="flex items-center justify-between mt-1">
            <span class="font-bold text-[0.95rem] text-primary">${product.price.toFixed(2)}</span>
        </div>
  
    </div>
</div>
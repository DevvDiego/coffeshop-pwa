<script lang="ts">
  import IconLocationOutline from '~icons/ion/location-outline';
  import IconCartOutline from '~icons/ion/cart-outline';
  let { username, logoImg }: { username: string; logoImg: string } = $props();
</script>

<header class="bg-surface py-4 px-5 border-b border-primary-light/20 sticky top-0 z-100">
    
    <div class="flex justify-between items-center mb-4">
        
        <div class="flex items-center gap-2.5">
            
            <div class="w-10 h-10 bg-primary-light border border-dashed border-primary rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="Logo Lirios" class="w-full h-full object-cover" />
            </div>
            
            <span class="text-xl font-bold text-primary">Lirios</span>
        
        </div>
        
        <a href="/history" class="flex items-center gap-2 text-primary" title="Historial de pedidos">
            <IconCartOutline class="h-7 w-7" />
        </a>
        
    </div>
    
    <div class="flex justify-between items-center bg-background py-2.5 px-3.5 rounded-[20px]">
        
        <span class="font-semibold text-lg">{username}</span>
        <span class="flex items-center gap-1 text-accent font-semibold text-[0.9rem]">
            <IconLocationOutline />
            Rectoría
        </span>
    
    </div>
    
</header>
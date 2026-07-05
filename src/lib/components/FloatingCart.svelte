<script lang="ts">
  let { totalItems, totalPrice }: { totalItems: number; totalPrice: number } = $props();
</script>

{#if totalItems > 0}
  <a
    href="/cart"
    class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-110 bg-primary text-white py-4 px-5 rounded-[30px] flex justify-between items-center shadow-float z-200 no-underline"
  >
    <div class="flex items-center gap-2.5">
      <div class="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-[0.85rem]">
        {totalItems}
      </div>
      <span>Ver carrito</span>
    </div>
    <span>${totalPrice.toFixed(2)}</span>
  </a>
{/if}
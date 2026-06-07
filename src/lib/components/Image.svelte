<script lang="ts">

    type props = {
      class?: string,
      src: string,
      alt: string,
      loadLazily: boolean
    }
    
    let {
      class: klass = "",
      src,
      alt = "",
      loadLazily = true
    }: props = $props();
    
</script>

<img
    loading={loadLazily ? "lazy":"eager"}
	{src}
	{alt}
	class="h-full w-full object-contain {klass}"
/>
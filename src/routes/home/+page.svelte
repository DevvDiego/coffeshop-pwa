<script>
	import { resolve } from "$app/paths";
	import { auth } from "$lib/auth.svelte";
</script>

<h1>
    Bienvenido {auth.user.name}
</h1>

<p>
    en la pagina home
</p>
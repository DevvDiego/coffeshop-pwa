<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { auth } from "$lib/auth.svelte";

	type userProps = {
        name: string|null
	}
	
	let user: userProps = $state({
	  "name": null
	});
	
	function login_user(ev: SubmitEvent){
	    ev.preventDefault();
	    if(user.name == null){
		    return;
		}
	
	    auth.login(user.name);
		goto(resolve("/home"));	
	}

	
</script>

<h1>
    en la pagina login
</h1>

<h1>Por favor, inicia sesión</h1>

<form onsubmit={login_user}>
    <input bind:value={user.name} type="text" placeholder="Nombre">
    <button> Login </button>
</form>

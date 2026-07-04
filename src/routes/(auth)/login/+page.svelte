<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import logo from "$lib/assets/imgs/1.jfif";
	
	let username = $state<string>("");

	function handleLogin(ev: SubmitEvent): void {
		ev.preventDefault();
		
		const trimmedName = username.trim();

		if (trimmedName === '') {
			alert('Por favor ingresa tu nombre de usuario para continuar.');
			return;
		}

		if (auth) {
			auth.login(trimmedName);
		}

		goto("/home"); 
	}
</script>

<div class="login-page">
	<div class="login-header">
		<div class="logo-placeholder-large">
			<img src={logo} alt="Logo Lirios Cafetería">
		</div>
		<h1>Lirios</h1>
		<p style="color: var(--text-muted);">Cafetería y Antojos</p>
	</div>

	<form class="login-card" onsubmit={handleLogin}>
		<div class="input-group">
			<label for="username">Nombre de usuario</label>
			<input 
				type="text" 
				id="username" 
				placeholder="Ej. Vidal" 
				bind:value={username}
			>
		</div>
		
		<button type="submit" class="btn">Entrar</button>
	</form>
</div>

<a class="whatsapp-btn"
	 href="https://wa.me/527226860144?text=Hola%20Lirios%20Quisiera%20hacer%20un%20pedido%20o%20tengo%20una%20pregunta.%20%C2%BFMe%20pueden%20ayudar%3F"
	 target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
		<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.5a.5.5 0 0 0 .61.61l5.701-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.733.967.991-3.648-.235-.374A9.862 9.862 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
	</svg>
</a>
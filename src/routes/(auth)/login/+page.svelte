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
<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import logo from "$lib/assets/imgs/logo.jfif";
	
	import IconInformationCircleOutline from '~icons/ion/information-circle-outline';
	
	let username = $state<string>("");
	let isModalOpen = $state<boolean>(false);

	function handleLogin(ev: SubmitEvent): void {
		ev.preventDefault();
		
		const trimmedName = username.trim();

		if (trimmedName === '') {
			isModalOpen = true;
			return;
		}

		if (auth) {
			auth.login(trimmedName);
		}

		goto("/home"); 
	}

	function closeModal(): void {
		isModalOpen = false;
	}
</script>

<div class="flex flex-col justify-center items-center text-center min-h-screen bg-linear-to-b from-primary-light to-background p-5">
	<div class="mb-10">
		<div class="
		    w-30 h-30 bg-primary-light border-2 border-dashed border-primary rounded-full 
    		flex items-center justify-center mx-auto mb-4 overflow-hidden
        ">
			<img src={logo} alt="Logo Lirios Cafetería" class="w-full h-full object-cover">
		</div>
		<h1 class="text-primary text-4xl font-bold">Lirios</h1>
		<p class="text-text-muted">Cafetería y Antojos</p>
	</div>

	<form onsubmit={handleLogin} class="w-full max-w-md bg-white p-6 rounded-2xl shadow-card">
		<div class="mb-5 text-left">
			<label for="username" class="block text-sm text-text-muted mb-2 font-semibold">
				Nombre de usuario
			</label>
			<input 
				type="text" 
				id="username" 
				placeholder="Escribe tu nombre" 
				bind:value={username}
				class="w-full p-3.5 border border-gray-300 rounded-lg text-base outline-none focus:border-primary transition-colors"
			>
		</div>
		
		<button type="submit" class="
		    w-full py-3.5 bg-primary text-white border-none 
		    rounded-lg text-base font-semibold cursor-pointer transition active:scale-95
		">
			Entrar
		</button>
	</form>
</div>

{#if isModalOpen}
	<div class="modal active">
		<div class="modal-content">
			<IconInformationCircleOutline class="text-5xl inline"/>
			<h3>Nombre requerido</h3>
			<p>Por favor, ingresa tu nombre de usuario para poder continuar al menú de la cafetería.</p>
			<button 
				class="w-full mt-4 py-4 px-6 text-black font-bold text-base rounded-xl
				       shadow-(--shadow-float) cursor-pointer select-none text-center" 
				onclick={closeModal}
			>
				Entendido
			</button>
		</div>
	</div>
{/if}
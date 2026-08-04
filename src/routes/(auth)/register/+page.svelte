<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import logo from "$lib/assets/imgs/logo.jfif";
	import IconInformationCircleOutline from '~icons/ion/information-circle-outline';
	import { resolve } from "$app/paths";
	
	let username = $state<string>("");
	let password = $state<string>("");
	let isModalOpen = $state<boolean>(false);
	let isLoading = $state<boolean>(false);

	async function handleRegister(ev: SubmitEvent): Promise<void> {
		ev.preventDefault();
		
		const trimmedName = username.trim();
		const trimmedPassword = password.trim();

		if (trimmedName === '' || trimmedPassword === '') {
			isModalOpen = true;
			return;
		}

		try {
			isLoading = true;
			
			await auth.register(trimmedName, trimmedPassword);
			
			// Iniciamos sesion automaticamente tras el registro
			const success = await auth.login(trimmedName, trimmedPassword);

			if (success) {
				goto("/home");
			}
		} catch (error) {
			console.error("Error durante el registro:", error);
		} finally {
			isLoading = false;
		}
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

	<form onsubmit={handleRegister} class="w-full max-w-md bg-white p-6 rounded-2xl shadow-card">
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-800 mb-1">
				Regístrate para empezar
			</h1>
			
			<a href={resolve("/login")} class="text-sm text-primary hover:underline">
				¿Ya tienes una cuenta? Inicia sesión
			</a>
		</div>
	
		<div class="mb-5 text-left">
			<label for="username" class="block text-sm text-text-muted mb-2 font-semibold">
				Nombre de usuario
			</label>
			<input 
				type="text" 
				id="username" 
				placeholder="Escribe tu nombre" 
				bind:value={username}
				disabled={isLoading}
				class="w-full p-3.5 border border-gray-300 rounded-lg text-base outline-none focus:border-primary transition-colors disabled:bg-gray-100"
			/>
		</div>
		
		<div class="mb-5 text-left">
			<label for="password" class="block text-sm text-text-muted mb-2 font-semibold">
				Contraseña
			</label>
			<input 
				type="password" 
				id="password" 
				placeholder="Crea una contraseña" 
				bind:value={password}
				disabled={isLoading}
				class="w-full p-3.5 border border-gray-300 rounded-lg text-base outline-none focus:border-primary transition-colors disabled:bg-gray-100"
			/>
		</div>
		
		<button 
			type="submit" 
			disabled={isLoading}
			class="
				w-full py-3.5 bg-primary text-white border-none 
				rounded-lg text-base font-semibold cursor-pointer transition active:scale-95
				disabled:opacity-50 disabled:cursor-not-allowed
			"
		>
			{isLoading ? 'Registrando...' : 'Crear Cuenta'}
		</button>
	</form>
</div>

{#if isModalOpen}
	<div class="modal active">
		<div class="modal-content">
			<IconInformationCircleOutline class="text-5xl inline text-amber-500 mb-2"/>
			<h3 class="text-xl font-bold mb-2">Campos requeridos</h3>
			<p class="text-gray-600">Por favor, ingresa un nombre de usuario y una contraseña válidos para registrarte.</p>
			<button 
				class="w-full mt-4 py-3 px-6 text-black font-bold text-base rounded-xl
				       shadow-float cursor-pointer select-none text-center bg-gray-100 hover:bg-gray-200 transition" 
				onclick={closeModal}
			>
				Entendido
			</button>
		</div>
	</div>
{/if}
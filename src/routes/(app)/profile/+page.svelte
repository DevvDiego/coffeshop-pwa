<script lang="ts">
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.svelte";
	import { onMount } from "svelte";

	import IconArrowBack from '~icons/ion/arrow-back';
	import IconPerson from '~icons/ion/person-outline';
	import IconReceipt from '~icons/ion/receipt-outline';
	import IconLogOut from '~icons/ion/log-out-outline';
	import IconChevronForward from '~icons/ion/chevron-forward';

	let username = $state<string>("Usuario");

	onMount(() => {
		const storedUser = auth.user.isloggedIn;
		if (!storedUser) {
			goto('/login');
			return;
		}
		
		username = auth.user.name;
	});

	function handleLogout(): void {
     	auth.logout();
		goto('/login');
	}
</script>

<div class="w-full max-w-120 m-auto min-h-screen bg-surface relative shadow-[0_0_20px_rgba(0,0,0,0.05)] flex flex-col p-5">
	
	<div class="flex items-center gap-2.5 mb-5">
		<a href="/" class="bg-none border-none cursor-pointer text-text-main flex items-center" title="Volver al menú">
			<IconArrowBack class="text-[24px]" />
		</a>
		<h3 class="text-[1.2rem] font-bold text-text-main m-0">Mi Perfil</h3>
	</div>

	<div class="flex flex-col items-center py-6 mb-5">
		<div class="w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mb-3 shadow-[var(--shadow-card)]">
			<IconPerson class="text-[40px]" />
		</div>
		<h2 class="text-[1.4rem] font-bold text-text-main m-0 mb-1">{username}</h2>
		<span class="text-xs text-center bg-primary-light text-primary px-3 py-1 rounded-xl font-semibold">
			Cliente
		</span>
	</div>

	<div class="w-5/6 mx-auto flex flex-col gap-3">
		
		<button 
			onclick={() => goto('/history')} 
			class="w-full flex justify-between items-center bg-surface border border-[#F0F0F0] p-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-98 active:bg-[#FAFAF9] shadow-[var(--shadow-card)]"
		>
			<div class="flex items-center gap-3.5 text-[1rem] font-semibold text-text-main">
				<IconReceipt class="text-[22px] text-primary" />
				<span>Historial de Pedidos</span>
			</div>
			<IconChevronForward class="text-[18px] text-text-muted" />
		</button>

		<button 
			onclick={handleLogout} 
			class="w-full flex justify-between items-center bg-surface border border-red-100 p-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-98 active:bg-red-50/30 shadow-[var(--shadow-card)]"
		>
			<div class="flex items-center gap-3.5 text-[1rem] font-semibold text-text-main">
				<IconLogOut class="text-[22px] text-red-600" />
				<span>Cerrar Sesión</span>
			</div>
			<IconChevronForward class="text-[18px] text-text-muted" />
		</button>

	</div>
</div>

<style>

</style>
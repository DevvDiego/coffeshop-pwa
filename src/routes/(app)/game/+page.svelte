<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
	import player from "$lib/assets/imgs/player.png";
	import item from "$lib/assets/imgs/item.png";
	import { auth } from "$lib/auth.svelte";

	// Iconos del set Ion (mismos que usa el resto de la app: Navbar, Header, home)
	import IconArrowBack from '~icons/ion/arrow-back';
	import IconHeart from '~icons/ion/heart';
	import IconStar from '~icons/ion/star';

	interface GameItem {
		x: number;
		y: number;
		w: number;
		h: number;
	}

	interface Popup {
		x: number;
		y: number;
		life: number;
	}

	type Difficulty = 'facil' | 'medio' | 'dificil';

	let score = $state<number>(0);
	let lives = $state<number>(3);
	let running = $state<boolean>(false);
	let currentStage = $state<number>(1);
	let currentLevel = $state<Difficulty>('facil');
	let couponCode = $state<string>('');
	let showCoupon = $state<boolean>(false);
	let heartShake = $state<boolean>(false);
	
	// Estado para controlar el overlay modal
	let overlayVisible = $state<boolean>(true);
	let overlayTitle = $state<string>('🎮 Juego de Espera');
	let overlayMsg = $state<string>('Atrapa los ingredientes mientras tu orden se prepara.');
	let buttonText = $state<string>('Iniciar Juego');

	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let gameWrapElement = $state<HTMLDivElement | null>(null);

	let ctx: CanvasRenderingContext2D | null = null;
	let W = 0;
	let H = 0;
	const PLAYER_H = 40;
	const ITEM_SIZE = 36;
	const SPAWN_TIME = 900;

	let playerX = 0;
	let playerW = 0;
	let playerSpeed = 0;
	let itemSpeed = 4;
	let touchDir = 0;
	let items: GameItem[] = [];
	let popups: Popup[] = [];

	let animationId: number;
	let spawnTimer: ReturnType<typeof setInterval>;
	const keys: Record<string, boolean> = {};

	let playerImg: HTMLImageElement;
	let itemImg: HTMLImageElement;

	onMount(() => {
     	const storedUser = auth.user.isloggedIn;
     	if (!storedUser) {
      		goto('/login');
      		return;
     	}
     	
     	playerImg = new Image(); playerImg.src = player;
		itemImg = new Image(); itemImg.src = item;

		if (canvasElement) {
			ctx = canvasElement.getContext('2d');
		}

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		}
		stopGame();
	});

	function resizeCanvas(): void {
		if (!gameWrapElement || !canvasElement) return;
		W = gameWrapElement.clientWidth;
		H = gameWrapElement.clientHeight;

		canvasElement.width = W;
		canvasElement.height = H;

		playerW = Math.max(70, W * 0.18);
		playerSpeed = Math.max(8, W * 0.022);

		if (!running) {
			playerX = W / 2 - playerW / 2;
		}
	}

	function genCodigo(): string {
		return 'LIRIOS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
	}

	function resetGame(): void {
		score = 0;
		lives = 3;
		items = [];
		popups = [];
		currentStage = 1;
		playerX = W / 2 - playerW / 2;

		switch (currentLevel) {
			case 'facil':   itemSpeed = 3; break;
			case 'medio':   itemSpeed = 5; break;
			case 'dificil': itemSpeed = 7; break;
		}
	}

	function spawnItem(): void {
		if (!running) return;
		items.push({
			x: Math.random() * (W - ITEM_SIZE),
			y: -ITEM_SIZE,
			w: ITEM_SIZE,
			h: ITEM_SIZE
		});
	}

	function loseLife(): void {
		lives--;
		heartShake = true;
		setTimeout(() => { heartShake = false; }, 400);
		if (lives <= 0) gameOver();
	}

	function gameOver(): void {
		stopGame();
		showCoupon = false;
		overlayTitle = '😔 Game Over';
		overlayMsg = `Puntuación: <strong>${score}</strong><br>¡Inténtalo de nuevo!`;
		buttonText = 'Jugar otra vez';
		overlayVisible = true;
	}

	function nextStage(): void {
		stopGame();
		const codigo = genCodigo();

		if (currentStage < 3) {
			overlayTitle = `🎉 Etapa ${currentStage} completada`;
			overlayMsg = `¡Llegaste a 15 puntos!<br>La velocidad aumentará en la siguiente etapa.`;
			couponCode = codigo;
			showCoupon = true;
			currentStage++;
			score = 0;
			items = [];
			popups = [];
			itemSpeed += 2;
			buttonText = 'Siguiente etapa';
			overlayVisible = true;
		} else {
			overlayTitle = '🏆 ¡Maestro Barista!';
			overlayMsg = `¡Completaste las 3 etapas!<br>Código especial de recompensa:`;
			couponCode = codigo;
			showCoupon = true;
			buttonText = 'Jugar otra vez';
			overlayVisible = true;
			lives = 0; 
		}
	}

	function stopGame(): void {
		running = false;
		cancelAnimationFrame(animationId);
		clearInterval(spawnTimer);
	}

	// Input Handlers (Teclado y Mouse / Touch)
	function handleKeyDown(e: KeyboardEvent): void { keys[e.key] = true; }
	function handleKeyUp(e: KeyboardEvent): void { keys[e.key] = false; }

	function handleMouseMove(e: MouseEvent): void {
		if (!running || !canvasElement) return;
		const rect = canvasElement.getBoundingClientRect();
		const scale = W / rect.width;
		const mx = (e.clientX - rect.left) * scale;
		playerX = Math.max(0, Math.min(W - playerW, mx - playerW / 2));
	}

	function handleTouchMove(e: TouchEvent): void {
		if (!running || !canvasElement || e.touches.length === 0) return;
		const rect = canvasElement.getBoundingClientRect();
		const scale = W / rect.width;
		const tx = (e.touches[0].clientX - rect.left) * scale;
		playerX = Math.max(0, Math.min(W - playerW, tx - playerW / 2));
	}

	function update(): void {
		const dir = touchDir ||
			((keys['ArrowLeft']  || keys['a'] || keys['A']) ? -1 : 0) ||
			((keys['ArrowRight'] || keys['d'] || keys['D']) ?  1 : 0);
		
		playerX += dir * playerSpeed;
		playerX = Math.max(0, Math.min(W - playerW, playerX));

		const playerY = H - PLAYER_H - 10;

		items.forEach(i => { i.y += itemSpeed; });

		items = items.filter(item => {
			const caught =
				item.y + item.h >= playerY &&
				item.y          <= playerY + PLAYER_H &&
				item.x + item.w >= playerX &&
				item.x          <= playerX + playerW;

			if (caught) {
				score++;
				popups.push({ x: item.x + item.w / 2, y: item.y + item.h / 2, life: 1 });
				if (score >= 15) nextStage();
				return false;
			}
			if (item.y > H) { 
				loseLife(); 
				return false; 
			}
			return true;
		});

		// Animar y limpiar los popups "+1"
		popups.forEach(p => {
			p.life -= 0.035;
			p.y -= 1.4;
		});
		popups = popups.filter(p => p.life > 0);
	}

	function draw(): void {
		if (!ctx) return;
		const playerY = H - PLAYER_H - 10;

		// Fondo 
		const grad = ctx.createLinearGradient(0, 0, 0, H);
		grad.addColorStop(0, '#5A3B26');
		grad.addColorStop(1, '#B97A46');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, W, H);

		// Dibujar elementos e ítems
		items.forEach(item => {
			if (itemImg.complete) ctx?.drawImage(itemImg, item.x, item.y, item.w, item.h);
		});

		if (playerImg.complete) ctx.drawImage(playerImg, playerX, playerY, playerW, PLAYER_H);

		// Destello + "+1" flotante al atrapar un ingrediente
		popups.forEach(p => {
			const alpha = Math.max(0, p.life);
			if (!ctx) return;

			ctx.beginPath();
			ctx.arc(p.x, p.y, (1 - p.life) * 24 + 6, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(226,135,67,${alpha * 0.7})`;
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillStyle = `rgba(226,135,67,${alpha})`;
			ctx.fillText('+1', p.x, p.y);
		});

		// Línea límite
		ctx.strokeStyle = 'rgba(74,45,26,0.35)';
		ctx.lineWidth = 1;
		ctx.setLineDash([6, 6]);
		ctx.beginPath();
		ctx.moveTo(0, playerY - 2);
		ctx.lineTo(W, playerY - 2);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function gameLoop(): void {
		if (!running) return;
		update();
		draw();
		animationId = requestAnimationFrame(gameLoop);
	}

	function handleStartClick(): void {
		if (score === 0 || lives <= 0) {
			resetGame();
		}
		showCoupon = false;
		overlayVisible = false;
		running = true;
		clearInterval(spawnTimer);
		spawnTimer = setInterval(spawnItem, SPAWN_TIME);
		gameLoop();
	}
</script>

<div class="w-full min-h-screen flex justify-center bg-primary">
    <div class="w-full max-w-120 m-auto min-h-screen relative flex flex-col overflow-hidden bg-linear-to-b from-primary to-accent text-white pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">

		<div class="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 pointer-events-none">

			<a
				href="/home"
				title="Salir del juego"
				class="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white active:scale-95 transition"
			>
				<IconArrowBack class="text-lg" />
			</a>

			<div class="pointer-events-auto flex items-center gap-2">
				<div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3.5 py-1.5">
					<IconStar class="text-accent text-sm" />
					<span class="font-bold text-sm tabular-nums">{score}</span>
				</div>

				<div class="flex items-center gap-1 backdrop-blur-sm rounded-full px-3 py-1.5 border transition-colors duration-200 {heartShake ? 'bg-red-500/25 border-red-400/50 heart-shake' : 'bg-black/40 border-white/10'}">
					{#each [0, 1, 2] as i}
						<IconHeart class="text-base transition-all duration-150 {lives > i ? 'text-accent scale-100' : 'text-white/20 scale-90'}" />
					{/each}
				</div>
			</div>
		</div>

		<!-- Etapa actual + barra de progreso hacia los 15 puntos -->
		<div class="absolute top-16 inset-x-4 z-20 flex flex-col gap-1">
			<div class="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-wide text-white/40">
				<span>Etapa {currentStage} de 3</span>
				<span class="tabular-nums">{Math.min(score, 15)}/15</span>
			</div>
			<div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
				<div
					class="h-full bg-accent rounded-full transition-all duration-300 ease-out"
					style="width: {(Math.min(score, 15) / 15) * 100}%"
				></div>
			</div>
		</div>

		<!-- Area de juego -->
		<div class="relative w-full flex-1" bind:this={gameWrapElement}>
			<canvas
				bind:this={canvasElement}
				class="block w-full h-full touch-none cursor-none"
				onmousemove={handleMouseMove}
				ontouchmove={handleTouchMove}
			></canvas>

			{#if overlayVisible}
				<div class="absolute inset-0 z-30 flex items-center justify-center bg-primary/85 backdrop-blur-sm p-6">
					<div class="w-full max-w-xs bg-primary-light text-text-main rounded-2xl shadow-float border border-accent/20 p-6 flex flex-col items-center gap-4">

						<h2 class="text-xl font-bold text-primary text-center leading-tight">{overlayTitle}</h2>
						<p class="text-sm text-text-muted text-center leading-relaxed">{@html overlayMsg}</p>

						{#if score === 0 || lives <= 0}
							<div class="w-full flex items-center gap-3">
								<label for="difficulty" class="text-sm font-semibold text-text-muted whitespace-nowrap">
									Dificultad
								</label>
								<select
									id="difficulty"
									bind:value={currentLevel}
									class="flex-1 border border-primary/30 rounded-lg px-3 py-2 text-sm bg-white text-text-main outline-none focus:border-primary transition-colors"
								>
									<option value="facil">Facil</option>
									<option value="medio">Medio</option>
									<option value="dificil">Dificil</option>
								</select>
							</div>
						{/if}

						{#if showCoupon}
							<div class="w-full flex flex-col items-center gap-1 bg-white border-2 border-dashed border-primary rounded-xl px-4 py-3.5">
								<span class="text-xs text-text-muted">Tu cupon</span>
								<strong class="text-xl font-bold tracking-wider text-primary">{couponCode}</strong>
							</div>
						{/if}

						<button
							class="w-full py-3.5 bg-accent text-white rounded-lg font-semibold cursor-pointer active:scale-95 transition"
							onclick={handleStartClick}
						>
							{buttonText}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes heart-shake {
		0%, 100% { transform: translateX(0); }
		20% { transform: translateX(-4px); }
		40% { transform: translateX(4px); }
		60% { transform: translateX(-3px); }
		80% { transform: translateX(3px); }
	}

	.heart-shake {
		animation: heart-shake 0.4s ease-in-out;
	}
</style>
<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
	import player from "$lib/assets/imgs/player.png";
	import item from "$lib/assets/imgs/item.png";

	interface GameItem {
		x: number;
		y: number;
		w: number;
		h: number;
	}

	type Difficulty = 'facil' | 'medio' | 'dificil';

	let score = $state<number>(0);
	let lives = $state<number>(3);
	let running = $state<boolean>(false);
	let currentStage = $state<number>(1);
	let currentLevel = $state<Difficulty>('facil');
	let couponCode = $state<string>('');
	let showCoupon = $state<boolean>(false);
	
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

	let animationId: number;
	let spawnTimer: ReturnType<typeof setInterval>;
	const keys: Record<string, boolean> = {};

	let playerImg: HTMLImageElement;
	let itemImg: HTMLImageElement;

	onMount(() => {
		if (!sessionStorage.getItem('username')) {
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
		H = Math.min(window.innerHeight * 0.72, 520);

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
			overlayMsg = `¡Llegaste a 100 puntos!<br>La velocidad aumentará en la siguiente etapa.`;
			couponCode = codigo;
			showCoupon = true;
			currentStage++;
			score = 0;
			items = [];
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
				if (score >= 100) nextStage();
				return false;
			}
			if (item.y > H) { 
				loseLife(); 
				return false; 
			}
			return true;
		});
	}

	function draw(): void {
		if (!ctx) return;
		const playerY = H - PLAYER_H - 10;

		// Fondo
		const grad = ctx.createLinearGradient(0, 0, 0, H);
		grad.addColorStop(0, '#1A0F07');
		grad.addColorStop(1, '#3B1F0E');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, W, H);

		// Efectos visuales de fondo 
		ctx.fillStyle = 'rgba(226,135,67,0.04)';
		for (let i = 0; i < 4; i++) {
			ctx.beginPath();
			ctx.arc((W / 5) * (i + 1), H * 0.3 + Math.sin(Date.now() / 800 + i) * 8, 30, 0, Math.PI * 2);
			ctx.fill();
		}

		// Dibujar elementos e ítems
		items.forEach(item => {
			if (itemImg.complete) ctx?.drawImage(itemImg, item.x, item.y, item.w, item.h);
		});

		if (playerImg.complete) ctx.drawImage(playerImg, playerX, playerY, playerW, PLAYER_H);

		// Línea límite
		ctx.strokeStyle = 'rgba(226,135,67,0.15)';
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

<div class="app-container game-page">
	<div class="game-scoreboard">
		<div class="score-box">
			<span>Puntos:</span>
			<span class="score-val">{score}</span>
		</div>
		
		<div class="hearts-box">
			<i class="material-icons id-heart" class:lost={lives < 1}>favorite</i>
			<i class="material-icons id-heart" class:lost={lives < 2}>favorite</i>
			<i class="material-icons id-heart" class:lost={lives < 3}>favorite</i>
		</div>
	</div>

	<div id="gameWrap" bind:this={gameWrapElement} style="position: relative; width: 100%; flex: 1;">
		<canvas 
			bind:this={canvasElement} 
			onmousemove={handleMouseMove}
			ontouchmove={handleTouchMove}
		></canvas>

		{#if overlayVisible}
			<div class="game-overlay" id="overlay">
				<h2 id="overlayTitle">{overlayTitle}</h2>
				<p id="overlayMsg">{@html overlayMsg}</p>

				{#if score === 0 || lives <= 0}
					<div class="difficulty-group" style="margin: 15px 0;">
						<label for="difficulty" style="margin-right: 8px; color: #fff;">Dificultad:</label>
						<select id="difficulty" bind:value={currentLevel} style="padding: 5px; border-radius: 4px;">
							<option value="facil">Fácil</option>
							<option value="medio">Medio</option>
							<option value="dificil">Dificil</option>
						</select>
					</div>
				{/if}

				{#if showCoupon}
					<div class="coupon-box" id="couponDisplay">
						<span>Tu Cupón:</span>
						<strong id="couponCode">{couponCode}</strong>
					</div>
				{/if}

				<button class="btn btn-accent" id="startBtn" onclick={handleStartClick}>
					{buttonText}
				</button>
			</div>
		{/if}
	</div>

	<div class="mobile-controls">
		<button 
			id="btnLeft" 
			class="btn-control"
			ontouchstart={(e) => { e.preventDefault(); touchDir = -1; }}
			ontouchend={(e) => { e.preventDefault(); if (touchDir === -1) touchDir = 0; }}
		>
			<i class="material-icons">arrow_back</i>
		</button>
		<button 
			id="btnRight" 
			class="btn-control"
			ontouchstart={(e) => { e.preventDefault(); touchDir = 1; }}
			ontouchend={(e) => { e.preventDefault(); if (touchDir === 1) touchDir = 0; }}
		>
			<i class="material-icons">arrow_forward</i>
		</button>
	</div>
</div>

<a class="whatsapp-btn"
	 href="https://wa.me/527226860144?text=Hola%20Lirios%20Quisiera%20hacer%20un%20pedido%20o%20tengo%20una%20pregunta.%20%C2%BFMe%20pueden%20ayudar%3F"
	 target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
		<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.5a.5.5 0 0 0 .61.61l5.701-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.733.967.991-3.648-.235-.374A9.862 9.862 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
	</svg>
</a>
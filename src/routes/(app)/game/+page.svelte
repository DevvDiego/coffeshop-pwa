<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
	import player from "$lib/assets/imgs/player.png";
	import item from "$lib/assets/imgs/item.png";
	import { auth } from "$lib/auth.svelte";

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
			overlayMsg = `¡Llegaste a 15 puntos!<br>La velocidad aumentará en la siguiente etapa.`;
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
				if (score >= 15) nextStage();
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

<div class="game-body">
    
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
    			<div class="game-overlay flex flex-col nowrap" id="overlay">
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
</div>
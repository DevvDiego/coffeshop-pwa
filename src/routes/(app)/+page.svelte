<script>
	import Image from '$lib/components/Image.svelte';
	import happy_cup from '$lib/assets/svgs/happy_cup.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth.svelte';
	
	onMount(()=>{

        setTimeout(()=>{
          
            if(auth.user.isloggedIn){
                goto(resolve("/home"));
                
    		} else {
                goto(resolve("/login"));
                
            }
          
        }, 3000);

	});
	
</script>

<div
	class="
    sticky top-0 left-0
    h-lvh w-lvw
    bg-yellow-100
"
>
	<div
		class="
        absolute top-6/12 left-1/2 flex w-full
        -translate-x-1/2
        -translate-y-1/2
        flex-col flex-nowrap items-center
        "
	>
	    <!-- added pr-2 to accomodate icon -->
		<div class="w-2/8 pr-2 animate-bounce"> 
			<Image loadLazily={false} src={happy_cup} alt="Logo de carga" />
		</div>
		<!-- <h1 class="mt-3 text-center text-xl">
			Cafeteria Lirios
		</h1> -->
	</div>	
</div>

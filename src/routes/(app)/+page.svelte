<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth.svelte';
	
	onMount(()=>{
	    if(auth.user.isloggedIn){
            goto(resolve("/home"));
        } else {
            goto(resolve("/login"));
        }
	
	});
	
</script>

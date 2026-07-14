<script lang="ts">
  import { page } from '$app/state';

  import IconHome from '~icons/ion/home-outline';
  import IconHomeFilled from '~icons/ion/home';
  import IconTime from '~icons/ion/time-outline';
  import IconTimeFilled from '~icons/ion/time';
  import IconCart from '~icons/ion/cart-outline';
  import IconCartFilled from '~icons/ion/cart';
  // import IconNotifications from '~icons/ion/game-controller-outline';
  // import IconNotificationsFilled from '~icons/ion/game-controller';
  import IconPerson from '~icons/ion/person-outline';
  import IconPersonFilled from '~icons/ion/person';

  // pestañas con ruta, etiqueta e iconos
  const tabs = [
    {
      path: '/home',
      label: 'Inicio',
      icon: IconHome,
      activeIcon: IconHomeFilled
    },
    {
      path: '/cart',
      label: 'Carrito',
      icon: IconCart,
      activeIcon: IconCartFilled
    },
    {
      path: '/history',
      label: 'Pedidos',
      icon: IconTime,
      activeIcon: IconTimeFilled
    },
    {
      path: '/profile',
      label: 'Perfil',
      icon: IconPerson,
      activeIcon: IconPersonFilled
    }
  ];

  // Verificar la ruta activa
  function isActive(tabPath: string) {
      const current = page.url.pathname;
      if (tabPath === '/') return current === '/';
      return current.startsWith(tabPath);
  }
</script>

<nav
  class="
    fixed bottom-0 left-0 z-50 w-full
    h-16 px-2 pb-2 pt-1
    bg-white/90 backdrop-blur-md
    border-t border-gray-200
    rounded-t-3xl
    shadow-xl shadow-black
    transition-all duration-300
    ">
    <ul class="flex h-full w-full items-center justify-around">
        {#each tabs as tab}
            <li class="h-full w-16">
                
                <a
                    href={tab.path}
                    class="
                    flex h-full flex-col items-center justify-center gap-0.5
                    rounded-2xl px-1
                    transition-all duration-200 ease-out
                    active:scale-95
                    {isActive(tab.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600'}
                ">
                    
                    <span class="text-2xl leading-none">
                        {#if isActive(tab.path)}
                            <tab.activeIcon />
                        {:else}
                            <tab.icon />
                        {/if}
                    </span>
                    
                    <span class="text-[10px] font-medium leading-tight">
                        {tab.label}
                    </span>
                
                </a>
                
            </li>
        {/each}
    </ul>
</nav>
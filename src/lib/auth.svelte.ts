import { browser } from '$app/environment';

class AuthStore {
    user = $state<{ name: string; isloggedIn: boolean; iat: number; exp: number }>({
        name: '',
        isloggedIn: false,
        iat: 0,
        exp: 0
    });

    constructor() {
      if(!browser){
        return
      }
      
      const saved = localStorage.getItem('simulated_session');
      if (saved) {
          const parsedSession = JSON.parse(saved);
          
          // Validacion de expiracion (Convertimos el tiempo actual a segundos)
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (parsedSession.exp > currentTime) {
              // La sesion sigue siendo valida
              this.user = parsedSession;
          } else {
              //La sesion expiro, limpiamos el almacenamiento
              this.logout();
          }
      }
      
    }

    /**
     * Simula el inicio de sesion con tiempos de expiracion.
     * @param username Nombre del usuario
     * @param durationInSeconds Tiempo de vida de la sesion (por defecto 1 hora = 3600s)
     */
    login(username: string, durationInSeconds: number = 3600) {
        const nowInSeconds = Math.floor(Date.now() / 1000);

        this.user = {
            name: username,
            isloggedIn: true,
            iat: nowInSeconds,
            exp: nowInSeconds + durationInSeconds
        };
        
        this.save();
    }

    logout() {
        this.user = {
            name: '',
            isloggedIn: false,
            iat: 0,
            exp: 0
        };
        this.save();
    }

    private save() {
        if (browser) {
            localStorage.setItem('simulated_session', JSON.stringify(this.user));
        }
    }
}

// Exportamos la instancia única global
export const auth = new AuthStore();
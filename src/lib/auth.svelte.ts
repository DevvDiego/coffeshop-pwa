import { browser } from '$app/environment';
import bcrypt from 'bcryptjs';

interface UserState {
    name: string;
    passwordHash: string | null;
    isloggedIn: boolean;
    iat: number;
    exp: number;
}

class AuthStore {
    user = $state<UserState>({
        name: '',
        passwordHash: null,
        isloggedIn: false,
        iat: 0,
        exp: 0
    });

    constructor() {
        if (!browser) return;

        const saved = localStorage.getItem('simulated_session');
        if (saved) {
            const parsedSession: UserState = JSON.parse(saved);
            const currentTime = Math.floor(Date.now() / 1000);

            if (parsedSession.exp > currentTime) {
                this.user = parsedSession;
            } else {
                this.logout();
            }
        }
    }

    /**
     *  Registra/Guarda el hash del password
     */
    async register(username: string, plainPassword: string) {
        // Genera salt y obtiene el hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        this.user = {
            name: username,
            passwordHash: hashedPassword,
            isloggedIn: false,
            iat: 0,
            exp: 0
        };

        this.save();
        return true;
    }

    /**
    * Valida la contraseña comparando el texto plano con el Hash almacenado
    */
    async login(username: string, plainPassword: string, durationInSeconds: number = 3600): Promise<{ success: boolean; message?: string }> {
        // Verificar si existe algun usuario registrado
        if (!this.user.passwordHash || !this.user.name) {
            return { success: false, message: 'Credenciales invalidas.' };
        }
    
        // Comprobar que el nombre de usuario coincida
        if (this.user.name.trim().toLowerCase() !== username.trim().toLowerCase()) {
            return { success: false, message: 'Credenciales invalidas.' };
        }
    
        // Comprobar la contraseña contra el hash guardado con Bcrypt
        const isValidPassword = await bcrypt.compare(plainPassword, this.user.passwordHash);
    
        if (!isValidPassword) {
            return { success: false, message: 'Credenciales invalidas.' };
        }
    
        // Si todo es correcto, actualizamos estado e iniciamos sesión
        const nowInSeconds = Math.floor(Date.now() / 1000);
    
        this.user = {
            ...this.user,
            isloggedIn: true,
            iat: nowInSeconds,
            exp: nowInSeconds + durationInSeconds
        };
    
        this.save();
        return { success: true };
    }

    logout() {
        this.user = {
            name: '',
            passwordHash: null,
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

export const auth = new AuthStore();
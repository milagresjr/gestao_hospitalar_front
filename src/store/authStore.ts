
import { UserType } from '@/types';
import { redirect, useRouter } from 'next/navigation';
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    token: string | null;
    user: UserType | null;
    setToken: (token: string | null) => void;
    setUser: (user: any | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => {
                set({ token: null, user: null });
                if(typeof window !== 'undefined') {
                    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    // const router = useRouter();
                    // router.push('/signin');
                    redirect('/signin')
                }
            }
        }),
        { name: 'auth-store' } //salva no localStore
    )
);
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User, Session, AuthResponse } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: string | null;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    signInWithOtp: (email: string) => Promise<{ error: any }>;
    verifyOtp: (email: string, token: string) => Promise<AuthResponse>;
    signInWithGoogle: () => Promise<{ error: any }>;
    register: (name: string, email: string, password: string) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isLoading: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserRole = useCallback(async (userId: string, retries = 2) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.error('🔐 AuthContext - Error fetching role:', error);
                throw error;
            }

            if (!data && retries > 0) {
                // If role not found, it might be a race condition with the trigger. Wait and retry.
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUserRole(userId, retries - 1);
            }

            const roleName = data?.role || 'customer';

            setRole(roleName);
            setIsAdmin(roleName === 'admin');
        } catch (err: any) {
            console.error('🔐 AuthContext - Critical role fetch error:', err);
            // Default to customer if all retries fail
            setRole('customer');
            setIsAdmin(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (!mounted) return;

                if (currentSession?.user) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    // Non-blocking role fetch to speed up initial load
                    fetchUserRole(currentSession.user.id).finally(() => {
                        if (mounted) setIsLoading(false);
                    });
                } else {
                    setSession(null);
                    setUser(null);
                    setRole(null);
                    setIsAdmin(false);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('🔐 AuthContext - Initialization error:', error);
                setIsLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;

            // Simple equality check to avoid infinite loops if the session hasn't meaningfully changed
            if (currentSession?.user?.id === user?.id && currentSession?.access_token === session?.access_token) {
                return;
            }

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                // Don't await here to prevent blocking state updates
                fetchUserRole(currentSession.user.id).finally(() => {
                    if (mounted) setIsLoading(false);
                });
            } else {
                setSession(null);
                setUser(null);
                setRole(null);
                setIsAdmin(false);
                setIsLoading(false);
            }
        });

        initAuth();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUserRole, user?.id, session?.access_token]);

    const login = useCallback(async (email: string, password: string) => {
        const result = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (result.error) {
            if (result.error.status === 429) {
                toast.error("Too many attempts", {
                    description: "Please wait 15-30 minutes or try a different network/VPN."
                });
            } else {
                toast.error("Login failed", { description: result.error.message });
            }
        } else if (result.data.user) {
            await fetchUserRole(result.data.user.id);
            toast.success("Welcome back!");
        }

        return result;
    }, [fetchUserRole]);

    const signInWithOtp = useCallback(async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            toast.error("Error sending OTP", { description: error.message });
        } else {
            toast.success("Magic link sent! Check your email.");
        }

        return { error };
    }, []);

    const verifyOtp = useCallback(async (email: string, token: string) => {
        const result = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (result.error) {
            toast.error("Invalid code", { description: result.error.message });
        } else if (result.data.user) {
            await fetchUserRole(result.data.user.id);
            toast.success("Verified successfully!");
        }

        return result;
    }, [fetchUserRole]);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            toast.error("Google sign in failed", {
                description: error.message
            });
        }

        return { error };
    }, []);


    const register = useCallback(async (name: string, email: string, password: string) => {
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });

        if (result.error) {
            if (result.error.status === 429) {
                toast.error("Rate limit exceeded", {
                    description: "Please wait a few minutes before trying again or use a different network."
                });
            } else {
                toast.error("Registration failed", { description: result.error.message });
            }
        } else if (result.data.user) {
            toast.success("Account created!");
        }

        return result;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setRole(null);
        setIsAdmin(false);
        toast.info("Logged out");
    }, []);

    const value = useMemo(() => ({
        user,
        session,
        role,
        isAdmin,
        login,
        signInWithOtp,
        verifyOtp,
        signInWithGoogle,
        register,
        logout,
        isLoading,
        loading: isLoading
    }), [user, session, role, isAdmin, login, signInWithOtp, verifyOtp, signInWithGoogle, register, logout, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session, AuthResponse } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';

interface AdminAuthContextType {
    user: User | null;
    session: Session | null;
    userRole: string | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    isAdmin: () => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    // Initialize role from local storage to prevent flickering/unnecessary logouts
    const [userRole, setUserRole] = useState<string | null>(() => {
        return localStorage.getItem('zero_fashion_admin_role');
    });
    const [loading, setLoading] = useState(true);

    const isFetchingRole = useRef<string | null>(null);

    const fetchUserRole = useCallback(async (userId: string) => {
        // Prevent concurrent identical fetches
        if (isFetchingRole.current === userId) return;
        isFetchingRole.current = userId;

        try {
            console.log(`🔐 AdminAuthContext - Fetching role for: ${userId}`);
            const { data, error } = await supabaseAdmin
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                // Ignore AbortErrors in logs - checking both code and name/message
                const isAbort = error.name === 'AbortError' || error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error('🔐 AdminAuthContext - Error fetching role:', error);
                } else {
                    console.log('🔐 AdminAuthContext - Role fetch aborted (silent)');
                }
            } else {
                const roleData = data as any;
                const role = roleData ? roleData.role : null;
                console.log(`🔐 AdminAuthContext - Role fetched: ${role} for ${userId}`);
                setUserRole(role);
                if (role) {
                    localStorage.setItem('zero_fashion_admin_role', role);
                } else {
                    localStorage.removeItem('zero_fashion_admin_role');
                }
            }
        } catch (err: any) {
            const isAbort = err?.name === 'AbortError' || err?.message?.includes('AbortError');
            if (!isAbort) {
                console.error('🔐 AdminAuthContext - Critical failure fetching role:', err);
            }
        } finally {
            isFetchingRole.current = null;
        }
    }, []);

    const userRef = useRef<User | null>(null);

    useEffect(() => {
        let mounted = true;

        const handleAuthChange = async (event: string, currentSession: Session | null) => {
            console.log(`🔐 AdminAuthContext - Flow [${event}] for ${currentSession?.user?.email || 'none'}`);

            if (!mounted) return;

            if (currentSession?.user) {
                const isNewUser = currentSession.user.id !== userRef.current?.id;

                if (isNewUser) {
                    setLoading(true);
                    setSession(currentSession);
                    setUser(currentSession.user);
                    userRef.current = currentSession.user;

                    await fetchUserRole(currentSession.user.id);
                    if (mounted) setLoading(false);
                } else {
                    setSession(currentSession);
                    // If we have a user but no role yet (e.g. init failure), try again
                    if (!userRole && mounted) {
                        await fetchUserRole(currentSession.user.id);
                    }
                    if (mounted) setLoading(false);
                }
            } else {
                setSession(null);
                setUser(null);
                userRef.current = null;
                setUserRole(null);
                localStorage.removeItem('zero_fashion_admin_role');
                if (mounted) setLoading(false);
            }
        };

        // Initialize session and set up listener
        const init = async () => {
            try {
                const { data: { session: initialSession }, error } = await supabaseAdmin.auth.getSession();
                if (error) throw error;
                if (mounted) {
                    await handleAuthChange('INITIAL_SESSION', initialSession);
                }
            } catch (err: any) {
                const isAbort = err?.name === 'AbortError' || err?.message?.includes('AbortError');
                if (!isAbort) {
                    console.error('🔐 AdminAuthContext - Init error:', err);
                }
                if (mounted) setLoading(false);
            }
        };

        const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((event, currentSession) => {
            handleAuthChange(event, currentSession);
        });

        init();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUserRole, userRole]);

    const signIn = useCallback(async (email: string, password: string) => {
        return await supabaseAdmin.auth.signInWithPassword({ email, password });
    }, []);

    const signOut = useCallback(async () => {
        try {
            await supabaseAdmin.auth.signOut();
            setUser(null);
            setSession(null);
            userRef.current = null;
            setUserRole(null);
            localStorage.removeItem('zero_fashion_admin_role');
        } catch (error) {
            console.error('🔐 AdminAuthContext - Signout error:', error);
        }
    }, []);

    const isAdmin = useCallback(() => userRole === 'admin', [userRole]);

    const value = React.useMemo(() => ({
        user,
        session,
        userRole,
        loading,
        signIn,
        signOut,
        isAdmin
    }), [user, session, userRole, loading, signIn, signOut, isAdmin]);

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

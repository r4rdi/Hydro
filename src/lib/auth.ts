import { supabase } from './supabaseClient';

export async function signUpUser(email: string, pass: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) throw error;

    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'owner',
        });
    }

    return data;
}

export async function signInUser(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });

    if (error) throw error;

    return data;
}

export async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
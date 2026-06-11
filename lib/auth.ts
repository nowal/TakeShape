'use client';

import {
  hasTakeShapeAppSupabaseBrowserEnv,
  takeshapeAppSupabaseBrowser,
} from '@/lib/supabase/takeshape-app-browser';

type SupabaseUser = {
  id: string;
  email?: string;
};

export type User = {
  uid: string;
  email: string | null;
};

type AuthStateCallback = (user: User | null) => void;

const toUser = (user: SupabaseUser | null | undefined): User | null => {
  if (!user?.id) return null;
  return {
    uid: user.id,
    email: user.email || null,
  };
};

class AuthCompat {
  currentUser: User | null = null;

  onAuthStateChanged(callback: AuthStateCallback) {
    if (!hasTakeShapeAppSupabaseBrowserEnv()) {
      this.currentUser = null;
      callback(null);
      return () => {};
    }

    const prime = async () => {
      try {
        const { data, error } =
          await takeshapeAppSupabaseBrowser.auth.getSession();
        if (error) {
          this.currentUser = null;
          callback(null);
          return;
        }
        this.currentUser = toUser(
          (data.session?.user as SupabaseUser | null) ?? null
        );
        callback(this.currentUser);
      } catch {
        this.currentUser = null;
        callback(null);
      }
    };

    void prime();

    try {
      const { data } = takeshapeAppSupabaseBrowser.auth.onAuthStateChange(
        (_event, session) => {
          this.currentUser = toUser(
            (session?.user as SupabaseUser | null) ?? null
          );
          callback(this.currentUser);
        }
      );

      return () => data.subscription.unsubscribe();
    } catch {
      this.currentUser = null;
      callback(null);
      return () => {};
    }
  }
}

const singleton = new AuthCompat();

export const getAuth = (_app?: unknown) => singleton;

export const onAuthStateChanged = (
  auth: AuthCompat,
  nextOrObserver: AuthStateCallback,
  error?: (error: Error) => void
) => {
  try {
    return auth.onAuthStateChanged(nextOrObserver);
  } catch (err) {
    if (error && err instanceof Error) {
      error(err);
    }
    return () => {};
  }
};

export const signInWithEmailAndPassword = async (
  _auth: AuthCompat,
  email: string,
  password: string
) => {
  const { data, error } = await takeshapeAppSupabaseBrowser.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  const current = toUser(data.user as SupabaseUser | null);
  if (!current) {
    throw new Error('Sign-in failed: user is missing');
  }
  singleton.currentUser = current;
  return { user: current };
};

export const createUserWithEmailAndPassword = async (
  _auth: AuthCompat,
  email: string,
  password: string
) => {
  const { data, error } = await takeshapeAppSupabaseBrowser.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  const current = toUser(data.user as SupabaseUser | null);
  if (!current) {
    throw new Error(
      'Sign-up created no session user. Confirm email may be required in Supabase Auth settings.'
    );
  }
  singleton.currentUser = current;
  return { user: current };
};

export const signOut = async (_auth: AuthCompat) => {
  const { error } = await takeshapeAppSupabaseBrowser.auth.signOut();
  if (error) throw error;
  singleton.currentUser = null;
};

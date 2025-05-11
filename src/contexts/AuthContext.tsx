
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for social users

// Superuser credentials
const SUPERUSER_USERNAME = "serpOS@GI";
const SUPERUSER_INITIAL_PASSWORD = "12345678"; // In a real app, this would be handled securely

interface User {
  id: string;
  username: string;
  role: 'superuser' | 'user' | 'guest';
  provider?: 'google' | 'microsoft' | 'yahoo' | 'credentials';
}

type AuthStatus = 
  | 'loading'
  | 'needs_mode_selection'
  | 'needs_onboarding'
  | 'needs_login'
  | 'authenticated'
  | 'ghost_mode';

type SocialProvider = 'google' | 'microsoft' | 'yahoo';

interface AuthContextType {
  currentUser: User | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  appMode: 'persistent' | 'ghost' | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  onboardUser: (username: string, pass: string) => Promise<boolean>;
  selectMode: (mode: 'persistent' | 'ghost') => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  resetToModeSelection: () => void;
  switchToOnboarding: () => void;
  signInWithProvider: (provider: SocialProvider) => Promise<boolean>; // New method for social login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  APP_MODE: 'binaryblocksphere_appMode',
  CURRENT_USER: 'binaryblocksphere_currentUser', 
  USERS: 'binaryblocksphere_users', 
  ONBOARDING_COMPLETE: 'binaryblocksphere_onboardingComplete',
  SUPERUSER_PASSWORD: 'binaryblocksphere_superuserPassword'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [appMode, setAppMode] = useState<'persistent' | 'ghost' | null>(null);

  const loadSuperuserPassword = (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPERUSER_PASSWORD) || SUPERUSER_INITIAL_PASSWORD;
    }
    return SUPERUSER_INITIAL_PASSWORD;
  };

  const saveSuperuserPassword = (newPass: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUPERUSER_PASSWORD, newPass);
    }
  };

  const loadUsers = (): Record<string, string> => {
    if (typeof window !== 'undefined') {
      const usersJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : {};
    }
    return {};
  };

  const saveUsers = (users: Record<string, string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure uuid is loaded on client
      import('uuid').then(uuid => {
        // console.log("UUID library loaded for client-side generation.");
      });

      setIsLoading(true);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      setAppMode(storedMode);

      if (storedMode === 'persistent') {
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        if (storedUserJson) {
          const user = JSON.parse(storedUserJson) as User;
          setCurrentUser(user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('needs_login');
        }
      } else if (storedMode === 'ghost') {
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest', provider: 'credentials' });
        setAuthStatus('ghost_mode');
      } else {
        setAuthStatus('needs_mode_selection');
      }
      setIsLoading(false);
    }
  }, []);

  const selectMode = (mode: 'persistent' | 'ghost') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APP_MODE, mode);
      setAppMode(mode);
      if (mode === 'ghost') {
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest', provider: 'credentials' });
        setAuthStatus('ghost_mode');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      } else { 
        localStorage.setItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETE, 'true'); 
        setAuthStatus('needs_login');
      }
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    let user: User | null = null;
    const users = loadUsers();
    const superuserPassword = loadSuperuserPassword();

    if (username === SUPERUSER_USERNAME && pass === superuserPassword) {
      user = { id: SUPERUSER_USERNAME, username, role: 'superuser', provider: 'credentials' };
    } else if (users[username] && users[username] === pass) {
      user = { id: username, username, role: 'user', provider: 'credentials' };
    }

    if (user) {
      setCurrentUser(user);
      setAuthStatus('authenticated');
      if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
      toast({ title: "Login Successful", description: `Welcome, ${user.username}!` });
      return true;
    }
    toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    return false;
  };

  const onboardUser = async (username: string, pass: string): Promise<boolean> => {
    const users = loadUsers();
    if (username === SUPERUSER_USERNAME) {
      toast({ title: "Onboarding Failed", description: "This username is reserved.", variant: "destructive" });
      return false;
    }
    if (users[username]) {
      toast({ title: "Onboarding Failed", description: "Username already exists.", variant: "destructive" });
      return false;
    }

    users[username] = pass;
    saveUsers(users);
        
    const newUser: User = { id: username, username, role: 'user', provider: 'credentials' };
    setCurrentUser(newUser);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
    toast({ title: "Onboarding Successful", description: `Welcome, ${username}! Your account has been created.` });
    return true;
  };

  const signInWithProvider = async (provider: SocialProvider): Promise<boolean> => {
    // This is a STUBBED implementation for social login.
    // In a real app, you would integrate with an OAuth library like NextAuth.js
    // or directly with the provider's SDK.
    toast({ title: `Simulating Sign-in`, description: `Attempting to sign in with ${provider}...` });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if uuid is available
    if (typeof window === 'undefined' || !window.uuidv4) {
        // Fallback or handle server-side, though this should ideally be client-side.
        // For this stub, we'll just make a simpler ID.
        console.warn("uuidv4 not available on window, using simpler ID for social user.");
    }
    const userId = typeof window !== 'undefined' && window.uuidv4 ? window.uuidv4() : `social-${provider}-${Date.now()}`;


    const user: User = {
      id: userId,
      username: `${provider.charAt(0).toUpperCase() + provider.slice(1)}User_${userId.substring(0, 4)}`,
      role: 'user',
      provider: provider,
    };

    setCurrentUser(user);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    toast({ title: "Sign-in Successful", description: `Welcome, ${user.username}! (via ${provider})` });
    return true;
  };


  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      if (storedMode === 'persistent') {
         setAuthStatus('needs_login'); 
      } else if (storedMode === 'ghost') { 
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest', provider: 'credentials' });
        setAuthStatus('ghost_mode');
      } else { 
        setAuthStatus('needs_mode_selection');
      }
    }
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser || currentUser.provider !== 'credentials') {
      toast({ title: "Error", description: currentUser?.provider !== 'credentials' ? "Password change is not available for social logins." : "No user logged in.", variant: "destructive" });
      return false;
    }

    const users = loadUsers();
    const currentSuperuserPassword = loadSuperuserPassword();

    if (currentUser.role === 'superuser') {
      if (currentUser.username === SUPERUSER_USERNAME && oldPass === currentSuperuserPassword) {
        saveSuperuserPassword(newPass);
        toast({ title: "Password Changed", description: "Superuser password updated successfully." });
        return true;
      }
    } else if (users[currentUser.username] && users[currentUser.username] === oldPass) {
      users[currentUser.username] = newPass;
      saveUsers(users);
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      return true;
    }
    
    toast({ title: "Password Change Failed", description: "Incorrect old password.", variant: "destructive" });
    return false;
  };

  const resetToModeSelection = useCallback(() => {
    if (typeof window !== 'undefined') {
        setCurrentUser(null);
        setAppMode(null);
        setAuthStatus('needs_mode_selection');
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
    toast({ title: "System Reset", description: "System state cleared. Please select an operating mode." });
  }, []);

  const switchToOnboarding = () => {
    setAuthStatus('needs_onboarding');
  };

  return (
    <AuthContext.Provider value={{ currentUser, authStatus, isLoading, appMode, login, logout, onboardUser, selectMode, changePassword, resetToModeSelection, switchToOnboarding, signInWithProvider }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Make uuidv4 available on window for client-side use after dynamic import
if (typeof window !== 'undefined') {
  import('uuid').then(uuid => {
    (window as any).uuidv4 = uuid.v4;
  });
}

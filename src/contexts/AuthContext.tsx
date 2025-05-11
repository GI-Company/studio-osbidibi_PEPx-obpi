
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// Superuser credentials
const SUPERUSER_USERNAME = "serpOS@GI";
const SUPERUSER_INITIAL_PASSWORD = "12345678"; // In a real app, this would be handled securely

interface User {
  id: string;
  username: string;
  role: 'superuser' | 'user' | 'guest';
  // passwordHash?: string; // For simulation, we'll store password directly in localStorage if needed
}

type AuthStatus = 
  | 'loading'
  | 'needs_mode_selection'
  | 'needs_onboarding'
  | 'needs_login'
  | 'authenticated'
  | 'ghost_mode';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  APP_MODE: 'binaryblocksphere_appMode',
  CURRENT_USER: 'binaryblocksphere_currentUser', // For persistent user, not ghost
  USERS: 'binaryblocksphere_users', // Stores all created users { [username]: password }
  ONBOARDING_COMPLETE: 'binaryblocksphere_onboardingComplete', // For the instance, not per user
  SUPERUSER_PASSWORD: 'binaryblocksphere_superuserPassword' // For superuser password changes
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
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      setAppMode(storedMode);

      if (storedMode === 'persistent') {
        const onboardingComplete = localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        if (storedUserJson) {
          const user = JSON.parse(storedUserJson) as User;
          setCurrentUser(user);
          setAuthStatus('authenticated');
        } else if (!onboardingComplete) {
          setAuthStatus('needs_onboarding');
        } else {
          setAuthStatus('needs_login');
        }
      } else if (storedMode === 'ghost') {
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest' });
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
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest' });
        setAuthStatus('ghost_mode');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        // Ghost mode should not persist user data across sessions typically
      } else { // persistent
        const onboardingComplete = localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
        if (!onboardingComplete) {
          setAuthStatus('needs_onboarding');
        } else {
          setAuthStatus('needs_login');
        }
      }
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    let user: User | null = null;
    const users = loadUsers();
    const superuserPassword = loadSuperuserPassword();

    if (username === SUPERUSER_USERNAME && pass === superuserPassword) {
      user = { id: SUPERUSER_USERNAME, username, role: 'superuser' };
    } else if (users[username] && users[username] === pass) {
      user = { id: username, username, role: 'user' };
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
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    }
    
    // Automatically log in the new user
    const newUser: User = { id: username, username, role: 'user' };
    setCurrentUser(newUser);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
    toast({ title: "Onboarding Successful", description: `Welcome, ${username}! Your account has been created.` });
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      if (storedMode === 'persistent') {
        const onboardingComplete = localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
        if (!onboardingComplete) {
           setAuthStatus('needs_onboarding'); // Should ideally not happen if user was logged in
        } else {
           setAuthStatus('needs_login');
        }
      } else if (storedMode === 'ghost') { // Reset ghost mode to initial ghost user state
        setCurrentUser({ id: 'ghost', username: 'GhostUser', role: 'guest' });
        setAuthStatus('ghost_mode');
      } else { // No mode selected or cleared
        setAuthStatus('needs_mode_selection');
      }
    }
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) {
      toast({ title: "Error", description: "No user logged in.", variant: "destructive" });
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
        // Clear all related local storage to truly reset
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
    toast({ title: "System Reset", description: "System state cleared. Please select an operating mode." });
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, authStatus, isLoading, appMode, login, logout, onboardUser, selectMode, changePassword, resetToModeSelection }}>
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

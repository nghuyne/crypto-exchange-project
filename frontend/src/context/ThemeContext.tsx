import { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme('dark');
        }
    }, []);

    const applyTheme = (newTheme: 'dark' | 'light') => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

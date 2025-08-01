
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface AuthViewProps {
    onLogin: (email: string, password: string) => boolean;
    onSignUp: (userData: Omit<User, 'id' | 'role'>) => boolean;
    isInitialSignUp: boolean;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignUp, isInitialSignUp }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(isInitialSignUp ? 'signup' : 'login');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset fields when mode changes
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    }, [mode]);
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };
    
    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError('');
        // onSignUp will show a toast on failure from App.tsx
        onSignUp({ name, email, password });
    };

    const cardVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4">
            <motion.div
                key={mode}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center">
                    <div className="mx-auto bg-emerald-600 text-white text-3xl font-bold rounded-xl w-20 h-20 flex items-center justify-center mb-4">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isInitialSignUp ? 'Welcome to KenPOS™' : (mode === 'login' ? 'Welcome Back!' : 'Create Your Account')}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isInitialSignUp && mode === 'signup' 
                            ? 'Set up the first administrator for your new business.'
                            : 'Sign in to your KenPOS™ account.'
                        }
                    </p>
                </div>

                {mode === 'login' ? (
                     <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        <div>
                            <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Sign in</motion.button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignUpSubmit} className="mt-8 space-y-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                        </div>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        <div>
                            <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full flex justify-center mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Create Account</motion.button>
                        </div>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-slate-500">
                    {isInitialSignUp ? (
                         <>
                            {mode === 'login' ? "Need to create the admin account?" : "Already have an account?"}
                            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="ml-1 font-semibold text-emerald-600 hover:text-emerald-500">
                               {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </>
                    ) : (
                        "Contact your administrator to create an account."
                    )}
                </p>
            </motion.div>
        </div>
    );
};

export default AuthView;
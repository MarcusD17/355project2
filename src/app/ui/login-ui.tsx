import React, { useState } from 'react';
import { login, signup } from '@/app/auth-functions';

const AuthForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(email, password);
                alert('Logged in successfully!');
            } else {
                await signup(email, password);
                alert('Account created successfully!');
            }
        } catch (error) {
            console.error(error);
            alert('Authentication failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            <p onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </p>
        </form>
    );
};

export default AuthForm;

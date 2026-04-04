import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Languages
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(phone, password);
            navigate('/dashboard');
        } catch (err) {
            setError("Invalid credentials. Try 9999999999 / password123");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            
            {/* Logo / Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-10"
            >
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-indigo">D</div>
                <h1 className="font-display font-bold text-3xl tracking-tight text-white">DukaanDost</h1>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="card shadow-2xl border-slate-800 bg-slate-900 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2 text-white">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Sign in to manage your shop transactions.</p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm font-medium flex items-center gap-2"
                            >
                                <ShieldCheck size={18} /> {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="form-group">
                                <label className="label">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="tel" 
                                        className="input-pro pl-10" 
                                        placeholder="Enter 10-digit phone"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="flex justify-between mb-2">
                                    <label className="label mb-0">Password</label>
                                    <a href="#" className="text-xs text-indigo-500 font-bold hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="password" 
                                        className="input-pro pl-10" 
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-full mt-2"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={18} className="ml-2" />
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account? <Link to="/register" className="text-indigo-500 font-bold hover:underline">Create Store</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-8 text-slate-600 grayscale opacity-50">
                    <div className="flex items-center gap-2"><ShieldCheck size={16} /> Secure Auth</div>
                    <div className="flex items-center gap-2"><Languages size={16} /> Multi-language</div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, 
    Phone, 
    Lock, 
    Store, 
    ArrowRight, 
    ShieldCheck, 
    Globe
} from 'lucide-react';
import api from '../../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        shopName: "",
        languagePref: "en"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.auth.register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            
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
                            <h2 className="text-2xl font-bold mb-2 text-white">Create Your Store</h2>
                            <p className="text-slate-400 text-sm">Join thousands of smart shop owners.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="label">Owner Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        name="name"
                                        type="text" 
                                        className="input-pro pl-10" 
                                        placeholder="Full Name"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        name="phone"
                                        type="tel" 
                                        className="input-pro pl-10" 
                                        placeholder="10-digit number"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Shop Name</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        name="shopName"
                                        type="text" 
                                        className="input-pro pl-10" 
                                        placeholder="e.g. Ramesh Kirana"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        name="password"
                                        type="password" 
                                        className="input-pro pl-10" 
                                        placeholder="Minimum 6 characters"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-full mt-4"
                                disabled={loading}
                            >
                                {loading ? "Creating Account..." : "Register Store"} <ArrowRight size={18} className="ml-2" />
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            Already have a store? <Link to="/login" className="text-indigo-500 font-bold hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;

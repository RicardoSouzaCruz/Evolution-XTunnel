/**
 * Login & Signup Component for EVOLUTION XTUNNEL
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, User as UserIcon, ShieldAlert, ArrowRight, Eye, EyeOff, Cpu, Zap, Activity } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegisterUser: (newUser: User) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pwaInstallable?: boolean;
  onInstallPWA?: () => void;
}

export default function LoginScreen({ 
  onLoginSuccess, 
  allUsers, 
  onRegisterUser, 
  theme, 
  onToggleTheme,
  pwaInstallable = false,
  onInstallPWA
}: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (mail: string) => {
    return /\S+@\S+\.\S+/.test(mail);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos do terminal.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Insira um e-mail de operador válido.');
      return;
    }

    setIsLoading(true);

    // Simulate short network delay for premium feel
    setTimeout(() => {
      setIsLoading(false);
      // Check if user exists (mock check)
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        // For convenience in premium demo, allow easy account registration
        if (password.length >= 4) {
          const newUser: User = {
            id: `user_${Date.now()}`,
            name: email.split('@')[0].toUpperCase(),
            email: email,
            credits: 20, // Initial free reseller credits
            rank: allUsers.length + 1,
            avatar: '⚡',
            role: 'reseller',
            isReseller: true,
            isAdmin: false,
          };
          onRegisterUser(newUser);
          onLoginSuccess(newUser);
        } else {
          setError('Credenciais inválidas. Use qualquer e-mail de acesso rápido abaixo ou crie sua conta com uma senha de no mínimo 4 caracteres!');
        }
      }
    }, 850);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setError('Preencha os dados de codinome, e-mail e chave de acesso.');
      return;
    }

    if (!validateEmail(registerEmail)) {
      setError('E-mail de rede inválido.');
      return;
    }

    if (registerPassword.length < 4) {
      setError('A chave de acesso deve conter no mínimo 4 caracteres.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('A confirmação da chave de acesso não coincide.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      // Check duplicate
      const duplicate = allUsers.some(u => u.email.toLowerCase() === registerEmail.toLowerCase());
      if (duplicate) {
        setError('Este e-mail corporativo já está associado a outro operador XTUNNEL.');
        return;
      }

      const avatarList = ['⚡', '👑', '👾', '🚀', '🔮', '💎', '🔥', '🛡️'];
      const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: registerName,
        email: registerEmail,
        credits: 15,
        rank: allUsers.length + 1,
        avatar: randomAvatar,
        role: 'reseller',
        isReseller: true,
        isAdmin: false,
      };

      onRegisterUser(newUser);
      setSuccess('Identidade de revendedor registrada! Inicializando painel XTUNNEL...');
      
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
    }, 900);
  };

  // Helper to quickly fill in credentials
  const fillMockUser = (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword('super123');
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-cyber-bg overflow-hidden cyber-grid">
      
      {/* Glow Rings background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-neon-purple/20 rounded-full blur-[2px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-dashed border-neon-green/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-neon-yellow/15 rounded-full" />
        
        {/* Neon laser scanlines */}
        <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-gradient-to-b from-transparent via-neon-purple/30 to-transparent" />
        <div className="absolute top-0 bottom-0 right-1/4 w-[1px] bg-gradient-to-b from-transparent via-neon-green/25 to-transparent" />
      </div>

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-cyber-surface/90 backdrop-blur-xl border border-cyber-border rounded-2xl p-6 md:p-8 shadow-2xl glow-purple"
      >
        {/* Neon top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-purple via-neon-green to-neon-yellow rounded-t-2xl" />

        {/* EVOLUTION Branding Header */}
        <div className="text-center mb-8">
          
          <div className="flex justify-center mb-2">
            <span className="text-[10px] bg-neon-purple/20 border border-neon-purple/60 text-neon-yellow font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono text-shadow-yellow animate-pulse">
              ★ SYSTEM SECURITY SHIELD ★
            </span>
          </div>

          <p className="text-[11px] text-neon-green font-display font-black tracking-[0.3em] uppercase mb-1 flex items-center justify-center gap-1.5 font-mono text-shadow-green">
            <Cpu className="w-3.5 h-3.5" /> EVOLUTION GROUP
          </p>

          <h1 className="font-display text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-neon-yellow to-neon-green bg-clip-text text-transparent transform scale-y-110">
            XTUNNEL
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Gerenciador Avançado VPN, SSH & Revenda
          </p>
        </div>

        {/* Tab selector with glowing borders */}
        <div className="flex bg-cyber-bg/95 p-1 rounded-xl border border-cyber-border mb-6">
          <button
            id="login-tab-btn"
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wider ${
              isLogin 
                ? 'bg-neon-purple text-white shadow-lg glow-purple font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Acessar Painel
          </button>
          <button
            id="register-tab-btn"
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wider ${
              !isLogin 
                ? 'bg-neon-green text-slate-950 shadow-lg glow-green font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar Revenda
          </button>
        </div>

        {/* Errors & Success feedback with neon glow boxes */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/50 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mb-5 select-none"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400 animate-bounce" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-neon-green/10 border border-neon-green/50 text-neon-green text-xs p-3.5 rounded-xl flex items-center gap-2.5 mb-5"
            >
              <Shield className="w-4 h-4 shrink-0 text-shadow-green" />
              <span className="font-bold text-shadow-green">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms Container */}
        <div className="min-h-[290px]">
          {isLogin ? (
            <form key="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  Credencial de Acesso (E-mail)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-purple" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reserva@xtunnel.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/40 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                    Chave Críptica de Segurança
                  </label>
                  <button 
                    type="button" 
                    className="text-[10px] text-neon-yellow hover:underline focus:outline-none font-mono"
                    onClick={() => setError('Chave padrão de teste para e-mails salvos: super123')}
                  >
                    Dica de Chave
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua password corporativa"
                    className="w-full pl-11 pr-11 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/40 transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-neon-purple" /> : <Eye className="w-4 h-4 text-neon-green" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 select-none">
                <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="rounded border-cyber-border bg-cyber-bg checked:bg-neon-purple focus:ring-0 accent-neon-purple"
                  />
                  Manter Sessão Conectada
                </label>
                <span className="text-[10px] text-neon-yellow flex items-center gap-1 font-mono font-bold text-shadow-yellow animate-pulse">
                  <Activity className="w-3 h-3 text-shadow-yellow" /> LIVE GATEWAY
                </span>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon-purple hover:bg-neon-purple-hover text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all focus:outline-none flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4 h-11 cursor-pointer glow-purple"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Autenticar Operador <ArrowRight className="w-4 h-4 text-neon-green" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form key="register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  Nome do Distribuidor / Operador
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-yellow" />
                  <input
                    id="register-name-input"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Ex: Pedro Revendas VPN"
                    className="w-full pl-11 pr-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow/40 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  E-mail do Revendedor
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-purple" />
                  <input
                    id="register-email-input"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="revenda@xtunnel.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/40 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                    Senha Secreta
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                    <input
                      id="register-password-input"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="*****"
                      className="w-full pl-11 pr-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/40 transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-yellow" />
                    <input
                      id="register-confirm-password-input"
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="*****"
                      className="w-full pl-11 pr-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow/40 transition-all font-semibold animate-pulse"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon-green hover:bg-neon-green-hover text-slate-950 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all focus:outline-none flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4 h-11 cursor-pointer glow-green"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Registrar Revenda <Zap className="w-4 h-4 fill-current text-slate-950 animate-pulse" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Quick test accounts container with premium neon indicators */}
        {isLogin && (
          <div className="mt-8 border-t border-cyber-border/80 pt-4 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Carregamento Rápido de Testes (Acesso Direto)
            </span>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <button
                type="button"
                onClick={() => fillMockUser('ricardo@sport.com')}
                className="text-[10px] bg-cyber-bg hover:bg-neon-purple/10 border border-cyber-border hover:border-neon-purple py-1 px-3 rounded-lg text-slate-300 font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-sm animate-pulse" />
                 Ricardo (Admin)
              </button>
              <button
                type="button"
                onClick={() => fillMockUser('henrique@sport.com')}
                className="text-[10px] bg-cyber-bg hover:bg-neon-green/10 border border-cyber-border hover:border-neon-green py-1 px-3 rounded-lg text-slate-300 font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-sm animate-pulse" />
                 Henrique (Revenda)
              </button>
              <button
                type="button"
                onClick={() => fillMockUser('ana@sport.com')}
                className="text-[10px] bg-cyber-bg hover:bg-neon-yellow/10 border border-cyber-border hover:border-neon-yellow py-1 px-3 rounded-lg text-slate-300 font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-neon-yellow shadow-sm animate-pulse" />
                 Ana (Revenda)
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating PWA Install Notification */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 w-full max-w-sm px-4">
        <div className="bg-[#100a22]/95 border border-neon-green/45 backdrop-blur-md rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs neon-border-green animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-1.5 bg-neon-green/10 text-neon-green rounded border border-neon-green/20 font-mono font-black text-[9px] select-none animate-pulse">
              PWA APP
            </div>
            <div>
              <p className="font-bold text-white uppercase text-[10px]">Instalar APP XTunnel</p>
              <p className="text-[9px] text-slate-400 leading-none mt-0.5">Rode na tela inicial sem precisar de VPS/Store!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onInstallPWA}
            className="px-3.5 py-1.5 bg-neon-green text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-neon-green-hover transition-all animate-bounce cursor-pointer shadow-lg glow-green shrink-0"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}

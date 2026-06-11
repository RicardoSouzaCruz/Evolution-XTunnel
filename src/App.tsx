/**
 * Main application entry point for EVOLUTION XTUNNEL.
 * Handles state persistence, mock calculations for traffic, credit subtraction, and fast tests generators.
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, SshServer, SshAccount, ConnectionPayload, LogLine } from './types';
import { INITIAL_USERS, INITIAL_SERVERS, INITIAL_ACCOUNTS, INITIAL_PAYLOADS, INITIAL_LOGS } from './mockData';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('xtunnel_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  // Apply theme to document documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('xtunnel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // App-wide state loads from storage or falls back to initialized lists
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('xtunnel_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [servers, setServers] = useState<SshServer[]>(() => {
    const saved = localStorage.getItem('xtunnel_servers');
    return saved ? JSON.parse(saved) : INITIAL_SERVERS;
  });

  const [accounts, setAccounts] = useState<SshAccount[]>(() => {
    const saved = localStorage.getItem('xtunnel_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [payloads, setPayloads] = useState<ConnectionPayload[]>(() => {
    const saved = localStorage.getItem('xtunnel_payloads');
    return saved ? JSON.parse(saved) : INITIAL_PAYLOADS;
  });

  const [logs, setLogs] = useState<LogLine[]>(() => {
    const saved = localStorage.getItem('xtunnel_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Keep current active session synchronized
  useEffect(() => {
    const savedSession = localStorage.getItem('xtunnel_session');
    if (savedSession) {
      try {
        const userObj = JSON.parse(savedSession) as User;
        const freshUser = users.find(u => u.id === userObj.id) || userObj;
        setCurrentUser(freshUser);
      } catch (e) {
        console.error('Session restoration failed', e);
      }
    }
  }, [users]);

  // Persists
  useEffect(() => {
    localStorage.setItem('xtunnel_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('xtunnel_servers', JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    localStorage.setItem('xtunnel_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('xtunnel_payloads', JSON.stringify(payloads));
  }, [payloads]);

  useEffect(() => {
    localStorage.setItem('xtunnel_logs', JSON.stringify(logs));
  }, [logs]);

  // Append new console logs dynamically for that interactive look
  const pushLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const timeStr = new Date().toLocaleTimeString('pt-BR');
    const newLine: LogLine = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: timeStr,
      type,
      message,
    };
    setLogs(prev => [newLine, ...prev.slice(0, 49)]); // Keep last 50 lines
  };

  // Helper system to tick active bandwidth & mock latency updates on interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Mock random active accounts consuming slight amounts of internet traffic (MBs)
      setAccounts(prev => prev.map(acc => {
        if (acc.status === 'active') {
          // Increment random payload size
          const usageIncrement = parseFloat((Math.random() * 0.12).toFixed(3));
          return {
            ...acc,
            bandwidthUsed: parseFloat((acc.bandwidthUsed + usageIncrement).toFixed(1))
          };
        }
        return acc;
      }));

      // Random jitter on healthy server latency + minor swings in connected load
      setServers(prev => prev.map(srv => {
        if (srv.status === 'online') {
          const latencyDelta = Math.floor((Math.random() * 6) - 3);
          const usersDelta = Math.floor((Math.random() * 3) - 1);
          const nextLatency = Math.max(8, srv.latency + latencyDelta);
          const nextCount = Math.max(1, Math.min(srv.maxUsers, srv.usersCount + usersDelta));
          return {
            ...srv,
            latency: nextLatency,
            usersCount: nextCount
          };
        }
        return srv;
      }));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  // Creation of SSH account (subtracts 1 credit from current user if they are reseller and not admin)
  const handleCreateAccount = (accountData: Omit<SshAccount, 'id' | 'ownerId' | 'ownerName' | 'bandwidthUsed' | 'status'>) => {
    if (!currentUser) return false;

    const isAuthorized = currentUser.isAdmin || currentUser.credits >= 1 || accountData.isTest;
    if (!isAuthorized) {
      pushLog(`Falha na criação de conta SSH para ${accountData.username}: Créditos insuficientes.`, 'error');
      return false;
    }

    // Deduct credits if not admin & not a free quick test account
    let finalCredits = currentUser.credits;
    if (!currentUser.isAdmin && !accountData.isTest) {
      finalCredits = Math.max(0, currentUser.credits - 1);
      
      // Update users list balance
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, credits: finalCredits } : u));
      setCurrentUser(prev => prev ? { ...prev, credits: finalCredits } : null);
    }

    const newAccount: SshAccount = {
      ...accountData,
      id: `acc_${Date.now()}`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      bandwidthUsed: 0,
      status: 'active'
    };

    setAccounts(prev => [newAccount, ...prev]);
    pushLog(`Sucesso: SSH criado [${newAccount.username}] pelo piloto [${currentUser.name}].`, 'success');
    return true;
  };

  // Switch status of account / suspend / delete
  const handleToggleAccountStatus = (id: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
        pushLog(`Conta [${acc.username}] alterada para status [${nextStatus.toUpperCase()}].`, 'warn');
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const handleDeleteAccount = (id: string) => {
    const target = accounts.find(a => a.id === id);
    if (target) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      pushLog(`Conta SSH de usuário [${target.username}] permanentemente excluída.`, 'warn');
    }
  };

  // Payload library management
  const handleSavePayload = (payload: ConnectionPayload) => {
    setPayloads(prev => {
      const idx = prev.findIndex(p => p.id === payload.id);
      if (idx !== -1) {
        pushLog(`Payload customizado [${payload.name}] atualizado.`, 'info');
        return prev.map(p => p.id === payload.id ? payload : p);
      } else {
        const withId = { ...payload, id: `pay_${Date.now()}` };
        pushLog(`Novo payload cadastrado: [${payload.name}].`, 'success');
        return [withId, ...prev];
      }
    });
  };

  const handleDeletePayload = (id: string) => {
    setPayloads(prev => prev.filter(p => p.id !== id));
    pushLog(`Regra de Payload removida da biblioteca.`, 'warn');
  };

  // Server management (Admin actions)
  const handleToggleServerStatus = (id: string) => {
    setServers(prev => prev.map(srv => {
      if (srv.id === id) {
        const nextStatus: 'online' | 'offline' = srv.status === 'online' ? 'offline' : 'online';
        pushLog(`Status do Servidor [${srv.name}] alterado para [${nextStatus.toUpperCase()}].`, 'warn');
        return { 
          ...srv, 
          status: nextStatus,
          latency: nextStatus === 'offline' ? 999 : 25
        };
      }
      return srv;
    }));
  };

  const handleCreateServer = (srv: Omit<SshServer, 'id' | 'usersCount' | 'latency'>) => {
    const newServer: SshServer = {
      ...srv,
      id: `srv_${Date.now()}`,
      usersCount: 0,
      latency: 22
    };
    setServers(prev => [...prev, newServer]);
    pushLog(`Novo nó de túnel registrado: [${newServer.name}] IP: ${newServer.domain}`, 'success');
  };

  const handleDeleteServer = (id: string) => {
    setServers(prev => prev.filter(s => s.id !== id));
    pushLog(`Servidor de conexão excluído da infraestrutura de roteamento.`, 'error');
  };

  // Credits management
  const handleAddCreditsToReseller = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextCredits = u.credits + amount;
        pushLog(`${amount} créditos de licença adicionados ao revendedor [${u.name}].`, 'success');
        return { ...u, credits: nextCredits };
      }
      return u;
    }));
  };

  // Auth triggers
  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('xtunnel_session', JSON.stringify(user));
    setCurrentUser(user);
    pushLog(`Efetivado login comercial com sucesso: ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers(prev => {
      const updated = [...prev, newUser];
      return updated.map((u, idx) => ({ ...u, rank: idx + 1 }));
    });
    pushLog(`Novo revendedor registrado federado na rede: ${newUser.name}`, 'info');
  };

  const handleLogout = () => {
    pushLog(`Encerramento de sessão para operador [${currentUser?.name || ''}]`, 'warn');
    localStorage.removeItem('xtunnel_session');
    setCurrentUser(null);
  };

  return (
    <div id="xtunnel-root" className={`min-h-screen ${theme === 'light' ? 'bg-[#f3f4f6] text-slate-800' : 'bg-[#07040e] text-white'} font-sans antialiased selection:bg-neon-purple selection:text-white transition-colors duration-300`}>
      {currentUser ? (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          allUsers={users}
          allServers={servers}
          allAccounts={accounts}
          allPayloads={payloads}
          allLogs={logs}
          onCreateAccount={handleCreateAccount}
          onToggleAccountStatus={handleToggleAccountStatus}
          onDeleteAccount={handleDeleteAccount}
          onSavePayload={handleSavePayload}
          onDeletePayload={handleDeletePayload}
          onToggleServerStatus={handleToggleServerStatus}
          onCreateServer={handleCreateServer}
          onDeleteServer={handleDeleteServer}
          onAddCredits={handleAddCreditsToReseller}
          pushLog={pushLog}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          allUsers={users}
          onRegisterUser={handleRegisterUser}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

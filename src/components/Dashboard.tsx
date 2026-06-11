/**
 * Interactive Control Panel Dashboard for EVOLUTION XTUNNEL
 * Provides full management of VPN accounts, servers, payloads, and terminal monitoring.
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Users, Radio, Copy, Plus, Trash2, Shield, Search, Code, Coins, 
  Clock, LogOut, Check, Flame, ShieldAlert, Globe, Activity, Wifi, Cpu, 
  FileText, RefreshCw, AlertTriangle, Key, Edit, Calendar, UserCheck,
  Sun, Moon, Languages, Smartphone, Sparkles, Download, Heart, ArrowUp, RefreshCcw, Zap
} from 'lucide-react';
import { User, SshServer, SshAccount, ConnectionPayload, LogLine } from '../types';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  allUsers: User[];
  allServers: SshServer[];
  allAccounts: SshAccount[];
  allPayloads: ConnectionPayload[];
  allLogs: LogLine[];
  onCreateAccount: (accountData: Omit<SshAccount, 'id' | 'ownerId' | 'ownerName' | 'bandwidthUsed' | 'status'>) => boolean;
  onToggleAccountStatus: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  onSavePayload: (payload: ConnectionPayload) => void;
  onDeletePayload: (id: string) => void;
  onToggleServerStatus: (id: string) => void;
  onToggleBBR?: (id: string) => void;
  onCreateServer: (srv: Omit<SshServer, 'id' | 'usersCount' | 'latency'>) => void;
  onDeleteServer: (id: string) => void;
  onAddCredits: (userId: string, amount: number) => void;
  pushLog: (message: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pwaInstallable?: boolean;
  onInstallPWA?: () => void;
}

export default function Dashboard({
  currentUser,
  onLogout,
  allUsers,
  allServers,
  allAccounts,
  allPayloads,
  allLogs,
  onCreateAccount,
  onToggleAccountStatus,
  onDeleteAccount,
  onSavePayload,
  onDeletePayload,
  onToggleServerStatus,
  onToggleBBR,
  onCreateServer,
  onDeleteServer,
  onAddCredits,
  pushLog,
  theme,
  onToggleTheme,
  pwaInstallable = false,
  onInstallPWA
}: DashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'contas' | 'servidores' | 'payloads' | 'resellers' | 'apk' | 'tutoriais'>('contas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // APK Compiling Custom Parameters States (matching screenshots)
  const [apkBase, setApkBase] = useState('XTUNNEL Lite');
  const [apkName, setApkName] = useState('XTUNNEL Lite');
  const [apkPackage, setApkPackage] = useState('com.xtunnel.lite');
  const [apkVersionName, setApkVersionName] = useState('5.5.0');
  const [apkVersionCode, setApkVersionCode] = useState('102');
  const [apkLogoUrl, setApkLogoUrl] = useState('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100&fit=crop');
  const [apkProtocol, setApkProtocol] = useState<string>('SSH Direct');
  const [apkOfflineTema, setApkOfflineTema] = useState(true);
  const [apkOfflineTextos, setApkOfflineTextos] = useState(true);
  const [apkOfflineCDNs, setApkOfflineCDNs] = useState(true);
  const [apkOfflineConfig, setApkOfflineConfig] = useState(false);
  const [apkLoading, setApkLoading] = useState(false);
  const [apkBuildPercent, setApkBuildPercent] = useState(0);
  const [apkBuildOutput, setApkBuildOutput] = useState<string>('');
  
  // History of generated APK session links
  const [apkLinks, setApkLinks] = useState<Array<{
    id: string;
    version: string;
    date: string;
    name: string;
    packageId: string;
    url: string;
  }>>(() => {
    const saved = localStorage.getItem('xtunnel_apk_links');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Replace any lingering "dtunnel" inside old session saves to prevent visual leakage
          return parsed.map((item: any) => ({
            ...item,
            name: String(item.name || '').toUpperCase().includes('DTUNNEL') 
              ? String(item.name).replace(/DTunnel/gi, 'XTUNNEL').replace(/DTUNNEL/gi, 'XTUNNEL') 
              : String(item.name || '').replace(/dtunnel/gi, 'xtunnel'),
            version: String(item.version || '').replace('4.6.3 (25)', '5.5.0 Stable (102)'),
            packageId: String(item.packageId || 'com.xtunnel.lite').replace(/dtunnel/gi, 'xtunnel'),
            url: String(item.url || '').replace(/dtunnel/gi, 'xtunnel')
          }));
        }
      } catch (e) {
        // Silently catch and proceed
      }
    }
    
    // Seed fresh, upgraded modern versions if empty
    return [
      {
        id: 'build_seed_1',
        version: '5.5.0 Stable (102)',
        date: new Date().toLocaleDateString('pt-BR') + ' 10:30',
        name: 'XTUNNEL LITE',
        packageId: 'com.xtunnel.lite',
        url: 'https://cdn.xtunnel.space/builds/apk/client-com.xtunnel.lite-5.5.0.apk'
      },
      {
        id: 'build_seed_2',
        version: '5.5.0 Stable (102)',
        date: new Date().toLocaleDateString('pt-BR') + ' 11:15',
        name: 'XTUNNEL PRO',
        packageId: 'com.xtunnel.pro',
        url: 'https://cdn.xtunnel.space/builds/apk/client-com.xtunnel.pro-5.5.0.apk'
      }
    ];
  });

  // Persist session links
  useEffect(() => {
    localStorage.setItem('xtunnel_apk_links', JSON.stringify(apkLinks));
  }, [apkLinks]);

  // Search parameters for configs list
  const [searchPayload, setSearchPayload] = useState('');
  const [filterPayloadCarrier, setFilterPayloadCarrier] = useState('all');
  const [filterPayloadActive, setFilterPayloadActive] = useState('all');

  // Personal profile view toggle state
  const [profileType, setProfileType] = useState<'personal' | 'vendor'>('personal');

  // Live Phone mock current selection payload
  const [selectedPhonePayload, setSelectedPhonePayload] = useState<string>('pay_1');

  // Quick Search states
  const [searchAccount, setSearchAccount] = useState('');
  const [filterServer, setFilterServer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Account creation inputs
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newLimit, setNewLimit] = useState(1);
  const [newDays, setNewDays] = useState(30);
  const [targetServerId, setTargetServerId] = useState(allServers[0]?.id || '');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Quick Test Account Output
  const [testOutput, setTestOutput] = useState<{
    text: string;
    username: string;
    expiresAt: string;
  } | null>(null);

  // Payload library creation inputs
  const [payName, setPayName] = useState('');
  const [payCarrier, setPayCarrier] = useState<'Vivo' | 'Claro' | 'Tim' | 'Universal'>('Vivo');
  const [paySni, setPaySni] = useState('');
  const [payProc, setPayProc] = useState<'SSH Direct' | 'SSL Tunnel' | 'WebSocket SSL'>('WebSocket SSL');
  const [payString, setPayString] = useState('');
  const [showPayloadForm, setShowPayloadForm] = useState(false);

  // Server registration inputs (Admin only)
  const [srvName, setSrvName] = useState('');
  const [srvDomain, setSrvDomain] = useState('');
  const [srvFlag, setSrvFlag] = useState('🇧🇷');
  const [srvCat, setSrvCat] = useState<'Premium' | 'VIP' | 'Bronze' | 'V2Ray'>('Premium');
  const [srvProtocols, setSrvProtocols] = useState<string[]>([ 'Direct SSH' ]);
  const [showServerForm, setShowServerForm] = useState(false);

  // Credit allocation states (Admin only)
  const [targetUserId, setTargetUserId] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(50);

  // Copy indicator helper lists
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const triggerCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 1800);
    pushLog(`Copiado para a área de transferência: [${key}]`, 'info');
  };

  const handleDownloadConfig = (lnk: any) => {
    const configData = {
      appName: apkName,
      packageName: lnk.packageId || apkPackage,
      version: lnk.version || apkVersionName,
      versionCode: apkVersionCode,
      protocol: apkProtocol,
      logoUrl: apkLogoUrl,
      offlineModules: {
        temaOffline: apkOfflineTema,
        textosOffline: apkOfflineTextos,
        cdnsOffline: apkOfflineCDNs,
        servidoresPreload: apkOfflineConfig
      },
      compiledAt: lnk.date,
      downloadUrlFake: lnk.url,
      info: "Este arquivo contem as configuracoes customizadas do seu aplicativo XTunnel. Como este e um painel de demonstracao interativa em React (Mockup), a geracao do binario .apk nativo requer um servidor Gradle dedicado. Utilize estas configuracoes JSON geradas para alimentar o seu script de compilador de aplicacao VPN."
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `xtunnel-config-${lnk.packageId || 'custom'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    pushLog(`Arquivo de configurações baixado com sucesso! [xtunnel-config-${lnk.packageId || 'custom'}.json]`, 'success');
  };

  const handleDownloadMockApk = (lnk: any) => {
    const apkDummyContent = {
      manifest: {
        applicationId: lnk.packageId || apkPackage,
        versionName: lnk.version || apkVersionName,
        versionCode: apkVersionCode,
        label: apkName,
        logo: apkLogoUrl
      },
      connection: {
        defaultProtocol: apkProtocol,
        offlineTheme: apkOfflineTema,
        offlineCDNs: apkOfflineCDNs,
        offlineTexts: apkOfflineTextos,
        preloadedServers: apkOfflineConfig
      },
      environment: "XTUNNEL_SIMULATED_ENVIRONMENT",
      note: "Este arquivo e o simulador customizado do APK para a versao de testes em navegadores. Para compilacao real nativa e instalacao no Android, configure o seu pipeline de compilação integrada do Gradle no painel VPS principal."
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apkDummyContent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeFilename = apkName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    downloadAnchor.setAttribute("download", `XTunnel-${safeFilename}-${lnk.version || apkVersionName}.apk`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    pushLog(`Simulador do APK baixado com êxito! XTunnel-${safeFilename}-${lnk.version || apkVersionName}.apk`, 'success');
  };

  // Generate 1-Hour Free Test account
  const handleQuickTestGen = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUser = `teste_${randomSuffix}`;
    const generatedPass = Math.floor(1000 + Math.random() * 9000).toString();
    
    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 1);

    const srv = allServers.find(s => s.status === 'online') || allServers[0];
    if (!srv) {
      pushLog('Erro: Nenhum servidor online cadastrado para gerar teste.', 'error');
      return;
    }

    const success = onCreateAccount({
      username: generatedUser,
      password: generatedPass,
      limit: 1,
      expirationDate: expDate.toISOString(),
      isTest: true,
      serverId: srv.id,
    });

    if (success) {
      const configTemplate = `
🚀 *CONEXÃO EVOLUTION XTUNNEL TESTE ATIVO* 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Servidor BR: *${srv.domain}*
🔑 Usuário: *${generatedUser}*
🔒 Senha: *${generatedPass}*
⏱️ Validade: *60 minutos* (Teste)
🎯 Limite de Conexão: *01 Dispositivo*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 _Aplicativo oficial compatível com conexões SSH WS / SSL SLOW_
`;
      setTestOutput({
        text: configTemplate,
        username: generatedUser,
        expiresAt: expDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      pushLog(`Conta de teste rápido gerada temporariamente [${generatedUser}] expirando às ${expDate.toLocaleTimeString('pt-BR')}.`, 'success');
    }
  };

  // Create Standard Reseller Account
  const handleCreateStandardAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      pushLog('Falha: Nome de usuário e senha devem ser informados.', 'error');
      return;
    }

    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(newUsername)) {
      pushLog('Falha: Usuário aceita apenas letras, números e sublinhado (_).', 'error');
      return;
    }

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + newDays);

    const success = onCreateAccount({
      username: newUsername,
      password: newPassword,
      limit: newLimit,
      expirationDate: expDate.toISOString().split('T')[0],
      isTest: false,
      serverId: targetServerId,
    });

    if (success) {
      setNewUsername('');
      setNewPassword('');
      setShowCreateForm(false);
    }
  };

  // Add Custom Server Node (Admin only)
  const handleCreateServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvDomain) return;

    onCreateServer({
      name: srvName,
      domain: srvDomain,
      flag: srvFlag,
      category: srvCat,
      status: 'online',
      protocols: srvProtocols,
      maxUsers: 500
    });

    setSrvName('');
    setSrvDomain('');
    setShowServerForm(false);
  };

  // Add Custom Payload Setup (Resellers/Admin)
  const handleCreatePayloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payName || !payString) return;

    onSavePayload({
      id: '',
      name: payName.toUpperCase(),
      carrier: payCarrier,
      sni: paySni || 'www.google.com',
      protocol: payProc,
      payload: payString
    });

    setPayName('');
    setPaySni('');
    setPayString('');
    setShowPayloadForm(false);
  };

  // Add Credits Allocation Submit (Admin only)
  const handleAddCreditsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || creditsAmount <= 0) return;
    onAddCredits(targetUserId, creditsAmount);
    setTargetUserId('');
  };

  // Phone virtual engine simulator states
  const [phoneUsername, setPhoneUsername] = useState('tunneler');
  const [phonePassword, setPhonePassword] = useState('1234');
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [phoneConnecting, setPhoneConnecting] = useState(false);
  const [phoneStatusText, setPhoneStatusText] = useState('DESCONECTADO');
  const [phoneLogs, setPhoneLogs] = useState<string[]>(['Esperando inicialização...']);

  // Handle phone simulated tunnel connection
  const handleTogglePhoneConnection = () => {
    if (phoneConnecting) return;
    if (phoneConnected) {
      setPhoneConnected(false);
      setPhoneStatusText('DESCONECTADO');
      setPhoneLogs(prev => [...prev, '🔌 Desconectado voluntariamente pelo usuário.', 'Pronto para reconectar.']);
      pushLog('VPN Simulador Desconectado.', 'info');
      return;
    }

    const payloadObj = allPayloads.find(p => p.id === selectedPhonePayload);
    const protocolName = payloadObj ? payloadObj.protocol : 'SSH Direct';

    setPhoneConnecting(true);
    setPhoneStatusText('CONECTANDO');
    setPhoneLogs([
      `[DNS] Iniciando conexão usando ${protocolName}...`,
      `[Socket] Resolvendo DNS e roteamento para o SNI: ${payloadObj?.sni || 'localhost'}...`,
      `[SSL] Efetuando handshake TLS com certificado corporativo...`
    ]);
    pushLog(`VPN Simulador: Efetuando Handshake via ${protocolName}...`, 'info');

    setTimeout(() => {
      setPhoneLogs(prev => [...prev, `[${protocolName}] Injetando headers/parâmetros ativos...`, `[Core] Estabelecendo túnel persistente tipo ${protocolName}...`]);
    }, 800);

    setTimeout(() => {
      setPhoneConnecting(false);
      setPhoneConnected(true);
      setPhoneStatusText('CONECTADO');
      setPhoneLogs(prev => [
        ...prev, 
        `[Autenticação] Credenciais validadas para o usuário: ${phoneUsername}`,
        `✔️ EVOLUTION XTUNNEL [${protocolName}]: CONECTADO COM SINAL CHAVE!`, 
        `Status do túnel: 100% ESTÁVEL - Latência baixa`
      ]);
      pushLog(`VPN Simulador: Modo ${protocolName} Estabelecido com sucesso para ` + phoneUsername, 'success');
    }, 1800);
  };

  // Compile APK state action handler
  const handleCompileAPK = () => {
    if (apkLoading) return;
    setApkLoading(true);
    setApkBuildPercent(0);
    setApkBuildOutput('Iniciando pipeline de compilação da base ' + apkBase + '...\n[Suporte Nativo Ativo: ' + apkProtocol + ']\n');
    pushLog(`Compilador XTUNNEL acionado para o pacote '${apkPackage}' [Protocolo: ${apkProtocol}]`, 'info');

    let percent = 0;
    const interval = setInterval(() => {
      percent += 10;
      setApkBuildPercent(percent);

      if (percent === 10) {
        setApkBuildOutput(prev => prev + '[10%] Descompilando APK base e carregando recursos...\n');
      } else if (percent === 30) {
        setApkBuildOutput(prev => prev + '[30%] Injetando logotipo customizado do painel...\n');
      } else if (percent === 50) {
        setApkBuildOutput(prev => prev + '[50%] Precompilando payloads offline no modo ' + apkProtocol + '...\n');
      } else if (percent === 70) {
        setApkBuildOutput(prev => prev + '[70%] Otimizando módulos específicos para ' + apkProtocol + ' (DEX)...\n');
      } else if (percent === 85) {
        setApkBuildOutput(prev => prev + '[85%] Alinhando zip compresso através de zipalign...\n');
      } else if (percent === 95) {
        setApkBuildOutput(prev => prev + '[95%] Assinando pacote XTunnel com certificado v2/v3 para ' + apkProtocol + '...\n');
      } else if (percent >= 100) {
        clearInterval(interval);
        setApkBuildOutput(prev => prev + '[100%] Compilação realizada com total sucesso! Link de download gerado para os aparelhos do cliente.\n');
        setApkLoading(false);
        
        // Add link to list
        const newApk = {
          id: 'link_' + Date.now(),
          version: apkVersionName + ' (' + apkVersionCode + ')',
          date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          name: apkName + ' - ' + apkProtocol,
          packageId: apkPackage,
          url: 'https://cdn.xtunnel.space/builds/apk/client-' + apkPackage + '-' + apkVersionName + '.apk'
        };
        setApkLinks(prev => [newApk, ...prev]);
        pushLog(`Novo APK compilado: ${apkName} (${apkProtocol}) pronto!`, 'success');
      }
    }, 300);
  };

  // Filter accounts
  const filteredAccounts = allAccounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(searchAccount.toLowerCase()) ||
                          acc.ownerName.toLowerCase().includes(searchAccount.toLowerCase());
    const matchesServer = filterServer === 'all' || acc.serverId === filterServer;
    const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
    
    // Non-admin resellers can ONLY see accounts they own!
    const matchesOwnership = currentUser.isAdmin || acc.ownerId === currentUser.id;

    return matchesSearch && matchesServer && matchesStatus && matchesOwnership;
  });

  // Helper to extract name initials
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const userInitials = getInitials(currentUser.name);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f3f4f6]' : 'bg-[#07040e]'} flex flex-col cyber-grid transition-colors duration-300`}>
      
      {/* Left Config / Navigation Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop with transition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sidebar drawer containing configurations matches instructions */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] z-50 shadow-2xl flex flex-col ${
                theme === 'light' 
                  ? 'bg-white border-r border-slate-200 text-slate-800' 
                  : 'bg-[#0a0518] border-r border-[#261647] text-white'
              }`}
            >
              {/* Drawer App Brand name header */}
              <div className={`p-4.5 flex items-center justify-between border-b ${
                theme === 'light' ? 'border-slate-100' : 'border-cyber-border/70'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-display font-extrabold text-[11px] tracking-wider select-none ${
                    theme === 'light'
                      ? 'bg-slate-100 border border-slate-200 text-slate-800'
                      : 'bg-[#9822ff]/15 border border-[#9822ff]/50 text-neon-yellow shadow-md'
                  }`}>
                    EV
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold tracking-[0.2em] font-mono leading-none block ${
                      theme === 'light' ? 'text-slate-500' : 'text-neon-green'
                    }`}>
                      EVOLUTION
                    </span>
                    <span className={`font-display font-black text-sm block leading-none -mt-0.5 ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      XTUNNEL
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-sidebar-btn"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors font-sans text-xs font-bold leading-none ${
                    theme === 'light' 
                      ? 'bg-slate-50 hover:bg-slate-150 border-slate-200 text-slate-650' 
                      : 'bg-[#150d2e] hover:bg-red-500/10 border-cyber-border text-slate-300 hover:text-red-400 hover:border-red-500/40'
                  }`}
                  title="Fechar Menu"
                >
                  ✕
                </button>
              </div>

              {/* Operator account credentials profile card inside hamburger drawer */}
              <div className={`p-4 border-b ${
                theme === 'light' ? 'bg-slate-50/50 border-slate-100' : 'bg-cyber-bg/40 border-cyber-border/60'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                    theme === 'light' ? 'bg-white border-slate-200 text-slate-707' : 'bg-[#100a22] border-[#b026ff]/20 text-[#b026ff]'
                  }`}>
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${theme === 'light' ? 'text-slate-800' : 'text-slate-105'}`}>{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                      ROLE: <span className="text-neon-yellow font-bold uppercase">{currentUser.isAdmin ? 'SYSADMIN' : 'REVENDA'}</span>
                    </p>
                  </div>
                </div>

                 <div className={`mt-3 p-2.5 rounded-xl border flex flex-col gap-1.5 text-[11.5px] font-mono select-none ${
                   theme === 'light' ? 'bg-white border-slate-200/80' : 'bg-[#0f0a21] border-cyber-border'
                 }`}>
                   <div className="flex items-center justify-between">
                     <span className="text-slate-400 font-bold">LIMITE DE LOGINS:</span>
                     <span className={`font-black ${theme === 'light' ? 'text-slate-800' : 'text-neon-yellow'}`}>
                       {currentUser.isAdmin ? 'ILIMITADO' : `${currentUser.credits} LOGINS`}
                     </span>
                   </div>
                   <div className="flex items-center justify-between border-t border-cyber-border/40 pt-1 text-[10px]">
                     <span className="text-slate-500 font-medium">CONEXÃO:</span>
                     <span className="text-neon-green font-bold">ATIVA (MENSUAL)</span>
                   </div>
                 </div>
              </div>

              {/* Drawer core navigation tab configurations */}
              <div className="p-4 flex-grow overflow-y-auto space-y-5">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-2 ml-1">Configurações Ativas</p>
                  <div className="space-y-1">
                    
                    {/* Contas tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('contas');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para Contas SSH / VPN", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'contas'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-gradient-to-r from-[#b026ff] to-[#9810ff] text-white shadow-lg shadow-indigo-650/10'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-neon-green" />
                        Acessos SSH / VPN
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        activeTab === 'contas' ? 'bg-white/20 text-white' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {filteredAccounts.length}
                      </span>
                    </button>

                    {/* Servidores tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('servidores');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para Servidores VPN", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'servidores'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-neon-green text-slate-950 shadow-lg glow-green'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Server className="w-4 h-4 text-neon-purple" />
                        Servidores Ativos
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        activeTab === 'servidores' ? 'bg-white/20 text-slate-900' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {allServers.length}
                      </span>
                    </button>

                    {/* Configurações tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('payloads');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para Configurações SNI e Payloads", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'payloads'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-neon-yellow text-slate-950 shadow-lg glow-yellow'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Code className="w-4 h-4 text-neon-green" />
                        Payloads & SNI
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        activeTab === 'payloads' ? 'bg-white/20 text-slate-900' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {allPayloads.length}
                      </span>
                    </button>

                    {/* Gerar APK tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('apk');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para Compilador APK", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'apk'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-indigo-650 text-white shadow-lg'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-neon-yellow" fill="currentColor" />
                        Compilar Aplicativo
                      </span>
                      {apkLinks.length > 0 && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          activeTab === 'apk' ? 'bg-white/20 text-white' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {apkLinks.length}
                        </span>
                      )}
                    </button>

                    {/* Guia Sem VPS / Tutoriais tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('tutoriais');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para o manual Técnico - Alternativas Sem VPS", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'tutoriais'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-emerald-650 text-white shadow-lg glow-green'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-neon-yellow animate-pulse" />
                        Alternativas Sem VPS
                      </span>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green uppercase border border-neon-green/20">
                        Novo
                      </span>
                    </button>

                    {/* Revendedores tab selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('resellers');
                        setIsSidebarOpen(false);
                        pushLog("Navegando para configurações de Operador", "info");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeTab === 'resellers'
                          ? theme === 'light'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-cyber-surface border border-cyber-border text-slate-105 shadow-md'
                          : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-neon-purple" />
                        {currentUser.isAdmin ? 'Operador Revendas' : 'Minhas Credenciais'}
                      </span>
                    </button>

                  </div>
                </div>

                {/* Quick Layout Themes Preferences inside Sidebar */}
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-2 ml-1">Ferramentas de Painel</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    {/* Theme Changer trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTheme();
                        pushLog(`Interface alterada com sucesso!`, "info");
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none ${
                        theme === 'light' 
                          ? 'bg-slate-50 border-slate-205 text-slate-800 shadow-sm hover:bg-slate-100' 
                          : 'bg-[#120b29] border-cyber-border text-neon-yellow hover:bg-[#1a1135]'
                      }`}
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="w-4 h-4 mb-1 text-slate-750 fill-slate-700" />
                          Modo Noite
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 mb-1 text-neon-yellow fill-neon-yellow" />
                          Modo Claro
                        </>
                      )}
                    </button>

                    {/* Language select indicator */}
                    <button
                      type="button"
                      onClick={() => {
                        pushLog("Suporte técnico XTUNNEL está em Português (BR).", "success");
                        setIsSidebarOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none ${
                        theme === 'light' 
                          ? 'bg-slate-50 border-slate-205 text-slate-800 shadow-sm hover:bg-slate-100' 
                          : 'bg-[#120b29] border-cyber-border text-slate-300 hover:bg-[#1a1135]'
                      }`}
                    >
                      <Languages className="w-4 h-4 mb-1 text-neon-purple" />
                      IDIOMA (BR)
                    </button>

                  </div>

                  {/* PWA Direct Installation Button */}
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onInstallPWA) onInstallPWA();
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-center gap-2 p-3 py-3 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-emerald-600 border-slate-200 text-white hover:bg-emerald-750 shadow-sm shadow-emerald-500/20'
                          : 'bg-neon-green border-neon-green/45 text-slate-950 hover:bg-neon-green-hover shadow-lg glow-green animate-pulse'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-neon-purple animate-bounce" fill="currentColor" />
                      Adicionar ao Celular (App)
                    </button>
                  </div>
                </div>

                {/* Simulated Server Live Info */}
                <div className={`p-3 rounded-xl border text-[10px] font-mono leading-relaxed space-y-1 select-none ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#06040e]/95 border-cyber-border/70 text-slate-400'
                }`}>
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <span>Sincronização</span>
                    <span className="flex items-center gap-1 active-glow">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green" /> ONLINE
                    </span>
                  </div>
                  <p><b>Painel ID:</b> {currentUser.id.substring(0, 8)}</p>
                  <p><b>Pacote:</b> XTUNNEL MASTER</p>
                  <p><b>Servidor API:</b> ativo</p>
                </div>
              </div>

              {/* Sidebar Footer Logged status exit */}
              <div className={`p-4 border-t flex justify-between items-center mt-auto ${
                theme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-cyber-border bg-[#0a0617]'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 hover:border-red-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Sair do Dashboard
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header matching screenshot exactly */}
      <header className={`sticky top-0 z-40 ${
        theme === 'light' 
          ? 'bg-white/95 border-b border-[#e5e7eb] shadow-sm text-slate-800' 
          : 'bg-[#100a22]/95 border-b border-cyber-border/80 shadow-lg shadow-neon-purple/5 text-white'
      } backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left Actions - Menu & Platform title */}
          <div className="flex items-center gap-3">
            {/* Menu icon shown in screenshot */}
            <button 
              type="button"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                theme === 'light' 
                  ? 'bg-white hover:bg-slate-50 border-[#e5e7eb] text-slate-700' 
                  : 'bg-[#100a22] hover:bg-[#1a1135] border-cyber-border text-slate-300'
              }`}
              title="Menu Lateral"
              onClick={() => {
                setIsSidebarOpen(true);
                pushLog("Painel de navegação de configurações expandido.", "info");
              }}
            >
              <span className="text-xl font-bold font-mono">☰</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-xs tracking-wider select-none ${
                theme === 'light'
                  ? 'bg-slate-100 border border-slate-200 text-slate-800'
                  : 'bg-neon-purple/15 border border-neon-purple/50 text-neon-yellow shadow-md glow-purple'
              }`}>
                EV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-display font-black text-[10px] tracking-[0.25em] font-mono leading-none ${
                    theme === 'light' ? 'text-slate-650' : 'text-neon-green text-shadow-green'
                  } uppercase`}>
                    EVOLUTION
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full animate-ping ${theme === 'light' ? 'bg-slate-400' : 'bg-neon-green'}`} />
                </div>
                <span className={`font-display font-black text-lg tracking-tight block -mt-1 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white text-shadow-purple'
                } text-[18px]`}>
                  XTUNNEL
                </span>
              </div>
            </div>
            
            <span className={`hidden md:inline-block ml-4 text-[9px] border px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest leading-relaxed ${
              theme === 'light' 
                ? 'bg-slate-50 border-slate-200 text-slate-600' 
                : 'bg-cyber-bg border-neon-purple/30 text-neon-purple'
            }`}>
              OPERATOR PANEL {currentUser.isAdmin ? '● SYSADMIN' : '● RESELLER'}
            </span>
          </div>

          {/* Right Actions matching screenshot: Languages trigger, Dark/Light toggler, Initials badge */}
          <div className="flex items-center gap-3">
            
            {/* Dynamic translation button shown in top bar of screenshot */}
            <button
              onClick={() => {
                pushLog("Idioma alterado para Português (Brasil).", "info");
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'bg-slate-50 hover:bg-slate-100 border-[#e5e7eb] text-slate-700 shadow-sm' 
                  : 'bg-cyber-surface hover:bg-[#1a1135] border-cyber-border text-slate-300'
              }`}
              title="Mudar Idioma (Traduzir)"
            >
              <Languages className="w-4 h-4" />
            </button>
            
            {/* Dynamic theme Sun / Moon toggler shown in screenshot */}
            <button
              onClick={onToggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'bg-slate-50 hover:bg-slate-100 border-[#e5e7eb] text-slate-700 shadow-sm' 
                  : 'bg-cyber-surface hover:bg-[#1a1135] border-cyber-border text-neon-yellow'
              }`}
              title={theme === 'light' ? "Mudar para Modo Cyberpunk" : "Mudar para Modo Claro"}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 animate-pulse fill-slate-700" />
              ) : (
                <Sun className="w-4 h-4 animate-spin-slow fill-neon-yellow" />
              )}
            </button>

            {/* Initials profile pill (like "LA" in screenshots, "RS" or "HS" or similar) */}
            <div 
              onClick={() => setActiveTab('resellers')}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-display font-bold text-xs cursor-pointer select-none transition-colors ${
                theme === 'light'
                  ? 'bg-slate-100 border-[#e5e7eb] text-slate-700 hover:bg-slate-200'
                  : 'bg-[#100a22] border-cyber-border text-[#b026ff] hover:border-neon-purple/55'
              }`}
              title={`Perfil do Operador: ${currentUser.name}`}
            >
              {userInitials}
            </div>

            {/* Logout button (compact) */}
            <button
              onClick={onLogout}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer h-10 w-10 ${
                theme === 'light'
                  ? 'bg-slate-50 hover:bg-red-50 hover:text-red-500 border-slate-200 text-slate-400'
                  : 'bg-cyber-surface hover:bg-red-500/10 border-cyber-border hover:border-red-500 text-slate-400 hover:text-red-400'
              }`}
              title="Desconectar do Servidor"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6">
        
        {/* Statistics Bento row with dynamic theme mapping */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          
          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-md border-l-2 select-none transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-slate-200 border-l-[#b026ff]'
              : 'bg-[#100a22] border-cyber-border border-l-neon-purple shadow-neon-purple/5'
          }`}>
            <div className={`p-2.5 rounded-lg border ${
              theme === 'light' ? 'bg-purple-50 text-[#b026ff] border-purple-100' : 'bg-neon-purple/10 text-neon-purple border-neon-purple/20'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[9px] uppercase tracking-wider font-mono leading-none ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>Nós Operando</p>
              <p className={`text-lg font-display font-black font-mono mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-white text-shadow-purple'}`}>
                {allServers.filter(s => s.status === 'online').length}/{allServers.length} ONLINE
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-md border-l-2 select-none transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-slate-200 border-l-[#1eff05]'
              : 'bg-[#100a22] border-cyber-border border-l-neon-green shadow-neon-green/5'
          }`}>
            <div className={`p-2.5 rounded-lg border ${
              theme === 'light' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-neon-green/10 text-neon-green border-neon-green/20'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[9px] uppercase tracking-wider font-mono leading-none ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>Túneis Ativos</p>
              <p className={`text-lg font-display font-black font-mono mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-white text-shadow-green'}`}>
                {allAccounts.filter(acc => acc.status === 'active').length} LOGINS
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-md border-l-2 select-none transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-slate-200 border-l-amber-500'
              : 'bg-[#100a22] border-cyber-border border-l-neon-yellow shadow-neon-yellow/5'
          }`}>
            <div className={`p-2.5 rounded-lg border ${
              theme === 'light' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[9px] uppercase tracking-wider font-mono leading-none ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>Tráfego de Hoje</p>
              <p className={`text-lg font-display font-black font-mono mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-white text-shadow-yellow'}`}>
                {allAccounts.reduce((acc, current) => acc + current.bandwidthUsed, 0).toFixed(1)} GB
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-md border-l-2 select-none transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-slate-200 border-l-pink-500'
              : 'bg-[#100a22] border-cyber-border border-l-pink-500 shadow-pink-500/5'
          }`}>
            <div className={`p-2.5 rounded-lg border ${
              theme === 'light' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-pink-500/10 text-pink-500 border-pink-500/25'
            }`}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[9px] uppercase tracking-wider font-mono leading-none ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>Limite de Logins Ativos</p>
              <p className={`text-base font-display font-black font-mono mt-0.5 ${theme === 'light' ? 'text-pink-600' : 'text-pink-500'}`}>
                {currentUser.isAdmin ? 'ILIMITADO' : `${currentUser.credits} LOGINS ATIVOS`}
              </p>
            </div>
          </div>

        </div>

        {/* Adaptive Navigation Tabs */}
        <div className={`flex overflow-x-auto gap-2 border-b pb-3 mb-6 scrollbar-none select-none transition-colors duration-300 ${
          theme === 'light' ? 'border-slate-200' : 'border-cyber-border/85'
        }`}>
          <button
            id="tab-contas-btn"
            onClick={() => setActiveTab('contas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contas'
                ? theme === 'light'
                  ? 'bg-slate-800 text-white font-black shadow-md'
                  : 'bg-neon-purple text-white font-black shadow-lg glow-purple'
                : theme === 'light'
                  ? 'text-slate-650 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-[#100a22]/60 border border-cyber-border/40'
            }`}
          >
            <Key className="w-4 h-4 text-neon-green" />
            SSH / VPN
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
              activeTab === 'contas' 
                ? theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-white text-neon-purple' 
                : theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-neon-purple/20 text-neon-purple'
            }`}>
              {filteredAccounts.length}
            </span>
          </button>

          <button
            id="tab-servidores-btn"
            onClick={() => setActiveTab('servidores')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'servidores'
                ? theme === 'light'
                  ? 'bg-slate-800 text-white font-black shadow-md'
                  : 'bg-neon-green text-slate-950 font-black shadow-lg glow-green'
                : theme === 'light'
                  ? 'text-slate-650 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-[#100a22]/60 border border-cyber-border/40'
            }`}
          >
            <Server className="w-4 h-4 text-neon-purple" />
            Servidores
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
              activeTab === 'servidores' 
                ? theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-neon-green' 
                : theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-neon-green/10 text-neon-green'
            }`}>
              {allServers.length}
            </span>
          </button>

          <button
            id="tab-payloads-btn"
            onClick={() => setActiveTab('payloads')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'payloads'
                ? theme === 'light'
                  ? 'bg-slate-800 text-white font-black shadow-md'
                  : 'bg-neon-yellow text-slate-950 font-black shadow-lg glow-yellow'
                : theme === 'light'
                  ? 'text-slate-650 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-[#100a22]/60 border border-cyber-border/40'
            }`}
          >
            <Code className="w-4 h-4 text-neon-green" />
            Configurações
          </button>

          {/* Gerar APK button aligning with Image 1 tab style */}
          <button
            id="tab-apk-btn"
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'apk'
                ? theme === 'light'
                  ? 'bg-slate-800 text-white font-black shadow-md'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-indigo-650/40 border border-indigo-500/30'
                : theme === 'light'
                  ? 'text-slate-650 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-[#100a22]/60 border border-cyber-border/40'
            }`}
          >
            <Smartphone className="w-4 h-4 text-neon-yellow" />
            Gerar APK
            {apkLinks.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === 'apk' ? 'bg-white text-indigo-600' : 'bg-neon-yellow/20 text-neon-yellow'
              }`}>
                {apkLinks.length}
              </span>
            )}
          </button>

          {/* Admin panel / resellers tab */}
          <button
            id="tab-resellers-btn"
            onClick={() => setActiveTab('resellers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'resellers'
                ? theme === 'light'
                  ? 'bg-slate-800 text-white font-black shadow-md'
                  : 'bg-cyber-surface text-neon-green border border-neon-green/40 shadow-lg glow-green font-black'
                : theme === 'light'
                  ? 'text-slate-650 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-[#100a22]/60 border border-cyber-border/40'
            }`}
          >
            <Users className="w-4 h-4 text-neon-yellow" />
            {currentUser.isAdmin ? 'Revendedores & Perfil' : 'Seu Perfil'}
          </button>
        </div>

        {/* Active Tab Viewport */}
        <div id="tab-viewport" className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: SSH TUNNEL CLIENT ACCOUNTS */}
            {activeTab === 'contas' && (
              <motion.div
                key="accounts-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* HUD for creation actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cyber-surface/65 p-4 rounded-2xl border border-cyber-border">
                  
                  <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase">
                      <Key className="w-5 h-5 text-neon-purple" /> Gerenciamento de Conexões
                    </h2>
                    <p className="text-xs text-slate-400">Ative novas franquias de internet com as credenciais criadas abaixo.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Free quick test account generator button (no credits cost) */}
                    <button
                      type="button"
                      onClick={handleQuickTestGen}
                      className="px-4 py-2 bg-gradient-to-r from-neon-yellow to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-md flex items-center gap-1.5 h-10 select-none glow-yellow"
                    >
                      <Clock className="w-4 h-4 animate-spin-slow" /> Gerar Teste Rápido (1h)
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="px-4 py-2 bg-neon-purple hover:bg-neon-purple-hover text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5 h-10 glow-purple"
                    >
                      <Plus className="w-4 h-4" /> Criar Usuário Padrão
                    </button>

                  </div>
                </div>

                {/* Free test output banner card */}
                {testOutput && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-cyber-surface border-2 border-neon-yellow/60 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-lg"
                  >
                    <div className="absolute top-0 right-0 bg-neon-yellow text-slate-950 font-mono font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-950 animate-pulse" /> TESTE COM EXPIRAÇÃO ÀS {testOutput.expiresAt}
                    </div>

                    <h3 className="font-display font-black text-sm text-neon-yellow tracking-wider uppercase mb-2">
                      ⚡ TESTE GERADO COM SUCESSO!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 max-w-xl">
                      Copie o template abaixo e envie ao seu cliente para colar no app VPN. Esta chave expira em 60 minutos para uso rápido de teste.
                    </p>

                    <div className="grid md:grid-cols-4 gap-3 items-stretch">
                      
                      {/* Copyable code area */}
                      <div className="md:col-span-3 bg-cyber-bg p-3.5 rounded-xl border border-cyber-border font-mono text-[11px] text-neon-green whitespace-pre-wrap leading-tight max-h-[140px] overflow-y-auto">
                        {testOutput.text}
                      </div>

                      <div className="flex flex-col gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => triggerCopy('ConfiguraçãoTeste', testOutput.text)}
                          className="w-full py-3.5 bg-neon-yellow hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md glow-yellow transition-colors"
                        >
                          {copiedStates['ConfiguraçãoTeste'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedStates['ConfiguraçãoTeste'] ? 'Copiado!' : 'Copiar Acesso'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestOutput(null)}
                          className="w-full py-1.5 bg-cyber-surface hover:bg-slate-800 text-slate-400 border border-cyber-border text-[10px] font-bold uppercase rounded-lg transition-all"
                        >
                          Fechar Banner
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* Account Standard Creator Drawer */}
                {showCreateForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    onSubmit={handleCreateStandardAccountSubmit}
                    className="bg-cyber-surface p-5 rounded-2xl border border-neon-purple/40 space-y-4 max-w-xl shadow-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
                      <span className="font-display font-black text-xs text-neon-purple uppercase tracking-widest flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Formulário de Nova Conta SSH / VPN
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Custo: <strong className="text-neon-green">{currentUser.isAdmin ? 'Livre' : '1 Crédito'}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">User / SSH Username</label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="Ex: pedro_turbo"
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono placeholder-slate-650 focus:outline-none focus:border-neon-purple"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">Senha de Conexão</label>
                        <input
                          type="password"
                          required
                          value={newPassword.replace(/\s+/g, '')}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ex: 1234"
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono placeholder-slate-650 focus:outline-none focus:border-neon-purple"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">Tempo de Validade (Dias)</label>
                        <select
                          value={newDays}
                          onChange={(e) => setNewDays(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neon-purple"
                        >
                          <option value="30">30 Dias (Franquia Normal)</option>
                          <option value="60">60 Dias (Franquia Estendida)</option>
                          <option value="90">90 Dias (Trimestral)</option>
                          <option value="1">1 Dia (Apenas Teste de 24h)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">Limites de Conexões</label>
                        <select
                          value={newLimit}
                          onChange={(e) => setNewLimit(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neon-purple"
                        >
                          <option value="1">01 Dispositivo Único</option>
                          <option value="2">02 Conexões Simultâneas</option>
                          <option value="3">03 Conexões Simultâneas</option>
                          <option value="5">05 Conexões Premium</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">Servidor de Destino Recomendado</label>
                        <select
                          value={targetServerId}
                          onChange={(e) => setTargetServerId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neon-purple"
                        >
                          {allServers.filter(s => s.status === 'online').map(s => (
                            <option key={s.id} value={s.id}>
                              {s.flag} {s.name} - ({s.domain})
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-3.5 py-1.5 bg-transparent text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 bg-neon-purple hover:bg-neon-purple-hover text-white font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-1 shadow-md glow-purple"
                      >
                        Gerar Conta Nova
                      </button>
                    </div>

                  </motion.form>
                )}

                {/* Filter Controls & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-cyber-surface/90 border border-cyber-border p-3.5 rounded-xl">
                  
                  {/* Search username */}
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                    <input
                      type="text"
                      value={searchAccount}
                      onChange={(e) => setSearchAccount(e.target.value)}
                      placeholder="Buscar por usuário SSH ou criador..."
                      className="w-full pl-9 pr-4 py-1.5 bg-cyber-bg border border-cyber-border rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:border-neon-purple font-semibold font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    
                    <div>
                      <select
                        value={filterServer}
                        onChange={(e) => setFilterServer(e.target.value)}
                        className="px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-lg text-xs font-mono focus:outline-none"
                      >
                        <option value="all">Filtrar Servidor: TODOS</option>
                        {allServers.map(s => (
                          <option key={s.id} value={s.id}>{s.flag} {s.name.split(' ')[0]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-lg text-xs font-mono focus:outline-none"
                      >
                        <option value="all">Filtrar Status: TODOS</option>
                        <option value="active">ONLINE / ATIVOS</option>
                        <option value="suspended">SUSPENSOS</option>
                        <option value="expired">EXPIRADOS</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Grid Layout of generated active accounts cards */}
                {filteredAccounts.length === 0 ? (
                  <div className="bg-cyber-surface rounded-2xl border border-cyber-border p-12 text-center shadow-lg">
                    <AlertTriangle className="w-12 h-12 text-neon-yellow/40 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-lg text-slate-200 uppercase">Nenhum Túnel Cadastrado</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
                      Não existem contas registradas que correspondam aos filtros de pesquisa inseridos ou à sua autoria de revendedor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAccounts.map(acc => {
                      const associatedServer = allServers.find(s => s.id === acc.serverId);
                      const isTestAccount = acc.isTest;
                      
                      // Check expiration days remaining
                      let daysText = 'Expirado';
                      let isExpired = acc.status === 'expired';
                      let daysLeft = 0;

                      if (!isExpired) {
                        const targetMs = new Date(acc.expirationDate).getTime();
                        const currentMs = Date.now();
                        const diffMs = targetMs - currentMs;
                        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        
                        if (daysLeft < 0) {
                          isExpired = true;
                          daysText = 'Expirado';
                        } else {
                          daysText = `${daysLeft} dias restantes`;
                        }
                      }

                      return (
                        <div 
                          key={acc.id}
                          className={`bg-cyber-surface rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-md ${
                            acc.status === 'active' 
                              ? 'border-cyber-border hover:border-neon-purple/40' 
                              : acc.status === 'suspended'
                                ? 'border-yellow-500/20 opacity-80'
                                : 'border-red-500/10 opacity-70'
                          }`}
                        >
                          {/* Top badge carrier meta bar */}
                          <div className="bg-cyber-bg/70 px-4 py-2 border-b border-cyber-border/60 flex justify-between items-center">
                            <span className="text-[10px] font-black text-neon-purple font-mono uppercase tracking-widest flex items-center gap-1 text-shadow-purple">
                              <span className={`w-2 h-2 rounded-full ${acc.status === 'active' ? 'bg-neon-green animate-pulse' : acc.status === 'suspended' ? 'bg-neon-yellow' : 'bg-red-500'}`} />
                              {isTestAccount ? '🔴 CONTA TESTE RÁPIDO' : '🔵 CONTA OFICIAL'}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 leading-none">
                              <span>Sincronizado: {acc.bandwidthUsed.toFixed(1)} GB</span>
                            </div>
                          </div>

                          {/* Credential Data Content */}
                          <div className="p-4 space-y-3.5">
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-mono">DADOS DE CONEXÃO SSH</span>
                                <span className="font-display font-black text-sm text-slate-100 font-mono tracking-wide">{acc.username}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] text-slate-450 uppercase font-mono">PASSWORD</span>
                                <span className="font-mono font-bold text-xs bg-cyber-bg border border-cyber-border px-2 py-0.5 rounded-md text-neon-yellow tracking-wider select-all">{acc.password}</span>
                              </div>
                            </div>

                            {/* Node domain server location info */}
                            <div className="p-2 sm:p-2.5 bg-cyber-bg/50 border border-cyber-border rounded-xl flex items-center gap-2 select-none">
                              <span className="text-xl leading-none">{associatedServer?.flag || '🌐'}</span>
                              <div className="truncate">
                                <span className="block text-[9px] uppercase text-slate-400 font-mono leading-none">Vínculo de Servidor</span>
                                <span className="block truncate text-xs text-white leading-tight font-mono">{associatedServer?.name || 'Vários canais'}</span>
                              </div>
                            </div>

                            {/* Limit devices slider indication info */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div>
                                <span className="block text-[9px] uppercase text-slate-400">Limites</span>
                                <span className="text-white text-xs">{acc.limit} dispositivo(s)</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[9px] uppercase text-slate-400">Expiração</span>
                                <span className={`text-[11px] font-bold ${isExpired ? 'text-red-400' : daysLeft <= 3 ? 'text-neon-yellow' : 'text-neon-green'}`}>
                                  {isTestAccount ? '60 mins' : daysText}
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Action Footers */}
                          <div className="bg-cyber-bg/40 px-4 py-2.5 border-t border-cyber-border/60 flex items-center justify-between">
                            
                            {/* Author label info */}
                            <span className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]" title={`Proprietário: ${acc.ownerName}`}>
                              Revendedor: <strong>{acc.ownerName.split(' ')[0]}</strong>
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Suspend / Resume toggle */}
                              <button
                                type="button"
                                onClick={() => onToggleAccountStatus(acc.id)}
                                className={`p-1 px-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer select-none border ${
                                  acc.status === 'active'
                                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                                    : 'bg-neon-green/10 border-neon-green/30 text-neon-green hover:bg-neon-green/20'
                                }`}
                              >
                                {acc.status === 'active' ? 'Bloquear' : 'Reativar'}
                              </button>

                              {/* Delete credential */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja excluir permanentemente o login ${acc.username}?`)) {
                                    onDeleteAccount(acc.id);
                                  }
                                }}
                                className="p-1 px-1.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500 text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Excluir Conta permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: SERVERS LIST */}
            {activeTab === 'servidores' && (
              <motion.div
                key="servers-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-cyber-surface/65 p-4 rounded-2xl border border-cyber-border">
                  <div className="space-y-0.5">
                    <h2 className="font-display text-lg font-black text-slate-100 flex items-center gap-2 uppercase">
                      <Server className="w-5 h-5 text-neon-green" /> Infraestrutura de Servidores
                    </h2>
                    <p className="text-xs text-slate-400">Lista de nós VPN redundantes operando túneis SSH em tempo real.</p>
                  </div>

                  {currentUser.isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowServerForm(!showServerForm)}
                      className="px-4 py-2 bg-neon-green hover:bg-neon-green-hover text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md select-none flex items-center gap-1.5 h-10 glow-green"
                    >
                      <Plus className="w-4 h-4 fill-current" /> Cadastrar Novo Nó
                    </button>
                  )}
                </div>

                {/* Server Registration Form Drawer */}
                {showServerForm && currentUser.isAdmin && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    onSubmit={handleCreateServerSubmit}
                    className="bg-cyber-surface p-5 rounded-2xl border border-neon-green/45 space-y-4 max-w-xl shadow-xl overflow-hidden"
                  >
                    <span className="font-display font-black text-xs text-neon-green uppercase tracking-widest flex items-center gap-1 pb-1 border-b border-cyber-border">
                      <Server className="w-4 h-4" /> Registrar Novo Servidor de Roteamento SSH
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Identificador de Exibição</label>
                        <input
                          type="text"
                          required
                          value={srvName}
                          onChange={(e) => setSrvName(e.target.value.toUpperCase())}
                          placeholder="Ex: BR-VIP-SÃO PAULO 04"
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Domínio de Conexão DNS / IP</label>
                        <input
                          type="text"
                          required
                          value={srvDomain}
                          onChange={(e) => setSrvDomain(e.target.value.toLowerCase().replace(/\s+/g,''))}
                          placeholder="Ex: br4.xtunnel.com"
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Bandeira Local</label>
                        <select
                          value={srvFlag}
                          onChange={(e) => setSrvFlag(e.target.value)}
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-white focus:outline-none"
                        >
                          <option value="🇧🇷">🇧🇷 Brasil (SP / RJ / GIGABIT)</option>
                          <option value="🇺🇸">🇺🇸 Estados Unidos (N. York)</option>
                          <option value="🇩🇪">🇩🇪 Alemanha (Frankfurt)</option>
                          <option value="🇵🇹">🇵🇹 Portugal (Lisboa)</option>
                          <option value="🇨🇦">🇨🇦 Canadá</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Categoria Comercial</label>
                        <select
                          value={srvCat}
                          onChange={(e) => setSrvCat(e.target.value as any)}
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-white focus:outline-none"
                        >
                          <option value="Premium">Premium (Alto Desempenho)</option>
                          <option value="VIP">VIP (Máxima Prioridade)</option>
                          <option value="Bronze">Bronze (Suporte de Anúncios)</option>
                          <option value="V2Ray">V2Ray (Nó Especializado)</option>
                        </select>
                      </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-cyber-border">
                      <button
                        type="button"
                        onClick={() => setShowServerForm(false)}
                        className="px-3.5 py-1.5 bg-transparent text-slate-400 hover:text-white text-xs font-bold uppercase"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 bg-neon-green text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md glow-green"
                      >
                        Ativar Servidor
                      </button>
                    </div>

                  </motion.form>
                )}

                {/* Servers Display Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allServers.map(srv => {
                    const isOnline = srv.status === 'online';
                    const activePercentage = Math.round((srv.usersCount / srv.maxUsers) * 100);
                    
                    return (
                      <div
                        key={srv.id}
                        className={`bg-cyber-surface p-5 rounded-2xl border transition-all relative ${
                          isOnline ? 'border-cyber-border hover:border-neon-green/40' : 'border-red-500/20'
                        } flex flex-col justify-between gap-5`}
                      >
                        {/* Top banner status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 select-none">
                            <span className="text-2xl">{srv.flag}</span>
                            <div>
                              <span className="text-[10px] font-black text-neon-green font-mono uppercase tracking-widest">{srv.category}</span>
                              <h3 className="text-sm font-black text-slate-100 font-mono tracking-tight leading-none block mt-0.5">{srv.name}</h3>
                            </div>
                          </div>

                          <span className={`text-[9.5px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-md ${
                            isOnline 
                              ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 text-shadow-green' 
                              : srv.status === 'maintenance'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {srv.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Mid statistics information (progress bar load) */}
                        <div className="space-y-2 select-none">
                          <div className="flex justify-between items-end text-xs font-mono">
                            <span className="text-[10px] uppercase text-slate-400">DNS: <code className="text-slate-100 font-semibold">{srv.domain}</code></span>
                            <span className="text-[11px] font-bold text-slate-200">Ping: <b className="text-neon-yellow">{isOnline ? `${srv.latency}ms` : '---'}</b></span>
                          </div>

                          {/* Progress bar visual */}
                          <div className="space-y-1">
                            <div className="h-2 bg-cyber-bg rounded-full border border-cyber-border overflow-hidden p-[1.5px]">
                              <div
                                style={{ width: isOnline ? `${activePercentage}%` : '0%' }}
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  activePercentage > 85 
                                    ? 'bg-red-500' 
                                    : activePercentage > 60 
                                      ? 'bg-neon-yellow' 
                                      : 'bg-neon-green glow-green'
                                }`}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span>CLIENTES SIMULTÂNEOS</span>
                              <span>{isOnline ? `${srv.usersCount} / ${srv.maxUsers} max (${activePercentage}%)` : 'OFFLINE'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Allowed Tunnel Protocols summary with TCP BBR optimization badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cyber-border/70 pt-3 select-none">
                          <div className="flex flex-wrap gap-1.5 animate-fade-in">
                            {srv.protocols.map((p, idx) => (
                              <span key={idx} className="text-[9px] bg-cyber-bg border border-cyber-border px-2 py-0.5 rounded-md text-slate-350 font-mono">
                                {p}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9.5px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                              srv.bbrEnabled 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-shadow-green' 
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              <Zap className={`w-3 h-3 ${srv.bbrEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                              BBR: {srv.bbrEnabled ? 'OTIMIZADO' : 'INATIVO'}
                            </span>
                          </div>
                        </div>

                        {/* Admin Action Footers */}
                        {currentUser.isAdmin && (
                          <div className="border-t border-cyber-border pt-3.5 flex justify-between items-center bg-cyber-surface/30 px-1 mt-1 rounded-lg">
                            <span className="text-[9px] text-slate-500 font-mono">ID infra: #{srv.id}</span>
                            <div className="flex items-center gap-1.5">
                              {/* Toggle BBR Optimization */}
                              <button
                                type="button"
                                onClick={() => onToggleBBR && onToggleBBR(srv.id)}
                                className={`text-[10px] font-bold uppercase py-1 px-2.5 border rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                  srv.bbrEnabled
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-slate-500/15 border-slate-500/25 text-slate-300 hover:bg-slate-500/25 animate-pulse'
                                }`}
                                title="Otimizar aceleração TCP BBR"
                              >
                                <Zap className="w-3 h-3" />
                                {srv.bbrEnabled ? 'BBR Ativo' : 'Ativar BBR'}
                              </button>

                              <button
                                type="button"
                                onClick={() => onToggleServerStatus(srv.id)}
                                className={`text-[10px] font-bold uppercase py-1 px-3.5 border rounded-lg transition-all cursor-pointer ${
                                  isOnline
                                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-550'
                                    : 'bg-neon-green/10 border-neon-green/30 text-neon-green hover:bg-neon-green/20'
                                }`}
                              >
                                {isOnline ? 'Interromper' : 'Ativar'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Excluir permanentemente o nó ${srv.name}? Isso pode quebrar conexões de clientes.`)) {
                                    onDeleteServer(srv.id);
                                  }
                                }}
                                className="p-1 px-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg"
                                title="Excluir Nó"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: PAYLOAD INJECTORS LIBRARY */}
            {activeTab === 'payloads' && (
              <motion.div
                key="payloads-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Header and Quick action buttons - Layout matching Image 7 */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                  theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#100a22]/65 border-cyber-border'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className={`font-display text-lg font-black flex items-center gap-2 uppercase ${
                        theme === 'light' ? 'text-slate-805' : 'text-slate-100'
                      }`}>
                        <Code className="w-5 h-5 text-neon-yellow animate-pulse" /> Repositório de Configurações
                      </h2>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Lista de configurações SSH/VPN e payloads de rede móvel do painel XTUNNEL.
                      </p>
                    </div>

                    {/* Action buttons row matching image + Adicionar, Importar */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowPayloadForm(!showPayloadForm)}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 h-10 transition-all ${
                          theme === 'light'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-650/20'
                            : 'bg-neon-green hover:bg-neon-green-hover text-slate-950 glow-green'
                        }`}
                      >
                        <Plus className="w-4 h-4" /> Adicionar Configuração
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const code = prompt("Cole aqui o JSON de exportação do XTUNNEL:");
                          if (code) {
                            try {
                              const parsed = JSON.parse(code);
                              if (parsed.name && parsed.payload) {
                                onSavePayload({
                                  id: '',
                                  name: parsed.name.toUpperCase(),
                                  carrier: parsed.carrier || 'Universal',
                                  sni: parsed.sni || 'www.google.com',
                                  protocol: parsed.protocol || 'WebSocket SSL',
                                  payload: parsed.payload
                                });
                                pushLog(`Payload '${parsed.name}' importado com sucesso!`, 'success');
                              } else {
                                alert("Formato inválido. O arquivo deve conter os campos 'name' e 'payload'.");
                              }
                            } catch (e) {
                              alert("Código de importação corrompido ou inválido.");
                            }
                          }
                        }}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 h-10 transition-all ${
                          theme === 'light'
                            ? 'bg-slate-105 hover:bg-slate-200 border border-slate-300 text-slate-700'
                            : 'bg-[#1a1135] hover:bg-[#231745] border border-cyber-border text-[#b026ff]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" /> Importar Payload
                      </button>
                    </div>
                  </div>

                  {/* Advanced Search Panel matching Image 7 */}
                  <div className={`mt-5 p-4 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-3 transition-colors ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-cyber-bg/50 border-cyber-border/70'
                  }`}>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">Palavra Chave</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar por nome de config ou host SNI..."
                          value={searchPayload}
                          onChange={(e) => setSearchPayload(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg focus:outline-none transition-colors border ${
                            theme === 'light' 
                              ? 'bg-white border-slate-300 text-slate-800 focus:border-slate-500' 
                              : 'bg-cyber-bg border-cyber-border text-white focus:border-neon-purple'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">Operadoras</label>
                      <select
                        value={filterPayloadCarrier}
                        onChange={(e) => setFilterPayloadCarrier(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg focus:outline-none transition-colors border ${
                          theme === 'light' 
                            ? 'bg-white border-slate-300 text-slate-800 focus:border-slate-500' 
                            : 'bg-cyber-bg border-cyber-border text-slate-200 focus:border-neon-purple'
                        }`}
                      >
                        <option value="all">Todas Operadoras</option>
                        <option value="Vivo">Vivo</option>
                        <option value="Claro">Claro</option>
                        <option value="Tim">TIM</option>
                        <option value="Universal">Universal VPS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">Protocolo / Modo de Conexão</label>
                      <select
                        value={filterPayloadActive}
                        onChange={(e) => setFilterPayloadActive(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg focus:outline-none transition-colors border ${
                          theme === 'light' 
                            ? 'bg-white border-slate-300 text-slate-800 focus:border-slate-500' 
                            : 'bg-cyber-bg border-cyber-border text-slate-200 focus:border-neon-purple'
                        }`}
                      >
                        <option value="all">Todos Métodos</option>
                        <option value="SSH Direct">SSH Direct</option>
                        <option value="SSH Proxy">SSH Proxy</option>
                        <option value="SSH DNSTT">SSH DNSTT</option>
                        <option value="SSL Direct">SSL Direct</option>
                        <option value="SSL Proxy">SSL Proxy</option>
                        <option value="V2Ray">V2Ray</option>
                        <option value="XRay">XRay</option>
                        <option value="XRay Reality">XRay + REALITY (TLS Vless)</option>
                        <option value="Hysteria">Hysteria</option>
                        <option value="WebSocket SSL">WebSocket TLS</option>
                        <option value="SSL Tunnel">SSL Tunnel</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-300/10 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchPayload('');
                          setFilterPayloadCarrier('all');
                          setFilterPayloadActive('all');
                          pushLog("Filtros de busca de payloads limpos.", "info");
                        }}
                        className={`px-4 py-1.5 rounded-lg font-bold uppercase tracking-wide border cursor-pointer transition-colors ${
                          theme === 'light'
                            ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-650'
                            : 'bg-transparent hover:bg-white/5 border-cyber-border text-slate-305'
                        }`}
                      >
                        Limpar Filtros
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          pushLog(`Filtros aplicados para busca de payloads.`, "success");
                        }}
                        className={`px-5 py-1.5 rounded-lg font-black uppercase tracking-wide cursor-pointer transition-all ${
                          theme === 'light'
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : 'bg-neon-yellow text-slate-950 glow-yellow'
                        }`}
                      >
                        Buscar Configulações
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Payload Add Drawer */}
                {showPayloadForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    onSubmit={handleCreatePayloadSubmit}
                    className={`p-5 rounded-2xl border space-y-4 max-w-xl shadow-xl overflow-hidden ${
                      theme === 'light' 
                        ? 'bg-white border-emerald-500/30 shadow-emerald-500/5' 
                        : 'bg-cyber-surface border-neon-yellow/45 shadow-neon-yellow/5'
                    }`}
                  >
                    <span className={`font-display font-black text-xs uppercase tracking-widest flex items-center gap-1 pb-1 border-b ${
                      theme === 'light' ? 'border-slate-200 text-emerald-600' : 'border-cyber-border text-neon-yellow'
                    }`}>
                      <Code className="w-4 h-4" /> Criar Perfil de Conexão Customizado
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Título / Perfil Config</label>
                        <input
                          type="text"
                          required
                          value={payName}
                          onChange={(e) => setPayName(e.target.value)}
                          placeholder="Ex: VIVO EASY REDUTOR"
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-cyber-bg border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Operadora Portadora</label>
                        <select
                          value={payCarrier}
                          onChange={(e) => setPayCarrier(e.target.value as any)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-cyber-bg border-cyber-border text-white'
                          }`}
                        >
                          <option value="Vivo">Vivo Telefônica</option>
                          <option value="Claro">Claro Embratel</option>
                          <option value="Tim">Tim Brasil</option>
                          <option value="Universal">Universal Cloud / VPS</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>SNI (Server Name Indication)</label>
                        <input
                          type="text"
                          required
                          value={paySni}
                          onChange={(e) => setPaySni(e.target.value.toLowerCase().replace(/\s+/g,''))}
                          placeholder="Ex: cadastro.vivo.com.br"
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-cyber-bg border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Modo de Conexão / Protocolo VPN</label>
                        <select
                          value={payProc}
                          onChange={(e) => setPayProc(e.target.value as any)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-cyber-bg border-cyber-border text-white'
                          }`}
                        >
                          <option value="SSH Direct">SSH Direct</option>
                          <option value="SSH Proxy">SSH Proxy</option>
                          <option value="SSH DNSTT">SSH DNSTT</option>
                          <option value="SSL Direct">SSL Direct</option>
                          <option value="SSL Proxy">SSL Proxy</option>
                          <option value="V2Ray">V2Ray</option>
                          <option value="XRay">XRay</option>
                          <option value="XRay Reality">XRay + REALITY (TLS Vless)</option>
                          <option value="Hysteria">Hysteria</option>
                          <option value="WebSocket SSL">WebSocket TLS (Bypass)</option>
                          <option value="SSL Tunnel">SSL Tunnel (Direto)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Linha de Payload Completa</label>
                        <textarea
                          required
                          value={payString}
                          onChange={(e) => setPayString(e.target.value)}
                          placeholder="GET / HTTP/1.1[crlf]Host: [host]..."
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-xl font-mono focus:outline-none text-[11px] ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-cyber-bg border-cyber-border text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`flex justify-end gap-2 pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-cyber-border'}`}>
                      <button
                        type="button"
                        onClick={() => setShowPayloadForm(false)}
                        className="px-3.5 py-1.5 text-slate-400 hover:text-red-500 text-xs font-bold uppercase cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`px-5 py-1.5 font-black text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer ${
                          theme === 'light'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-neon-yellow text-slate-950 glow-yellow'
                        }`}
                      >
                        Salvar Configulação
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Filter and display match configurations */}
                {(() => {
                  const items = allPayloads.filter(p => {
                    const matchesKeywords = p.name.toLowerCase().includes(searchPayload.toLowerCase()) || 
                                            p.sni.toLowerCase().includes(searchPayload.toLowerCase());
                    const matchesCarrier = filterPayloadCarrier === 'all' || p.carrier.toLowerCase() === filterPayloadCarrier.toLowerCase();
                    const matchesProtocol = filterPayloadActive === 'all' || p.protocol === filterPayloadActive;
                    return matchesKeywords && matchesCarrier && matchesProtocol;
                  });

                  if (items.length === 0) {
                    return (
                      <div className={`p-8 rounded-2xl text-center border font-display tracking-tight text-slate-500 ${
                        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#100a22]/50 border-cyber-border'
                      }`}>
                        Nenhuma configuração ou payload corresponde à sua pesquisa e filtros atuais.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {items.map(p => (
                        <div
                          key={p.id}
                          className={`rounded-2xl border p-4 shadow flex flex-col justify-between gap-4 transition-all duration-300 ${
                            theme === 'light' ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-[#100a22] border-cyber-border hover:border-cyber-border/80'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] border font-mono font-bold px-2.5 py-0.5 rounded-md uppercase ${
                                theme === 'light' 
                                  ? 'bg-slate-50 border-slate-250 text-slate-650' 
                                  : 'bg-cyber-bg border-cyber-border text-neon-yellow'
                              }`}>
                                {p.carrier}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">{p.protocol}</span>
                            </div>

                            <h3 className={`font-display font-black text-sm font-mono tracking-tight leading-tight uppercase ${
                              theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                            }`}>
                              {p.name}
                            </h3>
                          </div>

                          {/* SNI metadata display */}
                          <div className={`p-2 sm:p-2.5 rounded-xl text-xs font-mono select-none border ${
                            theme === 'light' ? 'bg-slate-50 border-slate-150' : 'bg-cyber-bg border-cyber-border'
                          }`}>
                            <span className="block text-[9px] uppercase text-slate-400 font-bold">Host SNI</span>
                            <span className={`tracking-wide block truncate ${theme === 'light' ? 'text-slate-700 font-semibold' : 'text-neon-green'}`}>{p.sni}</span>
                          </div>

                          {/* Raw payload output box */}
                          <div className={`p-2.5 rounded-lg border font-mono text-[10px] max-h-[80px] overflow-y-auto whitespace-pre-wrap select-all ${
                            theme === 'light' ? 'bg-slate-50 border-slate-150 text-slate-600' : 'bg-cyber-bg/90 border-cyber-border/60 text-slate-400'
                          }`}>
                            {p.payload}
                          </div>

                          <div className={`flex items-center justify-between border-t pt-3 px-1 rounded-md ${
                            theme === 'light' ? 'border-slate-100 bg-slate-50/20' : 'border-cyber-border/70 bg-cyber-surface/40'
                          }`}>
                            
                            {/* 1-click Copy Payload Code */}
                            <button
                              type="button"
                              onClick={() => triggerCopy(p.name, p.payload)}
                              className={`px-4 py-1.5 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                                theme === 'light'
                                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                                  : 'bg-neon-yellow hover:bg-amber-400 text-slate-950 glow-yellow'
                              }`}
                            >
                              {copiedStates[p.name] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedStates[p.name] ? 'Copiado!' : 'Copiar Payload'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Tem certeza que dejsa excluir o payload ${p.name}?`)) {
                                  onDeletePayload(p.id);
                                }
                              }}
                              className="p-1 px-2.5 text-[10px] font-bold text-red-500 hover:text-red-400 hover:bg-red-50 border border-slate-20s hover:border-red-400 rounded-lg cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  );
                })()}

              </motion.div>
            )}

            {/* TAB: APK DIGITAL COMPILER & SIMULATOR PREVIEW */}
            {activeTab === 'apk' && (
              <motion.div
                key="apk-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                
                {/* COLUMN 1: BUILD FORM & HISTORIC DOWNLOAD LINKS (Left side) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Card 1: Build Configuration Status Tag (Image 1 style) */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#100a22]/85 border-cyber-border'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-3.5 mb-4">
                      <div>
                        <h3 className={`font-display text-sm font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                          Configuração de build
                        </h3>
                        <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Status atual de compilação da base principal</p>
                      </div>
                      <span className={`text-[10px] pb-0.5 px-3 py-1 rounded-full font-mono font-black ${
                        apkLoading 
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                          : 'bg-emerald-555/15 text-emerald-600 border border-emerald-500/35'
                      }`}>
                        {apkLoading ? 'COMPILANDO...' : 'SINCALIZADO / PRONTO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-[11px]">
                      <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-cyber-bg border-cyber-border'}`}>
                        <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Base selecionada</span>
                        <strong className={theme === 'light' ? 'text-slate-700' : 'text-neon-yellow'}>{apkBase}</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-cyber-bg border-cyber-border'}`}>
                        <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Versão atualizada</span>
                        <strong className="text-slate-400">{apkVersionName} ({apkVersionCode})</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-cyber-bg border-cyber-border'}`}>
                        <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Links desta sessão</span>
                        <strong className={theme === 'light' ? 'text-emerald-650' : 'text-neon-green'}>{apkLinks.length} registro(s)</strong>
                      </div>
                    </div>

                    {/* Links desta sessão box (Image 1 detailed list) */}
                    <div className="mt-4 pt-4 border-t border-slate-250/10">
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Links desta sessão (Histórico do compilador)
                      </h4>

                      {apkLinks.length === 0 ? (
                        <div className={`p-6 border border-dashed rounded-xl text-center text-xs text-slate-400 transition-colors ${
                          theme === 'light' ? 'border-slate-300' : 'border-cyber-border'
                        }`}>
                          Nenhum link nesta sessão. Configure as credenciais e clique em <b>"Gerar APK"</b> para que os links apareçam aqui.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                          {apkLinks.map(lnk => (
                            <div key={lnk.id} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-colors ${
                              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-cyber-bg/70 border-cyber-border'
                            }`}>
                              <div className="space-y-1.5 max-w-full sm:max-w-[45%]">
                                <p className="font-bold truncate text-slate-405 leading-none uppercase">{lnk.name} ({lnk.version})</p>
                                <p className="text-[10px] text-slate-400 truncate tracking-wide">{lnk.packageId}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadMockApk(lnk)}
                                  className="p-1.5 px-2 rounded-lg font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                                  style={{ contentVisibility: 'auto' }}
                                  title="Baixar arquivo de simulação compilado com suas customizações"
                                >
                                  📥 APK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadConfig(lnk)}
                                  className={`p-1.5 px-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                    theme === 'light'
                                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                      : 'bg-indigo-950/40 border border-indigo-500/20 hover:bg-indigo-550/20 text-indigo-300'
                                  }`}
                                  title="Exportar arquivo de parâmetros JSON"
                                >
                                  ⚙️ Config
                                </button>
                                <button
                                  type="button"
                                  onClick={() => triggerCopy(lnk.id, lnk.url)}
                                  className={`p-1.5 px-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                    theme === 'light'
                                      ? 'bg-slate-850 hover:bg-slate-900 text-white'
                                      : 'bg-neon-yellow hover:bg-amber-400 text-slate-950 glow-yellow'
                                  }`}
                                >
                                  {copiedStates[lnk.id] ? 'Copiado' : 'Link'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Compiling Parameters (Image 3 / 4 style layout) */}
                  <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#100a22]/85 border-cyber-border'
                  }`}>
                    <div>
                      <h3 className={`font-display text-sm font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-805' : 'text-slate-100'}`}>
                        Parâmetros da compilação
                      </h3>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Identidade visual e interna do executável Android</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                      
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Versão Base do Framework</label>
                        <select
                          value={apkBase}
                          onChange={(e) => {
                            setApkBase(e.target.value);
                            setApkPackage(e.target.value.toLowerCase().includes('pro') ? 'com.xtunnel.pro' : 'com.xtunnel.lite');
                            setApkName(e.target.value);
                          }}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        >
                          <option value="XTUNNEL Lite">XTUNNEL Lite v5.5.0 (Sugerido para conexões fluidas)</option>
                          <option value="XTUNNEL Pro">XTUNNEL Pro v5.5.0 Stable (Garante suporte a V2Ray e Shadowsocks)</option>
                          <option value="XTunnel Extreme">XTunnel Legacy v3.2.0 (Embutido com proxy reverso avançado)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modo de Conexão Embutido do APK</label>
                        <select
                          value={apkProtocol}
                          onChange={(e) => setApkProtocol(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        >
                          <option value="SSH Direct">SSH Direct</option>
                          <option value="SSH Proxy">SSH Proxy</option>
                          <option value="SSH DNSTT">SSH DNSTT</option>
                          <option value="SSL Direct">SSL Direct</option>
                          <option value="SSL Proxy">SSL Proxy</option>
                          <option value="V2Ray">V2Ray</option>
                          <option value="XRay">XRay</option>
                          <option value="XRay Reality">XRay + REALITY (TLS Vless)</option>
                          <option value="Hysteria">Hysteria</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do painel / App</label>
                        <input
                          type="text"
                          value={apkName}
                          onChange={(e) => setApkName(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Pacote (Android Bundle ID)</label>
                        <input
                          type="text"
                          value={apkPackage}
                          onChange={(e) => setApkPackage(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome da versão literária</label>
                        <input
                          type="text"
                          value={apkVersionName}
                          onChange={(e) => setApkVersionName(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Código da versão (Build Code)</label>
                        <input
                          type="number"
                          value={apkVersionCode}
                          onChange={(e) => setApkVersionCode(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                            theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">URL Logotipo (.PNG recomendável)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={apkLogoUrl}
                            onChange={(e) => setApkLogoUrl(e.target.value)}
                            className={`flex-grow px-3 py-2 border rounded-xl focus:outline-none focus:border-neon-purple ${
                              theme === 'light' ? 'bg-slate-50 border-slate-350 text-slate-800' : 'bg-[#07040e] border-cyber-border text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setApkLogoUrl('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100&fit=crop');
                              pushLog("Logotipo do APK reconfigurado para a imagem padrão.", "info");
                            }}
                            className={`p-2 border rounded-xl hover:text-red-500 cursor-pointer ${
                              theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-400' : 'bg-cyber-bg border-cyber-border text-slate-400'
                            }`}
                            title="Remover Ícone"
                          >
                            ✖
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const promptUrl = prompt("Insira a URL direta da imagem da logo:", apkLogoUrl);
                              if (promptUrl) setApkLogoUrl(promptUrl);
                            }}
                            className={`p-2 px-3 border rounded-xl cursor-pointer text-[10px] uppercase font-bold ${
                              theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#1a1135] hover:bg-indigo-950 border-cyber-border text-[#b026ff]'
                            }`}
                          >
                            Upload
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[9px] text-slate-400 self-center font-mono uppercase">Sugestões de Logo:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setApkLogoUrl('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100&fit=crop');
                              pushLog("Logotipo do APK alterado para Escudo Neon.", "info");
                            }}
                            className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-all uppercase font-semibold"
                          >
                            🔒 Escudo Neon
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setApkLogoUrl('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop');
                              pushLog("Logotipo do APK alterado para Malha Tech.", "info");
                            }}
                            className="text-[9px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-405 border border-purple-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-all uppercase font-semibold"
                          >
                            🌌 Malha Tech
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setApkLogoUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop');
                              pushLog("Logotipo do APK alterado para Ouro Glow.", "info");
                            }}
                            className="text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-all uppercase font-semibold"
                          >
                            🔱 Ouro Glow
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card 3: Offline Sync Package checkboxes (Image 5 style) */}
                  <div className={`p-5 rounded-2xl border space-y-4.5 transition-all duration-300 ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#100a22]/85 border-cyber-border'
                  }`}>
                    <div>
                      <h3 className={`font-display text-sm font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-805' : 'text-slate-100'}`}>
                        Módulos de contingência offline
                      </h3>
                      <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Checklists de emuladores offline a embutir nos ativos (Assets/)</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-tight font-mono">
                      
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-500/5 border border-slate-250/10 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={apkOfflineTema}
                          onChange={(e) => setApkOfflineTema(e.target.checked)}
                          className="mt-0.5 accent-neon-purple h-4 w-4"
                        />
                        <div>
                          <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>Tema offline</strong>
                          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Customiza a UI dentro do APK</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-500/5 border border-slate-250/10 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={apkOfflineTextos}
                          onChange={(e) => setApkOfflineTextos(e.target.checked)}
                          className="mt-0.5 accent-neon-purple h-4 w-4"
                        />
                        <div>
                          <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>Textos e canais</strong>
                          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Strings.xml padrão pré-carregadas</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-500/5 border border-slate-250/10 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={apkOfflineCDNs}
                          onChange={(e) => setApkOfflineCDNs(e.target.checked)}
                          className="mt-0.5 accent-neon-purple h-4 w-4"
                        />
                        <div>
                          <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>CDNs offline</strong>
                          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Segurança contra desligamentos</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-500/5 border border-slate-250/10 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={apkOfflineConfig}
                          onChange={(e) => setApkOfflineConfig(e.target.checked)}
                          className="mt-0.5 accent-neon-purple h-4 w-4"
                        />
                        <div>
                          <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>Preload Servidores</strong>
                          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Servidores embutidos diretamente</p>
                        </div>
                      </label>

                    </div>

                    {/* Progress visual compilation output box */}
                    {apkLoading && (
                      <div className="space-y-2 mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-amber-500 font-bold uppercase tracking-wider">
                          <span>Compilando Ativos Android...</span>
                          <span>{apkBuildPercent}%</span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${apkBuildPercent}%` }} />
                        </div>
                        <pre className="max-h-[100px] overflow-y-auto mt-2 text-slate-400 text-[9px] whitespace-pre-wrap leading-relaxed select-all">
                          {apkBuildOutput}
                        </pre>
                      </div>
                    )}

                    {/* Trigger Generate APK Compiler action */}
                    <button
                      type="button"
                      disabled={apkLoading}
                      onClick={handleCompileAPK}
                      className={`w-full py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2 ${
                        apkLoading
                          ? 'bg-amber-600/20 border border-amber-500/20 text-amber-400 cursor-not-allowed animate-pulse'
                          : theme === 'light'
                            ? 'bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white shadow-lg'
                            : 'bg-gradient-to-r from-[#b026ff] to-indigo-600 hover:from-[#9600f5] hover:to-indigo-700 text-white shadow-lg shadow-indigo-650/15'
                      }`}
                    >
                      {apkLoading ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin text-amber-500" />
                          CONSTRUINDO PACOTE ANDROID ({apkBuildPercent}%)
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 text-neon-yellow" fill="currentColor" />
                          GERAR NOVO APK COMPILADO
                        </>
                      )}
                    </button>
                    
                  </div>

                </div>

                {/* COLUMN 2: COMMUNITY THEMES & COMMUNITY MOBILE EMULATOR (Right side matching Image 2 & Image 8) */}
                <div className="lg:col-span-5 flex flex-col justify-start">
                  
                  {/* Smartphone Chassis visual card container */}
                  <div className={`p-6 rounded-3xl border flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    theme === 'light' 
                      ? 'bg-slate-200 border-slate-300 shadow-slate-400/40' 
                      : 'bg-[#100a22]/30 border-cyber-border shadow-black/80'
                  }`}>
                    
                    {/* Perfect Phone structure mimicking Image 8 screen app interface */}
                    <div className="w-full max-w-[285px] bg-[#07040e] border-[7px] border-slate-950 rounded-[36px] shadow-2xl overflow-hidden flex flex-col select-none relative h-[530px]">
                      
                      {/* Top camera/speaker notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <span className="w-5 h-0.5 bg-slate-800 rounded" />
                      </div>

                      {/* Phone internal screen status bar */}
                      <div className="h-6.5 bg-[#100a22] flex items-center justify-between px-4 pt-1 font-mono text-[9px] text-slate-450 text-slate-300 select-none z-10 shrink-0">
                        <span>12:45</span>
                        <div className="flex items-center gap-1 text-[8px]">
                          <span>5G</span>
                          <span className="leading-none text-neon-green">🔋 100%</span>
                        </div>
                      </div>

                      {/* Phone inner title & logo */}
                      <div className="p-4 bg-gradient-to-b from-[#100a22] to-[#07040e] flex items-center justify-between border-b border-cyber-border/40 min-h-[50px] shrink-0">
                        <div className="flex items-center gap-1.5">
                          {apkLogoUrl ? (
                            <img
                              src={apkLogoUrl}
                              alt="Logo"
                              className="w-6 h-6 rounded-md object-cover border border-[#b026ff]/30"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="bg-neon-purple/10 border border-neon-purple text-neon-yellow font-display font-black text-[9px] h-6 w-7 rounded-md flex items-center justify-center tracking-tighter">
                              EV
                            </div>
                          )}
                          <div>
                            <span className="text-[7px] font-bold text-shadow-green tracking-[0.15em] text-neon-green block -mb-0.5 font-mono">EVOLUTION</span>
                            <span className="text-[12px] font-black text-white tracking-tight leading-none block">XTUNNEL</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-[#b026ff]/20 text-[#b026ff] px-1.5 py-0.5 rounded-full font-mono uppercase font-black tracking-widest">
                          LITE
                        </span>
                      </div>

                      {/* Device body background preview */}
                      <div className="flex-grow p-4 flex flex-col justify-between overflow-y-auto">
                        
                        <div className="space-y-3.5">
                          {/* Live instructions banner */}
                          <div className="p-2 border border-cyber-border bg-[#100a22]/50 rounded-xl text-[9px] text-slate-300 font-mono leading-relaxed">
                            💡 Altere as configurações no menu de build para atualizar esta visualização ao vivo!
                          </div>

                          {/* Connection profile selector dropdown emulator */}
                          <div className="space-y-1">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold ml-1">Configuração de Payload</span>
                            <select
                              value={selectedPhonePayload}
                              onChange={(e) => setSelectedPhonePayload(e.target.value)}
                              className="w-full px-2.5 py-2 hover:bg-[#1a1135]/80 bg-[#100a22] border border-cyber-border rounded-xl text-[10px] text-white font-mono uppercase focus:outline-none focus:border-neon-purple cursor-pointer"
                            >
                              {allPayloads.map(p => (
                                <option key={p.id} value={p.id} className="text-white bg-[#07040e]">
                                  🚀 {p.carrier.toUpperCase()} - {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Login credentials fields */}
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold ml-1 mb-0.5">Usuário</span>
                              <input
                                type="text"
                                value={phoneUsername}
                                onChange={(e) => setPhoneUsername(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#100a22] border border-cyber-border text-white text-[10px] rounded-xl focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold ml-1 mb-0.5">Senha</span>
                              <input
                                type="password"
                                value={phonePassword}
                                onChange={(e) => setPhonePassword(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#100a22] border border-cyber-border text-white text-[10px] rounded-xl focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Terminal logs viewport inside telephone */}
                          <div className="space-y-1 font-mono text-[8px]">
                            <span className="block uppercase tracking-wider text-[7px] text-[#39ff14]/80 ml-1">Console do Túnel</span>
                            <div className="w-full h-[95px] bg-[#030107] border border-cyber-border/80 rounded-xl p-2 overflow-y-auto leading-normal text-slate-400">
                              {phoneLogs.map((log, idx) => (
                                <p key={idx} className="truncate">
                                  {log}
                                </p>
                              ))}
                              {phoneConnecting && <span className="inline-block h-2 w-1.5 bg-[#39ff14] animate-pulse ml-0.5" />}
                            </div>
                          </div>
                        </div>

                        {/* Large Connection Button Container with interactive glows */}
                        <div className="space-y-3 pt-2">
                          <button
                            type="button"
                            onClick={handleTogglePhoneConnection}
                            className={`w-full py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1 ${
                              phoneConnected 
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/10' 
                                : phoneConnecting
                                  ? 'bg-amber-600/35 border border-amber-500/30 text-amber-500 cursor-wait animate-pulse'
                                  : 'bg-gradient-to-r from-neon-purple to-indigo-600 text-white font-black hover:opacity-90 shadow-md shadow-neon-purple/20'
                            }`}
                          >
                            {phoneConnected ? 'PARAR' : phoneConnecting ? 'CONECTANDO...' : 'INICIAR CONEXÃO'}
                          </button>

                          {/* Status Indicators bar of emulator */}
                          <div className="flex items-center justify-between border-t border-cyber-border/40 pt-2 px-1 text-[8px] font-mono text-slate-400 select-none">
                            <span className="flex items-center gap-1 uppercase">
                              Estado: <b className={phoneConnected ? 'text-neon-green' : 'text-slate-400'}>{phoneStatusText}</b>
                            </span>
                            <span>EVOLUTION LITE v5.5.0</span>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 4: TEAM RESELLERS MANAGEMENT / STATS LEADERBOARD */}
            {activeTab === 'resellers' && (
              <motion.div
                key="resellers-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <h2 className="font-display text-lg font-black text-slate-100 flex items-center gap-2 uppercase">
                      <Users className="w-5 h-5 text-neon-green" /> Limite de Logins de Revendedores
                    </h2>
                    <p className="text-xs text-slate-400">Gerenciamento de limites de conexões simultâneas e vagas para seus revendedores parceiros.</p>
                  </div>
                  
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 self-start bg-cyber-surface border border-cyber-border px-3 py-1.5 rounded-xl select-none">
                    <span className="w-2 h-2 rounded-full bg-neon-green shadow-md animate-pulse" /> 
                    Você é: <strong className="text-neon-yellow font-black uppercase text-[10px]">{currentUser.role}</strong>
                  </div>
                </div>

                {/* Admin credit loading tool drawer */}
                {currentUser.isAdmin && (
                  <div className="bg-cyber-surface p-5 rounded-2xl border border-neon-purple/40">
                    <h3 className="text-xs font-black text-neon-purple uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-cyber-border/80">
                      <Coins className="w-4 h-4 text-neon-yellow" fill="currentColor" /> Limite de Conexões de Revendedor
                    </h3>
                    
                    <form onSubmit={handleAddCreditsSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider mb-1.5 font-mono">Selecionar Revendedor</label>
                        <select
                          required
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white focus:outline-none"
                        >
                          <option value="">Selecione distribuidor...</option>
                          {allUsers.filter(u => u.id !== currentUser.id).map(u => (
                            <option key={u.id} value={u.id}>
                              {u.avatar} {u.name} - (Limite atual: {u.credits} logins)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-355 uppercase tracking-wider mb-1.5 font-mono">Novo Limite de Logins</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="500"
                          value={creditsAmount}
                          onChange={(e) => setCreditsAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-xl text-xs text-white font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 bg-neon-purple hover:bg-neon-purple-hover text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md glow-purple h-[38px] flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Atualizar Limite
                      </button>

                    </form>
                  </div>
                )}

                {/* Team Grid Table / Rankings of volume */}
                <div className="bg-cyber-surface rounded-2xl border border-cyber-border overflow-hidden shadow-xl">
                  
                  {/* Table header */}
                  <div className="grid grid-cols-12 bg-cyber-bg/70 px-4 py-3 border-b border-cyber-border/80 text-xs font-black text-slate-300 font-mono text-center select-none">
                    <div className="col-span-1 text-left">POS</div>
                    <div className="col-span-5 text-left">REPRESENTANTE COMERCIAL</div>
                    <div className="col-span-3">ROLE TERMINAL</div>
                    <div className="col-span-3 text-right">LIMITE DE ACESSOS / LOGINS</div>
                  </div>

                  <div className="divide-y divide-cyber-border/60">
                    {allUsers.map((u, idx) => {
                      const isMe = u.id === currentUser.id;
                      return (
                        <div
                          key={u.id}
                          className={`grid grid-cols-12 items-center px-4 py-3 text-sm transition-all text-center ${
                            isMe 
                              ? 'bg-neon-purple/15 border-l-4 border-l-neon-purple border-r-4 border-r-neon-purple/10' 
                              : 'hover:bg-cyber-bg/50'
                          }`}
                        >
                          <div className="col-span-1 text-left font-mono font-black text-slate-350">
                            #{idx + 1}
                          </div>

                          <div className="col-span-5 flex items-center gap-2 text-left">
                            <span className="text-base select-none">{u.avatar}</span>
                            <div className="truncate">
                              <span className={`font-bold block truncate ${isMe ? 'text-neon-green font-black text-shadow-green' : 'text-slate-100'}`}>
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">{u.email}</span>
                            </div>
                          </div>

                          <div className="col-span-3">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              u.isAdmin ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-neon-green/10 border border-neon-green/30 text-neon-green text-shadow-green'
                            }`}>
                              {u.role}
                            </span>
                          </div>

                          <div className="col-span-3 text-right font-display font-black text-slate-100 pr-1">
                            {u.isAdmin ? (
                              <span className="text-neon-purple text-xs font-black tracking-widest text-shadow-purple font-mono">SUPREMO (ILIMITADO)</span>
                            ) : (
                              <span className="font-mono text-neon-yellow text-shadow-yellow text-base">{u.credits} <span className="text-[9px] text-slate-450 font-normal">LOGINS</span></span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Informational Matriz panel */}
                <div className="bg-cyber-surface p-3.5 rounded-xl border border-cyber-border flex items-start gap-2.5 shadow-md">
                  <Coins className="w-5 h-5 text-neon-yellow shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    <strong className="text-neon-green">Contas Mensais (30 Dias):</strong> Cada conta de cliente criada tem vigência contratual de 30 dias de acesso completo e renovável. Certifique-se apenas de que a soma total de logins simultâneos de seus clientes ativos não ultrapasse o teto contratado do seu plano revendedor!
                  </p>
                </div>

              </motion.div>
            )}

            {/* TAB: TUTORIAIS & ALTERNATIVAS SEM VPS */}
            {activeTab === 'tutoriais' && (
              <motion.div
                key="tutoriais-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 animate-fade-in"
              >
                {/* Intro Hero banner matching image style */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#100a22]/85 border-cyber-border'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neon-green/10 text-neon-green rounded-xl border border-neon-green/20 shrink-0">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h2 className={`font-display text-lg font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                        Alternativas de Roteamento (Sem VPS Tradicional)
                      </h2>
                      <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Não quer ou não pode contratar uma VPS dedicada contratada mensalmente? 
                        Descubra como hospedar e expor túneis criptografados de alta velocidade para os usuários do aplicativo <strong>XTUNNEL</strong> usando soluções serverless, containers grátis, ou o próprio hardware doméstico.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid of alternatives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                  
                  {/* Option 1: Cloudflare Workers */}
                  <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-[#100a22]/80 border-cyber-border hover:border-neon-purple/30'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase select-none">
                          Cloudflare Workers
                        </span>
                        <span className="text-[9.5px] text-neon-green font-mono uppercase font-black tracking-widest select-none">
                          100% GRÁTIS / TRÁFEGO SEU LIMITLESS
                        </span>
                      </div>
                      
                      <h3 className={`font-display font-black text-sm uppercase ${theme === 'light' ? 'text-slate-800 font-bold' : 'text-white'}`}>
                        Mapeamento Serverless VLESS (Borda CDN)
                      </h3>
                      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Rode um proxy VLESS (protocolo de alto desempenho suportado pelo XTUNNEL) diretamente em microsserviços serverless na Cloudflare. O tráfego passa mascarado pela porta 443 através de rotas CDN, eliminando lentidão e a obrigação de ter uma máquina VPS ligada!
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="block text-[8.5px] uppercase font-mono tracking-wider text-slate-400 font-bold select-none">Código padrão para colar na Cloudflare:</span>
                      <div className={`p-2.5 rounded-lg border font-mono text-[9px] max-h-[140px] overflow-y-auto whitespace-pre leading-relaxed ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-cyber-bg/95 border-cyber-border/70 text-slate-400'
                      }`}>
{`// Script Serverless VLESS para Cloudflare Workers
const uuid = 'seu-uuid-aqui'; // Altere para um UUID v4 de sua preferência
export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      return await vlessWebSocketHandler(request, uuid);
    }
    return new Response('Ponto Ativo de Transmissão XTunnel Serverless', {
      status: 200,
      headers: { 'content-type': 'text/plain;charset=utf-8' }
    });
  }
};`}
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerCopy('Worker VLESS', `// Script Serverless VLESS para Cloudflare Workers
const uuid = "fd282cfd-3f0a-42c2-9e96-a320c2b2fa80";
export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      return await vlessWebSocketHandler(request, uuid);
    }
    return new Response("Ponto Ativo de Transmissão XTunnel Serverless", {
      status: 200,
      headers: { 'content-type': 'text/plain;charset=utf-8' }
    });
  }
};`)}
                        className={`w-full py-2.5 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          theme === 'light'
                            ? 'bg-slate-800 text-white'
                            : 'bg-neon-yellow text-slate-950 glow-yellow'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar Código do Worker
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Containers Gratuitos - PaaS */}
                  <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-[#100a22]/80 border-cyber-border hover:border-neon-purple/30'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-neon-purple/10 text-neon-purple border border-neon-purple/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase select-none">
                          Hospedagem de Containers
                        </span>
                        <span className="text-[9.5px] text-neon-green font-mono uppercase font-black tracking-widest select-none font-bold">
                          DOCKER PAAS GRATUITO
                        </span>
                      </div>
                      
                      <h3 className={`font-display font-black text-sm uppercase ${theme === 'light' ? 'text-slate-800 font-bold' : 'text-white'}`}>
                        Plataformas de Containers (Koyeb, Railway, Render)
                      </h3>
                      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Várias plataformas de nuvem modernas oferecem contas de teste ou cotas gratuitas para executar aplicações Docker. Você pode publicar um container executando o servidor Shadowsocks, Trojan ou Dropbear tunelado por Websocket sem possuir infraestrutura própria.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 text-[10.5px] font-mono leading-relaxed text-slate-405">
                      <p className="font-bold flex items-center gap-1 text-neon-green text-[10px]">🚀 DEPLOY EM 3 MINUTOS:</p>
                      <ol className="list-decimal pl-4.5 space-y-1 text-[10px]">
                        <li>Crie uma conta gratuita na plataforma <a href="https://www.koyeb.com" target="_blank" rel="noreferrer" className="text-neon-purple underline hover:text-neon-purple-hover">Koyeb.com</a> ou Render.</li>
                        <li>Selecione deploy por imagem pública Docker.</li>
                        <li>Utilize a imagem pública oficial: <code className="text-neon-yellow bg-cyber-bg px-1 py-0.5 rounded border border-cyber-border">teddysun/shadowsocks-libev</code></li>
                        <li>Defina suas variáveis de ambiente (<code className="text-neon-green">METHOD</code>, <code className="text-neon-green">PASSWORD</code>) e exponha a porta.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Option 3: Servidor Caseiro com Redirecionamento */}
                  <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-[#100a22]/80 border-cyber-border hover:border-neon-purple/30'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase select-none">
                          PC Físico / Localhost
                        </span>
                        <span className="text-[9.5px] text-neon-yellow font-mono uppercase font-black tracking-widest select-none font-bold">
                          REDIRECIONAMENTO TCP
                        </span>
                      </div>
                      
                      <h3 className={`font-display font-black text-sm uppercase ${theme === 'light' ? 'text-slate-800 font-bold' : 'text-white'}`}>
                        Tunelamento Local (Ngrok / Cloudflared)
                      </h3>
                      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Caso tenha uma máquina física em casa (computador antigo, notebook rodando Linux ou Raspberry Pi), você pode rodar o OpenSSH ou Dropbear localmente e usar proxies de tráfego para exportar a sua porta 22 residencial para a web mundial de forma segura!
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 text-[10.5px] font-mono leading-relaxed text-slate-405">
                      <p className="font-bold text-[10px] flex items-center gap-1 text-neon-yellow">🛠️ EXPOR PORTA SSH VIA LINHA DE COMANDO:</p>
                      <div className={`p-2 rounded-lg border text-[9px] select-all leading-normal whitespace-normal ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-cyber-bg border-cyber-border text-neon-green'
                      }`}>
                        cloudflared tunnel --url tcp://localhost:22
                      </div>
                      <p className="text-[9.5px]">A Cloudflare fornecerá uma rota TCP automática e grátis (<code className="text-slate-205">exemplo.trycloudflare.com:porta</code>) para colocar no painel de controle!</p>
                    </div>
                  </div>

                  {/* Option 4: Provedores SSH Gratuitos */}
                  <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-[#100a22]/80 border-cyber-border hover:border-neon-purple/30'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase select-none">
                          APIs Compartilhadas
                        </span>
                        <span className="text-[9.5px] text-pink-500 font-mono uppercase font-black tracking-widest select-none">
                          CONTAS DE TERCEIROS
                        </span>
                      </div>
                      
                      <h3 className={`font-display font-black text-sm uppercase ${theme === 'light' ? 'text-slate-800 font-bold' : 'text-white'}`}>
                        Sites de SSH e Trojan Gratuitos Externos
                      </h3>
                      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Se você precisa de infraestrutura de testes rápidos e sem custos operacionais, use contas criadas em sites internacionais de compartilhamento. Serviços consolidados como <b>FastSSH</b>, <b>SSHKit</b> ou <b>VPNJantit</b> oferecem painéis de criação rápida para você conectar ao seu arquivo raw de payload.
                      </p>
                    </div>

                    <div className="pt-2 text-[10px] font-mono leading-relaxed text-slate-405 border-t border-cyber-border/40 flex items-start gap-1.5">
                      <Shield className="w-4 h-4 text-neon-yellow shrink-0 mt-0.5" />
                      <span><b>Lembrete de Segurança:</b> Use esses servidores compartilhados apenas para demonstrar o tunelamento a revendedores ou testar payloads de operadoras, evitando trafegar dados pessoais ultrasseguros.</span>
                    </div>
                  </div>

                </div>

                {/* Back Link bottom info box */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#0a0518] border-cyber-border text-slate-350 bg-opacity-40'
                }`}>
                  <span className="flex items-center gap-1.5 select-none"><Activity className="w-4 h-4 text-neon-green" /> O compilador e emulador de celular XTUNNEL suportam qualquer uma dessas rotas!</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('contas');
                      pushLog("Retornou à visualização de Contas SSH Comerciais", "info");
                    }}
                    className="text-neon-green hover:underline font-black uppercase text-[10px] cursor-pointer"
                  >
                    Voltar para Contas SSH
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM REAL-TIME CONNECTION LOGS TERMINAL COSOLE */}
        <section className="mt-8">
          <div className="bg-cyber-surface rounded-2xl border border-cyber-border overflow-hidden shadow-2xl shadow-neon-purple/5">
            
            {/* Terminal Title Header */}
            <div className="bg-cyber-bg/85 px-4 py-3 border-b border-cyber-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2 select-none">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neon-yellow shadow" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neon-green shadow" />
                </div>
                <div className="h-4 w-[1px] bg-cyber-border/90 mx-1" />
                <span className="text-[10px] font-black text-neon-green font-mono uppercase tracking-widest text-shadow-green flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-shadow-green animate-pulse" /> Console de Redirecionamento XTUNNEL LIVE
                </span>
              </div>
              <div className="flex items-center gap-1 bg-cyber-surface/60 border border-cyber-border rounded px-2 py-0.5 font-mono text-[9px] text-slate-400 select-none">
                <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-ping" />
                <span>RECEBENDO METADADOS (8.0s tick)</span>
              </div>
            </div>

            {/* Custom Log Entries list viewer scrollable */}
            <div className="p-4 bg-slate-950 font-mono text-[11px] h-[178px] overflow-y-auto space-y-1.5 select-all scrollbar-none">
              {allLogs.map(log => {
                let badgeColor = 'text-slate-400';
                if (log.type === 'success') badgeColor = 'text-neon-green text-shadow-green font-bold';
                if (log.type === 'warn') badgeColor = 'text-neon-yellow text-shadow-yellow font-bold';
                if (log.type === 'error') badgeColor = 'text-red-400 font-extrabold';

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={`shrink-0 uppercase text-[9.5px] border border-current px-1 py-0.2 rounded-md ${badgeColor} text-[8px] leading-3 tracking-wider`}>
                      {log.type}
                    </span>
                    <span className="text-slate-350">{log.message}</span>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

      </main>

      {/* Footer System Margin Cleaner */}
      <footer className="mt-8 border-t border-cyber-border/60 py-4 bg-cyber-surface/30 select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
          <span>© 2026 EVOLUTION GROUP. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-neon-purple" /> Núcleo federado de criptografia inquebrável XTUNNEL.
          </span>
        </div>
      </footer>

    </div>
  );
}

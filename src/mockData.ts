/**
 * Realistic VPN & SSH tunneling mock database for EVOLUTION XTUNNEL.
 * @license Apache-2.0
 */

import { SshServer, SshAccount, ConnectionPayload, User, LogLine } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Ricardo Souza',
    email: 'ricardo@sport.com',
    credits: 154,
    avatar: '⚡',
    rank: 1,
    role: 'admin',
    isReseller: true,
    isAdmin: true,
  },
  {
    id: 'user_2',
    name: 'Henrique Silva',
    email: 'henrique@sport.com',
    credits: 42,
    avatar: '👑',
    rank: 2,
    role: 'reseller',
    isReseller: true,
    isAdmin: false,
  },
  {
    id: 'user_3',
    name: 'Ana Oliveira',
    email: 'ana@sport.com',
    credits: 89,
    avatar: '🔥',
    rank: 3,
    role: 'reseller',
    isReseller: true,
    isAdmin: false,
  }
];

export const INITIAL_SERVERS: SshServer[] = [
  {
    id: 'srv_1',
    name: 'BR-PREMIUM-SÃO PAULO 01',
    flag: '🇧🇷',
    domain: 'br1.evolutionxtunnel.net',
    status: 'online',
    usersCount: 64,
    maxUsers: 150,
    latency: 18,
    category: 'Premium',
    protocols: ['Direct SSH', 'WebSocket TLS', 'SSL SNI'],
    bbrEnabled: true
  },
  {
    id: 'srv_2',
    name: 'BR-VIP-RIO DE JANEIRO 02',
    flag: '🇧🇷',
    domain: 'br-vip2.evolutionxtunnel.net',
    status: 'online',
    usersCount: 89,
    maxUsers: 100,
    latency: 22,
    category: 'VIP',
    protocols: ['Direct SSH', 'WebSocket TLS', 'SSL SNI', 'V2Ray'],
    bbrEnabled: true
  },
  {
    id: 'srv_3',
    name: 'BR-FREE-AD-SP 03',
    flag: '🇧🇷',
    domain: 'free3.evolutionxtunnel.net',
    status: 'online',
    usersCount: 142,
    maxUsers: 150,
    latency: 35,
    category: 'Bronze',
    protocols: ['WebSocket TLS'],
    bbrEnabled: false
  },
  {
    id: 'srv_4',
    name: 'US-GIGABIT-NEW YORK 01',
    flag: '🇺🇸',
    domain: 'us1-giga.evolutionxtunnel.net',
    status: 'online',
    usersCount: 12,
    maxUsers: 120,
    latency: 110,
    category: 'Premium',
    protocols: ['Direct SSH', 'V2Ray'],
    bbrEnabled: true
  },
  {
    id: 'srv_5',
    name: 'DE-V2RAY-FRANKFURT 05',
    flag: '🇩🇪',
    domain: 'de5.evolutionxtunnel.net',
    status: 'maintenance',
    usersCount: 0,
    maxUsers: 80,
    latency: 999,
    category: 'V2Ray',
    protocols: ['V2Ray', 'WebSocket TLS'],
    bbrEnabled: false
  }
];

export const INITIAL_ACCOUNTS: SshAccount[] = [
  {
    id: 'acc_1',
    username: 'net_gratis_v7',
    password: 'v7',
    limit: 1,
    expirationDate: '2026-07-10',
    status: 'active',
    isTest: false,
    ownerId: 'user_1',
    ownerName: 'Ricardo Souza',
    bandwidthUsed: 45.2,
    serverId: 'srv_1'
  },
  {
    id: 'acc_2',
    username: 'turbo_claro_max',
    password: '542',
    limit: 2,
    expirationDate: '2026-07-25',
    status: 'active',
    isTest: false,
    ownerId: 'user_1',
    ownerName: 'Ricardo Souza',
    bandwidthUsed: 120.4,
    serverId: 'srv_2'
  },
  {
    id: 'acc_3',
    username: 'vivo_easy_limitless',
    password: 'easy',
    limit: 5,
    expirationDate: '2026-06-30',
    status: 'active',
    isTest: false,
    ownerId: 'user_2',
    ownerName: 'Henrique Silva',
    bandwidthUsed: 312.8,
    serverId: 'srv_2'
  },
  {
    id: 'acc_4',
    username: 'teste_rapido_949',
    password: '12',
    limit: 1,
    expirationDate: '2026-06-11T02:16:00Z', // Expiring test
    status: 'expired',
    isTest: true,
    ownerId: 'user_3',
    ownerName: 'Ana Oliveira',
    bandwidthUsed: 0.8,
    serverId: 'srv_3'
  },
  {
    id: 'acc_5',
    username: 'premium_user66',
    password: 'p1',
    limit: 3,
    expirationDate: '2026-05-15',
    status: 'suspended',
    isTest: false,
    ownerId: 'user_2',
    ownerName: 'Henrique Silva',
    bandwidthUsed: 14.5,
    serverId: 'srv_1'
  }
];

export const INITIAL_PAYLOADS: ConnectionPayload[] = [
  {
    id: 'pay_1',
    name: 'VIVO WEB-SOCKET ILIMITADO',
    carrier: 'Vivo',
    sni: 'cadastro.vivo.com.br',
    protocol: 'WebSocket SSL',
    payload: 'GET / HTTP/1.1[crlf]Host: [host][crlf]Upgrade: websocket[crlf]Connection: Keep-Alive[crlf]User-Agent: [ua][crlf]Referer: https://cadastro.vivo.com.br/[crlf][crlf]'
  },
  {
    id: 'pay_2',
    name: 'CLARO INTERNET SP-MAX',
    carrier: 'Claro',
    sni: 'claro-musica.com.br',
    protocol: 'SSL Tunnel',
    payload: 'CONNECT [host_port] HTTP/2.0[crlf]Host: claro-musica.com.br[crlf]X-Online-Host: claro-musica.com.br[crlf]Connection: Upgrade[crlf][crlf]'
  },
  {
    id: 'pay_3',
    name: 'TIM REDE FÁCIL DIRECT',
    carrier: 'Tim',
    sni: 'tim.com.br',
    protocol: 'SSH Direct',
    payload: 'GET http://tim.com.br/ HTTP/1.1[crlf]Host: [host][crlf]X-Online-Host: tim.com.br[crlf]X-Forward-Host: tim.com.br[crlf]Connection: Keep-Alive[crlf][crlf]'
  },
  {
    id: 'pay_4',
    name: 'UNIVERSAL SSL CLOUD-FLARE',
    carrier: 'Universal',
    sni: 'dash.cloudflare.com',
    protocol: 'WebSocket SSL',
    payload: 'GET /dns-query HTTP/1.1[crlf]Host: [host][crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]Sec-WebSocket-Key: [key][crlf][crlf]'
  },
  {
    id: 'pay_5',
    name: 'V2RAY CLOUDFLARE BACKUP',
    carrier: 'Vivo',
    sni: 'v2ray.cadastro.vivo.com.br',
    protocol: 'V2Ray',
    payload: 'vmess://eyJhZGQiOiI0NS4xMjUuNjUuMTUiLCJhaWQiOiIwIiwidm1lc3NfdXVpZCI6IjVhY2Q0MDY5LTgxNzgtNGE3MS1iMmUwLTI0YTFkYjY0ZDI2NCIsImhvc3QiOiJ2Mndhbi5leGFtcGxlLmNvbSIsImlkIjoiYTJiM2M0ZDUtZTZmNy00YTg4LWI5YzgtZDEyMzQ1Njc4OWFiIiwicGF0aCI6Ii92MndhbiIsInBvcnQiOiI0NDMiLCJwcyI6IlYyUmF5LVZJVk8iLCJ0bHMiOiJ0bHMiLCJ0eXBlIjoibm9uZSIsInZlciI6IjIifQ=='
  },
  {
    id: 'pay_6',
    name: 'XRAY VLESS SPEED PRO',
    carrier: 'Claro',
    sni: 'xray.claro-musica.com.br',
    protocol: 'XRay',
    payload: 'vless://fd282cfd-3f0a-42c2-9e96-a320c2b2fa80@xray.claro-musica.com.br:443?encryption=none&security=tls&type=ws&host=claro-musica.com.br&path=%2Fxray%2Fws#XRay-Claro'
  },
  {
    id: 'pay_7',
    name: 'HYSTERIA v2 HIGH PERFORMANCE',
    carrier: 'Tim',
    sni: 'hy2.tim.com.br',
    protocol: 'Hysteria',
    payload: 'hysteria2://my_secure_password@hy2.tim.com.br:443?insecure=1&mport=80,443#Hysteria2-TIM'
  },
  {
    id: 'pay_8',
    name: 'XRAY VLESS REALITY BYPASS',
    carrier: 'Vivo',
    sni: 'www.vivo.com.br',
    protocol: 'XRay Reality',
    payload: 'vless://fd282cfd-3f0a-42c2-9e96-a320c2b2fa80@vivo.com.br:443?encryption=none&security=reality&sni=www.vivo.com.br&pbk=reality_public_key_77a9a11&sid=df13e54&type=tcp&headerType=none#XRayReality-Vivo'
  }
];

export const INITIAL_LOGS: LogLine[] = [
  {
    id: 'log_1',
    timestamp: '01:12:04',
    type: 'info',
    message: 'Servidor BR-PREMIUM-01 inicializado com sucesso, escutando nas portas 80, 443, 8080.'
  },
  {
    id: 'log_2',
    timestamp: '01:12:06',
    type: 'success',
    message: 'Database sincronizada. 5 credenciais carregadas no cache de memória do túnel.'
  },
  {
    id: 'log_3',
    timestamp: '01:12:15',
    type: 'info',
    message: 'Operador Ricardo Souza autenticado via IP: 177.34.120.5'
  },
  {
    id: 'log_4',
    timestamp: '01:13:01',
    type: 'success',
    message: 'Túnel estabelecido: Usuário net_gratis_v7 conectado via WebSocket TLS (Porta 443).'
  },
  {
    id: 'log_5',
    timestamp: '01:14:42',
    type: 'warn',
    message: 'Tentativa de conexões simultâneas esgotadas para o cliente vivo_easy_limitless (IP: 189.6.12.5).'
  }
];

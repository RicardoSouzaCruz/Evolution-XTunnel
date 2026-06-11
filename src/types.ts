/**
 * Types definition for the EVOLUTION XTUNNEL panel.
 * @license Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number; // Balance of credits used to create client accounts
  avatar: string;
  rank: number; // Position in of billing volume or team reseller rank
  role: 'admin' | 'reseller';
  isReseller: boolean;
  isAdmin: boolean;
}

export interface SshServer {
  id: string;
  name: string;
  flag: string; // Emoji representing location (e.g. 🇧🇷, 🇺🇸)
  domain: string; // Domain name or IP
  status: 'online' | 'offline' | 'maintenance';
  usersCount: number;
  maxUsers: number;
  latency: number; // In milliseconds (e.g., 23ms)
  category: 'Premium' | 'VIP' | 'Bronze' | 'V2Ray';
  protocols: string[]; // ['Direct SSH', 'SSLTunnel', 'WebSocket', 'V2Ray']
}

export interface SshAccount {
  id: string;
  username: string;
  password: string;
  limit: number; // Limit of simultaneous devices
  expirationDate: string; // ISO string or short date
  status: 'active' | 'expired' | 'suspended';
  isTest: boolean; // Managed whether it's a quick test account (1h)
  ownerId: string; // Created by user id
  ownerName: string; // Name of creator
  bandwidthUsed: number; // In GB (e.g. 15.6 GB)
  serverId: string; // Bound to server id
}

export interface ConnectionPayload {
  id: string;
  name: string;
  carrier: 'Vivo' | 'Claro' | 'Tim' | 'Universal';
  sni: string;
  payload: string;
  protocol: 'SSH Direct' | 'SSL Tunnel' | 'WebSocket SSL';
}

export interface LogLine {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

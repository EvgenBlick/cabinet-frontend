import apiClient from './client';

export interface BalancerStatusResponse {
  configured: boolean;
  base_url: string | null;
  has_admin_token: boolean;
  request_timeout_sec: number;
}

export interface BalancerRuntimeStatsResponse {
  status: string;
  profile_mode?: string;
  runtime_stats?: Record<string, unknown>;
  circuit_breaker?: Record<string, unknown>;
}

export interface BalancerGroupsResponse {
  status: string;
  groups: Record<string, string[]>;
  strategy?: string;
  fastest_group: boolean;
  fastest_group_name?: string;
  fastest_exclude_groups: string[];
  fastest_fallback?: string[];
  node_stats_exclude?: string[];
  expand_groups_to_nodes?: string[];
  hidden_groups?: string[];
  hidden_nodes?: string[];
  probe_interval?: string;
  probe_sampling?: number;
  probe_timeout?: string;
  probe_connectivity_url?: string;
  probe_http_method?: string;
  fastest_probe_url?: string;
  node_stats_stale_sec?: number;
  sticky_enabled?: boolean;
  sticky_mode?: string;
  sticky_new_connections_only?: boolean;
  sticky_ttl_sec?: number;
  sticky_max_entries?: number;
  quarantine_nodes?: string[];
  auto_quarantine_enabled?: boolean;
  auto_quarantine_failures?: number;
  auto_quarantine_release_successes?: number;
  auto_quarantine_max_nodes?: number;
  auto_drain_enabled?: boolean;
  auto_drain_failures?: number;
  auto_drain_release_successes?: number;
  auto_drain_load_threshold?: number;
  auto_drain_score_penalty?: number;
  protection_enabled?: boolean;
  protection_failures?: number;
  protection_release_successes?: number;
  protection_isolation_ttl_sec?: number;
  protection_latency_threshold_ms?: number;
  protection_min_available_nodes?: number;
  emergency_fallback_enabled?: boolean;
  emergency_fallback_max_nodes?: number;
  balancer_load_weight?: number;
  balancer_latency_weight?: number;
  balancer_max_latency_ms?: number;
  balancer_smoothing_alpha?: number;
  balancer_hysteresis_delta?: number;
}

export interface BalancerHost {
  uuid: string;
  remark: string;
  address: string;
  port: number | null;
  is_disabled: boolean;
}

export interface BalancerHostsResponse {
  status: string;
  hosts: BalancerHost[];
  total: number;
  enabled: number;
}

export interface BalancerQuarantineResponse {
  status: string;
  quarantine_nodes: string[];
  quarantine_count: number;
}

export interface BalancerProtectionNode {
  nodeName: string;
  normalizedNode: string;
  state: 'healthy' | 'suspect' | 'isolated' | 'recovering';
  failureCount: number;
  recoverySuccessCount: number;
  isolation: {
    mode: 'manual' | 'automatic';
    reason: string;
    source: string;
    isolatedAt: number;
    expiresAt: number;
  } | null;
}

export interface BalancerAttackModeResponse {
  status: string;
  protection_enabled?: boolean;
  summary?: Record<string, number>;
  nodes?: BalancerProtectionNode[];
  released?: boolean;
  node?: BalancerProtectionNode;
}

export interface UpdateBalancerGroupsPayload {
  groups: Record<string, string[]>;
  strategy?: string;
  fastest_group: boolean;
  fastest_group_name?: string;
  fastest_exclude_groups: string[];
  fastest_fallback?: string[];
  node_stats_exclude?: string[];
  expand_groups_to_nodes?: string[];
  hidden_groups?: string[];
  hidden_nodes?: string[];
  probe_interval?: string;
  probe_sampling?: number;
  probe_timeout?: string;
  probe_connectivity_url?: string;
  probe_http_method?: string;
  fastest_probe_url?: string;
  node_stats_stale_sec?: number;
  sticky_enabled?: boolean;
  sticky_mode?: string;
  sticky_new_connections_only?: boolean;
  sticky_ttl_sec?: number;
  sticky_max_entries?: number;
  auto_quarantine_enabled?: boolean;
  auto_quarantine_failures?: number;
  auto_quarantine_release_successes?: number;
  auto_quarantine_max_nodes?: number;
  auto_drain_enabled?: boolean;
  auto_drain_failures?: number;
  auto_drain_release_successes?: number;
  auto_drain_load_threshold?: number;
  auto_drain_score_penalty?: number;
  protection_enabled?: boolean;
  protection_failures?: number;
  protection_release_successes?: number;
  protection_isolation_ttl_sec?: number;
  protection_latency_threshold_ms?: number;
  protection_min_available_nodes?: number;
  emergency_fallback_enabled?: boolean;
  emergency_fallback_max_nodes?: number;
  balancer_load_weight?: number;
  balancer_latency_weight?: number;
  balancer_max_latency_ms?: number;
  balancer_smoothing_alpha?: number;
  balancer_hysteresis_delta?: number;
}

export const adminBalancerApi = {
  getStatus: async (): Promise<BalancerStatusResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/status');
    return response.data;
  },

  getHealth: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get('/cabinet/admin/balancer/health');
    return response.data;
  },

  getReady: async (): Promise<Record<string, unknown>> => {
    try {
      const response = await apiClient.get('/cabinet/admin/balancer/ready');
      return response.data;
    } catch (error) {
      const maybeError = error as {
        response?: {
          status?: number;
          data?: {
            detail?: unknown;
          };
        };
      };
      const status = maybeError.response?.status;
      const detail = maybeError.response?.data?.detail;

      if (status === 503 && detail && typeof detail === 'object' && !Array.isArray(detail)) {
        return detail as Record<string, unknown>;
      }
      throw error;
    }
  },

  getDebugStats: async (): Promise<BalancerRuntimeStatsResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/debug/stats');
    return response.data;
  },

  getNodeStats: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get('/cabinet/admin/balancer/node-stats');
    return response.data;
  },

  getTokenDebug: async (token: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get('/cabinet/admin/balancer/debug/token', {
      params: { token },
    });
    return response.data;
  },

  refreshGroups: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.post('/cabinet/admin/balancer/refresh-groups');
    return response.data;
  },

  refreshStats: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.post('/cabinet/admin/balancer/refresh-stats');
    return response.data;
  },

  getGroups: async (): Promise<BalancerGroupsResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/groups');
    return response.data;
  },

  getHosts: async (): Promise<BalancerHostsResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/hosts');
    return response.data;
  },

  updateGroups: async (payload: UpdateBalancerGroupsPayload): Promise<BalancerGroupsResponse> => {
    const response = await apiClient.put('/cabinet/admin/balancer/groups', payload);
    return response.data;
  },

  getQuarantine: async (): Promise<BalancerQuarantineResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/quarantine');
    return response.data;
  },

  addQuarantine: async (node: string): Promise<BalancerQuarantineResponse> => {
    const response = await apiClient.post('/cabinet/admin/balancer/quarantine', { node });
    return response.data;
  },

  removeQuarantine: async (node: string): Promise<BalancerQuarantineResponse> => {
    const response = await apiClient.delete(
      `/cabinet/admin/balancer/quarantine/${encodeURIComponent(node)}`,
    );
    return response.data;
  },

  getAttackMode: async (): Promise<BalancerAttackModeResponse> => {
    const response = await apiClient.get('/cabinet/admin/balancer/attack-mode');
    return response.data;
  },

  enableAttackMode: async (node: string, ttlSec = 300): Promise<BalancerAttackModeResponse> => {
    const response = await apiClient.post('/cabinet/admin/balancer/attack-mode', {
      node,
      reason: 'manual_ddos',
      ttl_sec: ttlSec,
    });
    return response.data;
  },

  disableAttackMode: async (node: string): Promise<BalancerAttackModeResponse> => {
    const response = await apiClient.delete(
      `/cabinet/admin/balancer/attack-mode/${encodeURIComponent(node)}`,
    );
    return response.data;
  },
};

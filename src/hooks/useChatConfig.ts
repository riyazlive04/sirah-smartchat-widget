import { useState, useEffect } from 'react';
import type { ClientConfig, BusinessInfo } from '@/types/chat';

export function useChatConfig() {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const [configResponse, businessResponse] = await Promise.all([
          fetch('/client-config.json'),
          fetch('/business_info.json')
        ]);

        if (!configResponse.ok || !businessResponse.ok) {
          throw new Error('Failed to load configuration files');
        }

        const configData = await configResponse.json();
        const businessData = await businessResponse.json();

        setConfig(configData);
        setBusinessInfo(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return { config, businessInfo, loading, error };
}

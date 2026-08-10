import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const SettingsContext = createContext({ settings: {}, loaded: false, refreshSettings: async () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  const refreshSettings = useCallback(async () => {
    const { data } = await api.get('/settings');
    setSettings(data.settings || {});
    setLoaded(true);
    return data.settings || {};
  }, []);

  useEffect(() => {
    refreshSettings().catch(() => setLoaded(true));
  }, [refreshSettings]);

  const value = useMemo(() => ({ settings, loaded, refreshSettings }), [settings, loaded, refreshSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

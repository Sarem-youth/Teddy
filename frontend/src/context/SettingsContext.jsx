import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const SettingsContext = createContext({ settings: {}, loaded: false });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setSettings(data.settings || {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo(() => ({ settings, loaded }), [settings, loaded]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

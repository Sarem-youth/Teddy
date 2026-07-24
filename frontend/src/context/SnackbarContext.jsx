import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState(null);

  const notify = useCallback((message, severity = 'success') => {
    setSnack({ message, severity, key: Date.now() });
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={snack?.key}
        open={Boolean(snack)}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack ? (
          <Alert
            onClose={() => setSnack(null)}
            severity={snack.severity}
            variant="filled"
            sx={{ borderRadius: 2.5, fontWeight: 600 }}
          >
            {snack.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}

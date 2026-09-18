import { useMemo, useRef, useState } from 'react';
import { Alert, Box, Container, CssBaseline, Snackbar, ThemeProvider, createTheme } from '@mui/material';
import { AppShell } from './components/AppShell';
import { QuerySection } from './components/QuerySection';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { ChartSection } from './components/ChartSection';
import { DataGridSection } from './components/DataGridSection';
import { TelemetryCards } from './components/TelemetryCards';
import { DownloadSection } from './components/DownloadSection';
import { StatusCard } from './components/StatusCard';
import { runAnalyticsQuery } from './api/analyticsApi';
import { getRuntimeApiKey, setRuntimeApiKey } from './api/config';
import type { AnalyticsResponse } from './models/AnalyticsResponse';

export default function App() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(() => createTheme({
    palette: { mode: dark ? 'dark' : 'light', primary: { main: dark ? '#7c9cff' : '#3f51b5' }, background: { default: dark ? '#0b1220' : '#f5f7fb', paper: dark ? '#111a2b' : '#ffffff' } },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    components: { MuiCard: { styleOverrides: { root: { border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 35px rgba(0,0,0,0.08)' } } }, MuiButton: { defaultProps: { disableElevation: true } } }
  }), [dark]);

  const run = async (question: string, key: string) => {
    setError(''); setLoading(true); setLastQuestion(question); setRuntimeApiKey(key);
    try { setResponse(await runAnalyticsQuery({ question: question.trim() })); }
    catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) setError('401 Unauthorized — check the API key.');
      else if (status >= 500) setError('500 Server Error — the KDAS backend returned a server-side failure.');
      else if (err?.request) setError('Network failure — could not reach the KDAS backend. Check VITE_BASE_URL and CORS.');
      else setError(err?.message || 'Unexpected error while running analysis.');
      setResponse(null);
    } finally { setLoading(false); }
  };

  return <ThemeProvider theme={theme}><CssBaseline /><AppShell dark={dark} onToggle={() => setDark((v) => !v)} />
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <QuerySection loading={loading} initialKey={getRuntimeApiKey()} onRun={run} />
      {loading && <Alert severity="info" sx={{ mb: 2.5 }}>KDAS is generating the analysis. This may take a little while.</Alert>}
      {error && <Box sx={{ mb: 2.5 }}><StatusCard message={error} onRetry={() => lastQuestion && run(lastQuestion, getRuntimeApiKey())} /></Box>}
      {response && <Box sx={{ display: 'grid', gap: 2.5, bgcolor: 'background.default' }}>
        <ExecutiveSummary response={response} />
        <ChartSection response={response} chartRef={chartRef} />
        <DataGridSection response={response} />
        <TelemetryCards response={response} />
        <DownloadSection response={response} chartRef={chartRef} />
      </Box>}
      {!response && !loading && !error && <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>Run an analysis to populate the executive dashboard.</Box>}
    </Container>
    <Snackbar open={false} message="" />
  </ThemeProvider>;
}

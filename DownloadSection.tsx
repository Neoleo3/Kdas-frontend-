import { useState } from 'react';
import { Alert, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import type { AnalyticsResponse } from '../models/AnalyticsResponse';
import { downloadChartPng, downloadChartSvg, downloadCsv, downloadExcel, downloadJson } from '../utils/downloads';
import { API_CONFIG } from '../api/config';

interface Props {
  response: AnalyticsResponse;
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export function DownloadSection({ response, chartRef }: Props) {
  const [success, setSuccess] = useState(false);
  const data = response.data || [];
  const pdfReady = response.export?.status === 'ready' && Boolean(response.export.download_url);

  const run = async (fn: () => void | Promise<void>) => {
    try {
      await fn();
    } catch (error) {
      console.error(error);
    }
  };

  const openBackendPdf = () => {
    const downloadUrl = response.export?.download_url;
    if (!downloadUrl) return;

    const url = new URL(downloadUrl, `${API_CONFIG.BASE_URL}/`);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    setSuccess(true);
  };

  return (
    <>
      <Card sx={{ mt: 2.5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>Download</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Export the returned analysis and use the backend-generated PDF report.
          </Typography>

          {!data.length && !response.chart?.plotly?.data?.length ? (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              There is no data or chart available to export.
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<TableViewRoundedIcon />}
              variant="outlined"
              disabled={!data.length}
              onClick={() => run(() => downloadCsv(data))}
            >
              CSV
            </Button>
            <Button
              startIcon={<CodeRoundedIcon />}
              variant="outlined"
              onClick={() => run(() => downloadJson(response))}
            >
              JSON
            </Button>
            <Button
              startIcon={<TableViewRoundedIcon />}
              variant="outlined"
              disabled={!data.length}
              onClick={() => run(() => downloadExcel(data))}
            >
              Excel
            </Button>
            <Button
              startIcon={<ImageRoundedIcon />}
              variant="outlined"
              disabled={!chartRef.current}
              onClick={() => run(() => downloadChartPng(chartRef.current!, 'kdas-chart.png'))}
            >
              Chart PNG
            </Button>
            <Button
              startIcon={<ImageRoundedIcon />}
              variant="outlined"
              disabled={!chartRef.current}
              onClick={() => run(() => downloadChartSvg(chartRef.current!, 'kdas-chart.svg'))}
            >
              Chart SVG
            </Button>
            <Button
              startIcon={<PictureAsPdfRoundedIcon />}
              variant="contained"
              disabled={!pdfReady}
              onClick={openBackendPdf}
            >
              Download PDF
            </Button>
            <Button startIcon={<DownloadRoundedIcon />} variant="text" onClick={() => window.print()}>
              Print
            </Button>
          </Stack>

          {!pdfReady && response.export ? (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25 }}>
              PDF download becomes available when the backend export status is <strong>ready</strong>.
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={3500}
        onClose={() => setSuccess(false)}
        message="PDF report is ready for download."
      />
    </>
  );
}

import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';
import type { AnalyticsResponse } from '../models/AnalyticsResponse';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCsv(data: Array<Record<string, unknown>>, filename = 'kdas-data.csv') {
  if (!data.length) return;
  const keys = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [keys, ...data.map((row) => keys.map((key) => row[key]))]
    .map((row) => row.map(escape).join(','))
    .join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}

export function downloadJson(response: AnalyticsResponse, filename = 'kdas-analysis.json') {
  downloadBlob(
    new Blob([JSON.stringify(response, null, 2)], { type: 'application/json;charset=utf-8' }),
    filename,
  );
}

export function downloadExcel(data: Array<Record<string, unknown>>, filename = 'kdas-data.xlsx') {
  if (!data.length) return;
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Analysis Data');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export the Plotly chart directly. This avoids html2canvas and preserves
 * Plotly's own SVG/PNG rendering.
 */
export async function downloadChartPng(element: HTMLElement, filename = 'kdas-chart.png') {
  const graph = element.querySelector('.js-plotly-plot') as HTMLElement | null;
  if (!graph) throw new Error('No Plotly chart found.');

  const dataUrl = await Plotly.toImage(graph, {
    format: 'png',
    width: Math.max(graph.clientWidth, 900),
    height: 500,
    scale: 2,
  });

  const response = await fetch(dataUrl);
  downloadBlob(await response.blob(), filename);
}

export async function downloadChartSvg(element: HTMLElement, filename = 'kdas-chart.svg') {
  const graph = element.querySelector('.js-plotly-plot') as HTMLElement | null;
  if (!graph) throw new Error('No Plotly chart found.');

  const dataUrl = await Plotly.toImage(graph, {
    format: 'svg',
    width: Math.max(graph.clientWidth, 900),
    height: 500,
    scale: 1,
  });

  const response = await fetch(dataUrl);
  downloadBlob(await response.blob(), filename);
}

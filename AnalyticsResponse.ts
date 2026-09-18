export type PlotlyData = Record<string, unknown>;
export type PlotlyLayout = Record<string, unknown>;

export interface ChartPayload {
  type?: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram' | string;
  title?: string;
  plotly?: {
    data?: PlotlyData[];
    layout?: PlotlyLayout;
  };
}

export interface Telemetry {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  duration_seconds?: number;
  llm_calls?: number;
  [key: string]: unknown;
}

export interface ExportInfo {
  status?: string;
  format?: string;
  export_id?: string;
  file_name?: string;
  download_url?: string;
  [key: string]: unknown;
}

export interface AnalyticsResponse {
  headline?: string;
  answer?: string;
  insights?: string[];
  data?: Array<Record<string, unknown>>;
  columns?: Array<string | Record<string, unknown>>;
  chart?: ChartPayload;
  row_count?: number;
  telemetry?: Telemetry;
  export?: ExportInfo;
  [key: string]: unknown;
}

export interface QueryRequest {
  question: string;
}

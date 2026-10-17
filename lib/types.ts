export type FanStatus = 'Normal' | 'Warning' | 'Critical';
export type FanMode = 'Random' | 'Good' | 'Worst';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Fan {
  id: string;
  fan_id: number;
  name: string;
  location: string;
  status: FanStatus;
  current_rul: number;
  current_fault: string;
  is_anomaly: boolean;
  simulation_mode: FanMode;
  updated_at: string;
  // Optional latest telemetry meters
  latest_speed?: number;
  latest_vibration?: number;
  latest_temperature?: number;
  latest_power?: number;
}

export interface TelemetryReading {
  id: string;
  fan_id: number;
  speed: number;
  vibration: number;
  temperature: number;
  power: number;
  gas: number;
  pressure: number;
  predicted_rul: number;
  predicted_fault: string;
  is_anomaly: boolean;
  created_at: string;
}

export interface FaultAlert {
  id: string;
  fan_id: number;
  alert_type: string;
  severity: AlertSeverity;
  message: string;
  is_acknowledged: boolean;
  created_at: string;
}

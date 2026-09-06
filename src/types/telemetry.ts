export interface SensorReadings {
    id?: number;
    device_id: string;
    timestamp: string;
    ph: number;
    water_temperature: number;
    tds: number;
    ec: number;
    water_level: number;
    air_temperature: number;
    air_humidity: number;
    light_intensity: number;
}

export interface DeviceStatus {
    id: string;
    device_code: string;
    device_name: string;
    location: string;
    firmware_version: string;
    is_online: boolean;
    last_seen_at: string;
}

export type SystemHealthStatus = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'STALE';
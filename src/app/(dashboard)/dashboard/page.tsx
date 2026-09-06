'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SensorReadings, DeviceStatus, SystemHealthStatus } from '@/types/telemetry';
import { Activity, Droplet, Thermometer, Sun, Wind, Gauge, LogOut, CheckCircle2, AlertTriangle, WifiOff } from 'lucide-react';
import { signOutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [device, setDevice] = useState<DeviceStatus | null>(null);
    const [telemetry, setTelemetry] = useState<SensorReadings | null>(null);
    const [loading, setLoading] = useState(true);
    const [freshness, setFreshness] = useState<SystemHealthStatus>('OFFLINE');

    // Fetch data awal perangkat & sensor terbaru
    const fetchLatestData = async () => {
        try {
            // 1. Get Device Metadata
            const { data: deviceData } = await supabase
                .from('devices')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (deviceData) setDevice(deviceData);

            // 2. Get Telemetry Terbaru
            const { data: sensorData } = await supabase
                .from('sensor_readings')
                .select('*')
                .eq('device_id', '00000000-0000-0000-0000-000000000001')
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();

            if (sensorData) {
                setTelemetry(sensorData);
                calculateFreshness(sensorData.timestamp);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Algoritma Penentuan Data Freshness Indicator
    const calculateFreshness = (timestampStr: string) => {
        const lastUpdate = new Date(timestampStr).getTime();
        const now = new Date().getTime();
        const diffSeconds = (now - lastUpdate) / 1000;

        if (diffSeconds <= 30) setFreshness('ONLINE');
        else if (diffSeconds <= 90) setFreshness('STALE');
        else setFreshness('OFFLINE');
    };

    useEffect(() => {
        fetchLatestData();

        // Setup Supabase Realtime Subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
                (payload) => {
                    const newData = payload.new as SensorReadings;
                    setTelemetry(newData);
                    calculateFreshness(newData.timestamp);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleLogout = async () => {
        await signOutUser();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
                Memuat Dashboard Smart Hidroponik...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            {/* HEADER DASHBOARD */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-emerald-400 flex items-center gap-2">
                        <Activity className="w-6 h-6" /> Smart Hidroponik Monitoring
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {device ? `${device.device_name} — ${device.location}` : 'Greenhouse Utama'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Freshness Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
                        {freshness === 'ONLINE' && (
                            <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-400 font-semibold">LIVE</span>
                            </>
                        )}
                        {freshness === 'STALE' && (
                            <>
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span className="text-amber-400 font-semibold">STALE</span>
                            </>
                        )}
                        {freshness === 'OFFLINE' && (
                            <>
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-red-400 font-semibold">OFFLINE</span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Keluar
                    </button>
                </div>
            </div>

            {/* SENSOR CARDS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {/* pH Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>pH Air</span>
                        <Droplet className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-100">
                        {telemetry?.ph?.toFixed(2) ?? '-'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">Target Ideal: 5.5 - 6.5 pH</div>
                </div>

                {/* Suhu Air Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Suhu Air</span>
                        <Thermometer className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-100">
                        {telemetry?.water_temperature?.toFixed(1) ?? '-'} <span className="text-sm font-normal">°C</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">Target Ideal: 20 - 28 °C</div>
                </div>

                {/* TDS Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Nutrisi TDS</span>
                        <Gauge className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-100">
                        {telemetry?.tds ?? '-'} <span className="text-sm font-normal">ppm</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">Target Ideal: 560 - 840 ppm</div>
                </div>

                {/* Intensitas Cahaya Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Cahaya</span>
                        <Sun className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-100">
                        {telemetry?.light_intensity ?? '-'} <span className="text-sm font-normal">lux</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">Pembacaan sensor BH1750</div>
                </div>
            </div>

            {/* FOOTER TIMESTAMP */}
            <div className="mt-8 text-center text-xs text-slate-500">
                Pembacaan Terakhir:{' '}
                <span className="text-slate-300">
                    {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleString('id-ID') : '-'}
                </span>
            </div>
        </div>
    );
}
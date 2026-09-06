import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

// 1. SKEMA VALIDASI ZOD (Sesuai FIRMWARE_SPEC.md & API_CONTRACT.md)
const TelemetrySchema = z.object({
    device_id: z.string().uuid(),
    firmware_version: z.string().default('1.0.0'),
    timestamp: z.string().optional(),
    sensors: z.object({
        ph: z.number().min(0).max(14),
        water_temperature: z.number().min(0).max(50),
        tds: z.number().min(0).max(3000),
        ec: z.number().min(0).max(10),
        water_level: z.number().min(0).max(100),
        air_temperature: z.number().min(0).max(60),
        air_humidity: z.number().min(0).max(100),
        light_intensity: z.number().min(0).max(100000),
    }),
    actuators: z.object({
        pump_main: z.boolean().default(false),
        fan: z.boolean().default(false),
    }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        // 2. KEAMANAN: Cek Device Secret Token dari Header
        const authHeader = req.headers.get('x-device-token');
        const secretToken = process.env.IOT_DEVICE_SECRET_TOKEN;

        if (secretToken && authHeader !== secretToken) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized device token' },
                { status: 401 }
            );
        }

        // 3. PARSE & VALIDASI PAYLOAD JSON
        const body = await req.json();
        const validation = TelemetrySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid telemetry payload format or out-of-range sensor values',
                    details: validation.error.format(),
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        // 4. INSERT KE TABEL sensor_readings
        const { error: insertError } = await supabase
            .from('sensor_readings')
            .insert({
                device_id: data.device_id,
                timestamp: data.timestamp || new Date().toISOString(),
                ph: data.sensors.ph,
                water_temperature: data.sensors.water_temperature,
                tds: data.sensors.tds,
                ec: data.sensors.ec,
                water_level: data.sensors.water_level,
                air_temperature: data.sensors.air_temperature,
                air_humidity: data.sensors.air_humidity,
                light_intensity: data.sensors.light_intensity,
            });

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            return NextResponse.json(
                { success: false, error: 'Failed to record sensor reading' },
                { status: 500 }
            );
        }

        // 5. UPDATE DEVICE STATUS (last_seen_at & is_online)
        await supabase
            .from('devices')
            .update({
                is_online: true,
                last_seen_at: new Date().toISOString(),
                firmware_version: data.firmware_version,
            })
            .eq('id', data.device_id);

        return NextResponse.json({
            success: true,
            message: 'Telemetry data processed and stored successfully',
            received_at: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Telemetry Handler Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
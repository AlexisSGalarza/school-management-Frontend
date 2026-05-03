import { useEffect, useState } from 'react'
import {
    Activity, Cpu, MemoryStick, HardDrive, Server, Zap,
    AlertTriangle, CheckCircle2, RefreshCw, Layers,
} from 'lucide-react'
import AdminShell from '../../Components/Layout/AdminShell'
import { systemService } from '../../Services/systemService'

const REFRESH_MS = 5000

function StatusPill({ ok, label }) {
    const bg = ok ? '#10b981' : '#ef4444'
    const Icon = ok ? CheckCircle2 : AlertTriangle
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999, color: '#fff',
            background: bg, fontSize: 12, fontWeight: 600,
        }}>
            <Icon size={14} /> {label}
        </span>
    )
}

function Card({ title, icon, children }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 12, padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f1f1',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {icon}
                <h3 style={{ margin: 0, fontSize: 14, color: '#444', fontWeight: 600 }}>{title}</h3>
            </div>
            {children}
        </div>
    )
}

function Bar({ value, max = 100, color = 'var(--color-primary)' }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
        <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .3s' }} />
        </div>
    )
}

export default function MonitoreoPage() {
    const [health, setHealth] = useState(null)
    const [metrics, setMetrics] = useState(null)
    const [resources, setResources] = useState(null)
    const [info, setInfo] = useState(null)
    const [error, setError] = useState(null)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(null)

    async function refresh() {
        try {
            const [h, m, r, i] = await Promise.all([
                systemService.health().catch(() => null),
                systemService.metrics().catch(() => null),
                systemService.resources().catch(() => null),
                systemService.info().catch(() => null),
            ])
            setHealth(h); setMetrics(m); setResources(r); setInfo(i)
            setLastUpdate(new Date())
            setError(null)
        } catch (e) {
            setError(e.message || 'Error cargando metricas')
        }
    }

    useEffect(() => {
        refresh()
        if (!autoRefresh) return
        const id = setInterval(refresh, REFRESH_MS)
        return () => clearInterval(id)
    }, [autoRefresh])

    const cpuPct = resources?.cpu?.percent ?? 0
    const memPct = resources?.memory?.percent ?? 0
    const diskPct = resources?.disk?.percent ?? 0

    return (
        <AdminShell>
            <div style={{ padding: 24, background: 'var(--color-background)', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Monitoreo del Sistema</h1>
                        <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
                            PIA: monitoreo de recursos, middleware, tolerancia a fallos y escalabilidad
                            {lastUpdate && ` — actualizado ${lastUpdate.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setAutoRefresh(v => !v)} style={{
                            padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd',
                            background: autoRefresh ? 'var(--color-primary)' : '#fff',
                            color: autoRefresh ? '#fff' : '#333', cursor: 'pointer', fontSize: 13,
                        }}>
                            {autoRefresh ? `Auto-refresh ON (${REFRESH_MS/1000}s)` : 'Auto-refresh OFF'}
                        </button>
                        <button onClick={refresh} style={{
                            padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd',
                            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <RefreshCw size={14} /> Refrescar
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#fee', color: '#b00', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {/* Estado general */}
                <Card title="Estado general" icon={<Activity size={16} color="var(--color-primary)" />}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <StatusPill ok={health?.status === 'ok'} label={health?.status === 'ok' ? 'Sistema saludable' : 'Sistema degradado'} />
                        <StatusPill ok={health?.checks?.database?.ok} label={`Base de datos ${health?.checks?.database?.ok ? 'OK' : 'FAIL'}`} />
                        <StatusPill ok={health?.checks?.cache?.ok} label={`Cache ${health?.checks?.cache?.ok ? 'OK' : 'FAIL'}`} />
                        <span style={{ color: '#666', fontSize: 13 }}>
                            Instancia: <strong>{health?.instance ?? '—'}</strong>
                        </span>
                        <span style={{ color: '#666', fontSize: 13 }}>
                            Uptime: <strong>{Math.round(health?.uptime_seconds ?? 0)}s</strong>
                        </span>
                        <span style={{ color: '#666', fontSize: 13 }}>
                            DB latency: <strong>{health?.checks?.database?.latency_ms ?? '—'} ms</strong>
                        </span>
                    </div>
                </Card>

                {/* Recursos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
                    <Card title="CPU" icon={<Cpu size={16} color="var(--color-secondary)" />}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 28, fontWeight: 700 }}>{cpuPct}%</span>
                            <span style={{ fontSize: 12, color: '#666', alignSelf: 'flex-end' }}>
                                {resources?.cpu?.cores} cores
                            </span>
                        </div>
                        <Bar value={cpuPct} color={cpuPct > 80 ? '#ef4444' : 'var(--color-secondary)'} />
                        <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
                            {(resources?.cpu?.per_core_percent ?? []).map((p, i) => (
                                <div key={i} title={`Core ${i}: ${p}%`} style={{
                                    width: 18, height: 30, background: '#eee', borderRadius: 3, position: 'relative', overflow: 'hidden',
                                }}>
                                    <div style={{
                                        position: 'absolute', bottom: 0, width: '100%',
                                        height: `${p}%`, background: 'var(--color-secondary)',
                                    }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                            Load: {resources?.cpu?.load_avg?.['1m']?.toFixed(2)} / {resources?.cpu?.load_avg?.['5m']?.toFixed(2)} / {resources?.cpu?.load_avg?.['15m']?.toFixed(2)}
                        </div>
                    </Card>

                    <Card title="Memoria RAM" icon={<MemoryStick size={16} color="#EFB11D" />}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 28, fontWeight: 700 }}>{memPct}%</span>
                            <span style={{ fontSize: 12, color: '#666', alignSelf: 'flex-end' }}>
                                {Math.round(resources?.memory?.used_mb ?? 0)} / {Math.round(resources?.memory?.total_mb ?? 0)} MB
                            </span>
                        </div>
                        <Bar value={memPct} color={memPct > 80 ? '#ef4444' : '#EFB11D'} />
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                            Disponible: {Math.round(resources?.memory?.available_mb ?? 0)} MB
                        </div>
                    </Card>

                    <Card title="Disco" icon={<HardDrive size={16} color="#10b981" />}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 28, fontWeight: 700 }}>{diskPct}%</span>
                            <span style={{ fontSize: 12, color: '#666', alignSelf: 'flex-end' }}>
                                {resources?.disk?.used_gb?.toFixed(1)} / {resources?.disk?.total_gb?.toFixed(1)} GB
                            </span>
                        </div>
                        <Bar value={diskPct} color={diskPct > 85 ? '#ef4444' : '#10b981'} />
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                            Libre: {resources?.disk?.free_gb?.toFixed(1)} GB
                        </div>
                    </Card>

                    <Card title="Proceso Django" icon={<Server size={16} color="var(--color-primary)" />}>
                        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                            <div>PID: <strong>{resources?.process?.pid ?? '—'}</strong></div>
                            <div>Threads: <strong>{resources?.process?.threads ?? '—'}</strong></div>
                            <div>Memoria: <strong>{resources?.process?.memory_mb?.toFixed(1) ?? '—'} MB</strong></div>
                            <div>Workers: <strong>{info?.workers_env ?? '—'}</strong></div>
                            <div>Cache: <strong>{info?.cache_backend ?? '—'}</strong></div>
                        </div>
                    </Card>
                </div>

                {/* Latencias */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <Card title="Latencia de peticiones (ventana de muestras)" icon={<Zap size={16} color="var(--color-secondary)" />}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                            {['avg', 'p50', 'p95', 'p99'].map(k => (
                                <div key={k} style={{ textAlign: 'center', padding: 10, background: '#fafafa', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>{k}</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                        {metrics?.latency_ms?.[k] ?? 0}<span style={{ fontSize: 11, color: '#888' }}> ms</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Total: <strong>{metrics?.total_requests ?? 0}</strong> peticiones —
                            Errores: <strong>{metrics?.error_requests ?? 0}</strong> ({((metrics?.error_rate ?? 0) * 100).toFixed(2)}%) —
                            Muestras: <strong>{metrics?.latency_ms?.samples ?? 0}</strong>
                        </div>
                    </Card>

                    <Card title="Respuestas por status HTTP" icon={<Layers size={16} color="#EFB11D" />}>
                        {Object.entries(metrics?.by_status ?? {}).length === 0 ? (
                            <div style={{ color: '#888', fontSize: 13 }}>Aun no hay peticiones registradas.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                                {Object.entries(metrics?.by_status ?? {})
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([status, count]) => {
                                        const code = Number(status)
                                        const color = code >= 500 ? '#ef4444' : code >= 400 ? '#EFB11D' : '#10b981'
                                        return (
                                            <div key={status} style={{ textAlign: 'center', padding: 8, background: '#fafafa', borderRadius: 6 }}>
                                                <div style={{ fontSize: 18, fontWeight: 700, color }}>{count}</div>
                                                <div style={{ fontSize: 11, color: '#666' }}>HTTP {status}</div>
                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Top routes */}
                <div style={{ marginTop: 16 }}>
                    <Card title="Rutas mas activas" icon={<Activity size={16} color="var(--color-primary)" />}>
                        {(metrics?.top_routes ?? []).length === 0 ? (
                            <div style={{ color: '#888', fontSize: 13 }}>Sin datos aun.</div>
                        ) : (
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        <th style={{ textAlign: 'left', padding: 8 }}>Ruta</th>
                                        <th style={{ textAlign: 'right', padding: 8 }}>Peticiones</th>
                                        <th style={{ textAlign: 'right', padding: 8 }}>Errores</th>
                                        <th style={{ textAlign: 'right', padding: 8 }}>Latencia avg</th>
                                        <th style={{ textAlign: 'right', padding: 8 }}>Latencia max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.top_routes.map(r => (
                                        <tr key={r.route} style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{r.route}</td>
                                            <td style={{ padding: 8, textAlign: 'right' }}>{r.count}</td>
                                            <td style={{ padding: 8, textAlign: 'right', color: r.errors > 0 ? '#ef4444' : '#666' }}>{r.errors}</td>
                                            <td style={{ padding: 8, textAlign: 'right' }}>{r.avg_ms} ms</td>
                                            <td style={{ padding: 8, textAlign: 'right' }}>{r.max_ms} ms</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>

                {/* Tolerancia a fallos: circuit breakers */}
                <div style={{ marginTop: 16 }}>
                    <Card title="Tolerancia a fallos (circuit breakers)" icon={<AlertTriangle size={16} color="#EFB11D" />}>
                        {Object.entries(metrics?.circuits ?? {}).length === 0 ? (
                            <div style={{ color: '#888', fontSize: 13 }}>Sin breakers registrados todavia. Se inicializan tras la primera llamada al servicio externo (R2).</div>
                        ) : (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {Object.entries(metrics.circuits).map(([name, st]) => (
                                    <div key={name} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, minWidth: 200 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
                                        <StatusPill ok={st.state === 'closed'} label={`Estado: ${st.state}`} />
                                        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                                            Fallos consecutivos: {st.failures}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminShell>
    )
}

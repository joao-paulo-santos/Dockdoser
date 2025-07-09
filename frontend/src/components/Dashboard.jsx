import React, { useEffect, useState } from 'react';
import ToggleBar from './ToggleBar';
import ChartCard from './ChartCard';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [toggles, setToggles] = useState({ cpu: true, mem: false, rx: false, tx: false });

    useEffect(() => {
        let timer;
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE}/stats`);
                if (res.ok) setStats(await res.json());
            } catch {
                // Optionally handle error
            }
            timer = setTimeout(fetchStats, 30000);
        };
        fetchStats();
        return () => clearTimeout(timer);
    }, []);

    // Calculate maxes for scaling
    let maxCPU = 0, maxMem = 0, maxRx = 0, maxTx = 0;
    for (const { data } of Object.values(stats)) {
        for (const d of data) {
            if (d.cpu > maxCPU) maxCPU = d.cpu;
            if (d.mem > maxMem) maxMem = d.mem;
            if (d.netRx > maxRx) maxRx = d.netRx;
            if (d.netTx > maxTx) maxTx = d.netTx;
        }
    }
    const maxes = {
        maxCPU,
        maxMem: maxMem / 1024 / 1024,
        maxRx: maxRx / 1024 / 1024,
        maxTx: maxTx / 1024 / 1024,
    };

    // Group by project and running state
    const grouped = {};
    for (const [name, { project, data, state }] of Object.entries(stats)) {
        if (!grouped[project]) grouped[project] = { running: [], nonRunning: [] };
        if (state === 'running') {
            grouped[project].running.push({ name, data, state });
        } else {
            grouped[project].nonRunning.push({ name, data, state });
        }
    }

    return (
        <div>
            <ToggleBar toggles={toggles} setToggles={setToggles} />
            <div className="project-grid">
                {Object.entries(grouped).filter((_, _, state) => x.containers.running.length > 0).map(([project, containers]) => (
                    <div className="project-card" key={project}>
                        <div className="project-title">🧱 {project}</div>
                        <div className="project-group">
                            {/* Running containers first */}
                            {containers.running.map(({ name, data, state }) => (
                                <ChartCard key={name} container={name} data={data} state={state} maxes={maxes} toggles={toggles} />
                            ))}
                            {containers.nonRunning.map(({ name, data, state }) => (
                                <ChartCard key={name} container={name} data={data} state={state} maxes={maxes} toggles={toggles} />
                            ))}
                        </div>
                    </div>
                ))}
                {Object.entries(grouped).filter(x => x.containers.running.length == 0).map(([project, containers]) => (
                    <div className="project-card" key={project}>
                        <div className="project-title">🧱 {project}</div>
                        <div className="project-group">
                            {containers.nonRunning.map(({ name, data, state }) => (
                                <ChartCard key={name} container={name} data={data} state={state} maxes={maxes} toggles={toggles} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import React from 'react';
import { Line } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Title
);

const metricColors = {
    cpu: 'red',
    mem: 'blue',
    rx: 'green',
    tx: 'orange',
};

// Utility: map status to color
const statusColors = {
    running: 'green',
    exited: 'gray',
    paused: 'orange',
    restarting: 'yellow',
    dead: 'red',
    created: 'blue',
    unknown: 'red',
};

export default function ChartCard({ container, data, state, maxes, toggles }) {
    console.log(state);
    const labels = data.map(d => new Date(d.time).toLocaleTimeString());
    const datasets = [
        {
            label: 'CPU (%)',
            data: data.map(d => d.cpu.toFixed(2)),
            borderColor: metricColors.cpu,
            yAxisID: 'y',
            tension: 0.3,
            hidden: !toggles.cpu,
        },
        {
            label: 'Memory (MB)',
            data: data.map(d => (d.mem / 1024 / 1024).toFixed(2)),
            borderColor: metricColors.mem,
            yAxisID: 'y1',
            tension: 0.3,
            hidden: !toggles.mem,
        },
        {
            label: 'Net RX (MB)',
            data: data.map(d => (d.netRx / 1024 / 1024).toFixed(2)),
            borderColor: metricColors.rx,
            yAxisID: 'y2',
            tension: 0.3,
            hidden: !toggles.rx,
        },
        {
            label: 'Net TX (MB)',
            data: data.map(d => (d.netTx / 1024 / 1024).toFixed(2)),
            borderColor: metricColors.tx,
            yAxisID: 'y2',
            tension: 0.3,
            hidden: !toggles.tx,
        },
    ];

    // Dynamically show/hide axes based on toggles
    const scales = {
        y: {
            display: toggles.cpu,
            type: 'linear',
            position: 'left',
            title: { display: toggles.cpu, text: 'CPU (%)' },
            min: 0,
            max: Math.ceil(maxes.maxCPU * 1.1),
        },
        y1: {
            display: toggles.mem,
            type: 'linear',
            position: 'right',
            title: { display: toggles.mem, text: 'Memory (MB)' },
            grid: { drawOnChartArea: false },
            min: 0,
            max: Math.ceil(maxes.maxMem * 1.1),
        },
        y2: {
            display: toggles.rx || toggles.tx,
            type: 'linear',
            position: 'right',
            title: { display: toggles.rx || toggles.tx, text: 'Network (MB)' },
            grid: { drawOnChartArea: false },
            offset: true,
            min: 0,
            max: Math.ceil(Math.max(maxes.maxRx, maxes.maxTx) * 1.1),
        },
    };

    return (
        <div className="chart-card">
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <span>{container}</span>
                <span
                    className="status-dot"
                    title={state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Unknown'}
                    style={{
                        backgroundColor: statusColors[state] || statusColors.unknown,
                    }}
                ></span>
                {state !== 'running' && (
                    <span className="no-chart-message">
                        {state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Unknown'}
                    </span>
                )}
            </h3>
            {state === 'running' && (
                <Line
                    data={{ labels, datasets }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { display: false }, title: { display: false } },
                        scales,
                    }}
                    height={200}
                />
            )}
        </div>
    );
}

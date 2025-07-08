import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import './App.css';
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

const metricLabels = {
  cpu: 'CPU (%)',
  mem: 'Memory (MB)',
  rx: 'Net RX (MB)',
  tx: 'Net TX (MB)',
};

function ToggleBar({ toggles, setToggles }) {
  return (
    <div id="toggles" style={{ textAlign: 'center', marginBottom: '1.5em' }}>
      {Object.keys(toggles).map(metric => (
        <label
          key={metric}
          className="toggle-label"
          style={{ '--color': metricColors[metric] }}
        >
          <input
            type="checkbox"
            checked={toggles[metric]}
            onChange={e => setToggles(t => ({ ...t, [metric]: e.target.checked }))}
          />
          {metricLabels[metric].split(' ')[0]}
        </label>
      ))}
    </div>
  );
}

function ChartCard({ container, data, maxes, toggles }) {
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

  return (
    <div className="chart-card">
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <span>{container}</span>
        <span className="status-dot" title="Running"></span>
      </h3>
      <Line
        data={{ labels, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false }, title: { display: false } },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'CPU (%)' },
              min: 0,
              max: Math.ceil(maxes.maxCPU * 1.1),
            },
            y1: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Memory (MB)' },
              grid: { drawOnChartArea: false },
              min: 0,
              max: Math.ceil(maxes.maxMem * 1.1),
            },
            y2: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Network (MB)' },
              grid: { drawOnChartArea: false },
              offset: true,
              min: 0,
              max: Math.ceil(Math.max(maxes.maxRx, maxes.maxTx) * 1.1),
            },
          },
        }}
        height={200}
      />
    </div>
  );
}

function ProjectCard({ project, containers, maxes, toggles }) {
  return (
    <div className="project-card">
      <div className="project-title">🧱 {project}</div>
      <div className="project-group">
        {containers.map(({ name, data }) => (
          <ChartCard key={name} container={name} data={data} maxes={maxes} toggles={toggles} />
        ))}
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [toggles, setToggles] = useState({ cpu: true, mem: false, rx: false, tx: false });
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        setStats(await res.json());
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({});
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Find global max values
  let maxCPU = 0, maxMem = 0, maxRx = 0, maxTx = 0;
  for (const { data } of Object.values(stats)) {
    for (const point of data) {
      if (point.cpu > maxCPU) maxCPU = point.cpu;
      if (point.mem > maxMem) maxMem = point.mem;
      if (point.netRx > maxRx) maxRx = point.netRx;
      if (point.netTx > maxTx) maxTx = point.netTx;
    }
  }
  const maxes = {
    maxCPU,
    maxMem: maxMem / 1024 / 1024,
    maxRx: maxRx / 1024 / 1024,
    maxTx: maxTx / 1024 / 1024,
  };

  // Group by project
  const grouped = {};
  for (const [name, { project, data }] of Object.entries(stats)) {
    if (!grouped[project]) grouped[project] = [];
    grouped[project].push({ name, data });
  }

  return (
    <div className="App">
      <h1>📦 Docker Activity Dashboard</h1>
      <ToggleBar toggles={toggles} setToggles={setToggles} />
      <div id="charts" className="project-grid">
        {Object.entries(grouped).map(([project, containers]) => (
          <ProjectCard
            key={project}
            project={project}
            containers={containers}
            maxes={maxes}
            toggles={toggles}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

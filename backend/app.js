import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;
const DOCKER_API = 'http://docker-api:2375';
const POLL_INTERVAL = 10 * 1000; // 10 seconds
const HISTORY_LIMIT = 180; // 30 minutes at 10s intervals

// Structure: { containerName: { project, data: [ { time, cpu, mem, netRx, netTx } ] } }
const statsHistory = {};

async function getStats(containerId) {
  const res = await fetch(`${DOCKER_API}/containers/${containerId}/stats?stream=false`);
  return res.ok ? res.json() : null;
}

async function pollContainers() {
  const res = await fetch(`${DOCKER_API}/containers/json?all=true`);
  if (!res.ok) return;

  const containers = await res.json();

  for (const c of containers) {
    if (c.State !== 'running') continue; // Only track running containers

    const name = c.Names[0].replace(/^\//, '');
    const project = c.Labels["com.docker.compose.project"] || "unlabeled";

    let stats;
    try {
      stats = await getStats(c.Id);
    } catch (err) {
      console.error(`Failed to fetch stats for container ${name}:`, err);
      continue;
    }
    stats = await getStats(c.Id);
    if (!stats) continue;

    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100 : 0;

    const memUsage = stats.memory_stats.usage || 0;
    const netRx = Object.values(stats.networks || {}).reduce((sum, n) => sum + n.rx_bytes, 0);
    const netTx = Object.values(stats.networks || {}).reduce((sum, n) => sum + n.tx_bytes, 0);

    const point = {
      time: new Date().toISOString(),
      cpu: cpuPercent,
      mem: memUsage,
      netRx,
      netTx
    };

    if (!statsHistory[name]) {
      statsHistory[name] = {
        project,
        data: []
      };
    }

    statsHistory[name].data.push(point);
    if (statsHistory[name].data.length > HISTORY_LIMIT) {
      statsHistory[name].data.shift();
    }
  }
}

setInterval(pollContainers, POLL_INTERVAL);
pollContainers();

app.use(express.static('public'));

app.get('/api/stats', (req, res) => {
  res.json(statsHistory);
});

app.listen(PORT, () => {
  console.log(`🚀 Watchdog dashboard running at http://localhost:${PORT}`);
});

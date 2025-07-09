/**
 * Container domain entity
 * Represents a Docker container with monitoring data and metrics
 */
export class Container {
  constructor({ name, project = 'unlabeled', state = 'running', data = [] }) {
    this.name = name;
    this.project = project;
    this.state = state;
    this.data = data; // Array of metric data points: [{ time, cpu, mem, netRx, netTx }]
  }

  /**
   * Check if container is currently running
   * @returns {boolean}
   */
  get isRunning() {
    return this.state === 'running';
  }

  /**
   * Add a new data point to the container metrics
   * @param {Object} dataPoint - { time, cpu, mem, netRx, netTx }
   */
  addDataPoint(dataPoint) {
    this.data.push(dataPoint);
  }

  /**
   * Get the latest data point
   * @returns {Object|null}
   */
  getLatestData() {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null;
  }

  /**
   * Get current CPU usage percentage
   * @returns {number}
   */
  getCurrentCpuUsage() {
    const latest = this.getLatestData();
    return latest ? latest.cpu : 0;
  }

  /**
   * Get current memory usage in bytes
   * @returns {number}
   */
  getCurrentMemoryUsage() {
    const latest = this.getLatestData();
    return latest ? latest.mem : 0;
  }

  /**
   * Get current memory usage in MB
   * @returns {number}
   */
  getCurrentMemoryUsageMB() {
    return this.getCurrentMemoryUsage() / (1024 * 1024);
  }

  /**
   * Get current network RX in bytes
   * @returns {number}
   */
  getCurrentNetRx() {
    const latest = this.getLatestData();
    return latest ? latest.netRx : 0;
  }

  /**
   * Get current network TX in bytes
   * @returns {number}
   */
  getCurrentNetTx() {
    const latest = this.getLatestData();
    return latest ? latest.netTx : 0;
  }

  /**
   * Get current network RX in MB
   * @returns {number}
   */
  getCurrentNetRxMB() {
    return this.getCurrentNetRx() / (1024 * 1024);
  }

  /**
   * Get current network TX in MB
   * @returns {number}
   */
  getCurrentNetTxMB() {
    return this.getCurrentNetTx() / (1024 * 1024);
  }

  /**
   * Get maximum CPU usage from all data points
   * @returns {number}
   */
  getMaxCpuUsage() {
    return Math.max(...this.data.map(point => point.cpu), 0);
  }

  /**
   * Get maximum memory usage from all data points
   * @returns {number}
   */
  getMaxMemoryUsage() {
    return Math.max(...this.data.map(point => point.mem), 0);
  }

  /**
   * Get maximum network RX from all data points
   * @returns {number}
   */
  getMaxNetRx() {
    return Math.max(...this.data.map(point => point.netRx), 0);
  }

  /**
   * Get maximum network TX from all data points
   * @returns {number}
   */
  getMaxNetTx() {
    return Math.max(...this.data.map(point => point.netTx), 0);
  }

  /**
   * Clear all metric data
   */
  clearData() {
    this.data = [];
  }

  /**
   * Get data point count
   * @returns {number}
   */
  getDataPointCount() {
    return this.data.length;
  }

  /**
   * Convert container to plain object (compatible with existing API format)
   * @returns {Object}
   */
  toApiFormat() {
    return {
      project: this.project,
      data: this.data
    };
  }

  /**
   * Create Container instance from API data format
   * @param {string} name - Container name
   * @param {Object} apiData - { project, data }
   * @returns {Container}
   */
  static fromApiFormat(name, apiData) {
    return new Container({
      name,
      project: apiData.project,
      data: apiData.data || []
    });
  }

  /**
   * Convert to format expected by frontend components
   * @returns {Object}
   */
  toComponentFormat() {
    return {
      name: this.name,
      data: this.data
    };
  }
}

export default Container;
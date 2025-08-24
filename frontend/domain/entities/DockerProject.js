import { Container } from './Container.js';

/**
 * DockerProject domain entity
 * Represents a Docker project (compose project) containing multiple containers
 */
export class DockerProject {
  constructor({ name, containers = [] }) {
    this.name = name;
    this.containers = new Map(); // Map<string, Container> for fast lookups
    
    // Initialize with provided containers
    containers.forEach(container => {
      if (container instanceof Container) {
        this.containers.set(container.name, container);
      } else {
        // Convert plain object to Container instance
        const containerInstance = new Container(container);
        this.containers.set(containerInstance.name, containerInstance);
      }
    });
  }

  /**
   * Add a container to the project
   * @param {Container} container
   */
  addContainer(container) {
    if (!(container instanceof Container)) {
      throw new Error('Container must be an instance of Container class');
    }
    
    // Update container's project reference
    container.project = this.name;
    this.containers.set(container.name, container);
  }

  /**
   * Remove a container from the project
   * @param {string} containerName
   * @returns {boolean} True if container was removed
   */
  removeContainer(containerName) {
    return this.containers.delete(containerName);
  }

  /**
   * Get a container by name
   * @param {string} containerName
   * @returns {Container|undefined}
   */
  getContainer(containerName) {
    return this.containers.get(containerName);
  }

  /**
   * Check if project has a specific container
   * @param {string} containerName
   * @returns {boolean}
   */
  hasContainer(containerName) {
    return this.containers.has(containerName);
  }

  /**
   * Get all containers as an array
   * @returns {Container[]}
   */
  getAllContainers() {
    return Array.from(this.containers.values());
  }

  /**
   * Get all container names
   * @returns {string[]}
   */
  getContainerNames() {
    return Array.from(this.containers.keys());
  }

  /**
   * Get the number of containers in the project
   * @returns {number}
   */
  getContainerCount() {
    return this.containers.size;
  }

  /**
   * Get only running containers
   * @returns {Container[]}
   */
  getRunningContainers() {
    return this.getAllContainers().filter(container => container.isRunning);
  }

  /**
   * Get the number of running containers
   * @returns {number}
   */
  getRunningContainerCount() {
    return this.getRunningContainers().length;
  }

  /**
   * Check if project has any running containers
   * @returns {boolean}
   */
  hasRunningContainers() {
    return this.getRunningContainerCount() > 0;
  }

  /**
   * Get maximum CPU usage across all containers
   * @returns {number}
   */
  getMaxCpuUsage() {
    const maxValues = this.getAllContainers().map(container => container.getMaxCpuUsage());
    return Math.max(...maxValues, 0);
  }

  /**
   * Get maximum memory usage across all containers
   * @returns {number}
   */
  getMaxMemoryUsage() {
    const maxValues = this.getAllContainers().map(container => container.getMaxMemoryUsage());
    return Math.max(...maxValues, 0);
  }

  /**
   * Get maximum network RX across all containers
   * @returns {number}
   */
  getMaxNetRx() {
    const maxValues = this.getAllContainers().map(container => container.getMaxNetRx());
    return Math.max(...maxValues, 0);
  }

  /**
   * Get maximum network TX across all containers
   * @returns {number}
   */
  getMaxNetTx() {
    const maxValues = this.getAllContainers().map(container => container.getMaxNetTx());
    return Math.max(...maxValues, 0);
  }

  /**
   * Clear all metric data from all containers
   */
  clearAllData() {
    this.getAllContainers().forEach(container => container.clearData());
  }

  /**
   * Check if project is empty (no containers)
   * @returns {boolean}
   */
  isEmpty() {
    return this.containers.size === 0;
  }

  /**
   * Convert project to format expected by frontend components
   * @returns {Object}
   */
  toComponentFormat() {
    return {
      project: this.name,
      containers: this.getAllContainers().map(container => container.toComponentFormat())
    };
  }

  /**
   * Convert project to API format (compatible with existing backend format)
   * @returns {Object}
   */
  toApiFormat() {
    const result = {};
    this.getAllContainers().forEach(container => {
      result[container.name] = container.toApiFormat();
    });
    return result;
  }

  /**
   * Create DockerProject instance from API data format
   * @param {string} projectName
   * @param {Object} apiData - Object with container names as keys and { project, data } as values
   * @returns {DockerProject}
   */
  static fromApiFormat(projectName, apiData) {
    const containers = Object.entries(apiData).map(([containerName, containerData]) =>
      Container.fromApiFormat(containerName, containerData)
    );
    
    return new DockerProject({
      name: projectName,
      containers
    });
  }

  /**
   * Create multiple DockerProject instances from the grouped API format
   * @param {Object} groupedData - { projectName: [{ name, data }] }
   * @returns {DockerProject[]}
   */
  static fromGroupedApiFormat(groupedData) {
    return Object.entries(groupedData).map(([projectName, containerArray]) => {
      const containers = containerArray.map(({ name, data }) =>
        new Container({ name, project: projectName, data })
      );
      
      return new DockerProject({
        name: projectName,
        containers
      });
    });
  }

  /**
   * Create DockerProject instances from the full stats API response
   * @param {Object} statsData - { containerName: { project, data } }
   * @returns {DockerProject[]}
   */
  static fromStatsApiFormat(statsData) {
    // Group by project first
    const grouped = {};
    Object.entries(statsData).forEach(([containerName, containerData]) => {
      const projectName = containerData.project;
      if (!grouped[projectName]) {
        grouped[projectName] = [];
      }
      grouped[projectName].push({ name: containerName, data: containerData.data });
    });

    return DockerProject.fromGroupedApiFormat(grouped);
  }
}

export default DockerProject;
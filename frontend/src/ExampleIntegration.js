/**
 * Example integration of domain entities with the existing React application
 * This file demonstrates how to use Container and DockerProject classes
 * with the existing App.jsx component structure
 */

import { Container, DockerProject } from '../domain/entities/index.js';

/**
 * Example: How to integrate domain entities in the App component
 * This shows how the existing App.jsx could potentially use the domain entities
 */
export class AppDataService {
  constructor() {
    this.projects = new Map(); // Map<string, DockerProject>
  }

  /**
   * Process stats data from API and convert to domain entities
   * @param {Object} statsData - Raw stats from API
   * @returns {DockerProject[]}
   */
  processStatsData(statsData) {
    // Convert API data to domain entities
    const projects = DockerProject.fromStatsApiFormat(statsData);
    
    // Update internal state
    this.projects.clear();
    projects.forEach(project => {
      this.projects.set(project.name, project);
    });

    return projects;
  }

  /**
   * Get all projects for rendering
   * @returns {DockerProject[]}
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by name
   * @param {string} name
   * @returns {DockerProject|undefined}
   */
  getProject(name) {
    return this.projects.get(name);
  }

  /**
   * Calculate global maxes across all projects (replacing the existing logic in App.jsx)
   * @returns {Object}
   */
  calculateGlobalMaxes() {
    const allProjects = this.getAllProjects();
    
    let maxCPU = 0, maxMem = 0, maxRx = 0, maxTx = 0;
    
    allProjects.forEach(project => {
      const projectMaxCPU = project.getMaxCpuUsage();
      const projectMaxMem = project.getMaxMemoryUsage();
      const projectMaxRx = project.getMaxNetRx();
      const projectMaxTx = project.getMaxNetTx();
      
      if (projectMaxCPU > maxCPU) maxCPU = projectMaxCPU;
      if (projectMaxMem > maxMem) maxMem = projectMaxMem;
      if (projectMaxRx > maxRx) maxRx = projectMaxRx;
      if (projectMaxTx > maxTx) maxTx = projectMaxTx;
    });

    return {
      maxCPU,
      maxMem: maxMem / 1024 / 1024, // Convert to MB
      maxRx: maxRx / 1024 / 1024,   // Convert to MB
      maxTx: maxTx / 1024 / 1024,   // Convert to MB
    };
  }

  /**
   * Convert projects to the grouped format expected by the current React components
   * @returns {Object} - Format: { projectName: [{ name, data }] }
   */
  toComponentGroupedFormat() {
    const grouped = {};
    this.getAllProjects().forEach(project => {
      grouped[project.name] = project.getAllContainers().map(container => ({
        name: container.name,
        data: container.data
      }));
    });
    return grouped;
  }

  /**
   * Example: Get summary statistics
   * @returns {Object}
   */
  getSummaryStats() {
    const projects = this.getAllProjects();
    const totalContainers = projects.reduce((sum, project) => sum + project.getContainerCount(), 0);
    const runningContainers = projects.reduce((sum, project) => sum + project.getRunningContainerCount(), 0);
    
    return {
      totalProjects: projects.length,
      totalContainers,
      runningContainers,
      idleContainers: totalContainers - runningContainers
    };
  }
}

/**
 * Example usage in a React component (this would replace parts of App.jsx)
 */
export const ExampleUsage = {
  // In the useEffect where stats are fetched:
  async fetchAndProcessStats(dataService, apiBase = '/api') {
    try {
      const res = await fetch(`${apiBase}/stats`);
      const rawStats = await res.json();
      
      // Use domain entities instead of raw data
      const projects = dataService.processStatsData(rawStats);
      
      // Calculate maxes using domain logic
      const maxes = dataService.calculateGlobalMaxes();
      
      // Convert to format expected by existing components
      const grouped = dataService.toComponentGroupedFormat();
      
      return { projects, maxes, grouped };
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      return { projects: [], maxes: {}, grouped: {} };
    }
  },

  // Example component render logic using domain entities:
  renderProjectsWithDomainEntities(projects) {
    return projects.map(project => ({
      key: project.name,
      projectName: project.name,
      containers: project.getAllContainers().map(container => ({
        name: container.name,
        data: container.data,
        isRunning: container.isRunning,
        currentCpu: container.getCurrentCpuUsage(),
        currentMemMB: container.getCurrentMemoryUsageMB()
      })),
      containerCount: project.getContainerCount(),
      runningCount: project.getRunningContainerCount()
    }));
  }
};
# Domain Entities

This directory contains the domain entity classes for the Docker monitoring application.

## Classes

### Container

Represents a Docker container with monitoring data and metrics.

#### Properties
- `name`: Container name
- `project`: Project name (from Docker Compose label)
- `state`: Container state ('running', 'stopped', etc.)
- `data`: Array of metric data points with `{ time, cpu, mem, netRx, netTx }`

#### Key Methods
- `isRunning`: Check if container is running
- `getCurrentCpuUsage()`: Get current CPU usage percentage
- `getCurrentMemoryUsageMB()`: Get current memory usage in MB
- `getMaxCpuUsage()`: Get maximum CPU usage from all data points
- `addDataPoint(dataPoint)`: Add new metric data point
- `toApiFormat()`: Convert to API format
- `toComponentFormat()`: Convert to React component format

#### Usage
```javascript
import { Container } from './domain/entities';

// Create from API data
const container = Container.fromApiFormat('web-app', {
  project: 'myproject',
  data: [{ time: '2023-01-01T10:00:00Z', cpu: 15.5, mem: 512000000, netRx: 1024, netTx: 2048 }]
});

console.log(`CPU: ${container.getCurrentCpuUsage()}%`);
console.log(`Memory: ${container.getCurrentMemoryUsageMB().toFixed(2)} MB`);
```

### DockerProject

Represents a Docker project (compose project) containing multiple containers.

#### Properties
- `name`: Project name
- `containers`: Map of Container instances

#### Key Methods
- `addContainer(container)`: Add a container to the project
- `getContainer(name)`: Get container by name
- `getAllContainers()`: Get all containers as array
- `getContainerCount()`: Get number of containers
- `getRunningContainers()`: Get only running containers
- `getMaxCpuUsage()`: Get maximum CPU usage across all containers
- `toComponentFormat()`: Convert to React component format

#### Usage
```javascript
import { DockerProject } from './domain/entities';

// Create from stats API data
const projects = DockerProject.fromStatsApiFormat(statsData);

projects.forEach(project => {
  console.log(`${project.name}: ${project.getContainerCount()} containers`);
  console.log(`Running: ${project.getRunningContainerCount()}`);
  console.log(`Max CPU: ${project.getMaxCpuUsage().toFixed(2)}%`);
});
```

## React Integration

The classes are designed to work seamlessly with the existing React application. See `ExampleIntegration.js` for detailed examples of how to integrate these entities with the current App.jsx component.

### Key Benefits
- **Type Safety**: Structured data with clear interfaces
- **Business Logic**: Encapsulated calculations and operations
- **Compatibility**: Maintains compatibility with existing API and component structure
- **Extensibility**: Easy to add new features and metrics
- **Testing**: Easier to unit test business logic

### Naming Conventions
- Classes use PascalCase (Container, DockerProject)
- Properties and methods use camelCase (getCurrentCpuUsage, isRunning)
- File names use PascalCase for classes (Container.js, DockerProject.js)
- Follows React/JavaScript best practices
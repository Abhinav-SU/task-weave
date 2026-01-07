import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mcpService } from '../services/MCPService';

// Schema for MCP server connection
const connectServerSchema = z.object({
  command: z.string().min(1, 'Server command is required'),
  args: z.array(z.string()).default([]),
});

// Schema for tool execution
const executeToolSchema = z.object({
  toolName: z.string().min(1, 'Tool name is required'),
  args: z.record(z.any()).default({}),
});

// Pre-defined MCP servers that can be connected
const AVAILABLE_SERVERS = [
  {
    id: 'filesystem',
    name: 'File System',
    description: 'Read and write files in a sandboxed directory',
    icon: '📁',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', './workspace'],
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory'],
    status: 'available',
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search using Brave Search API',
    icon: '🔍',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    tools: ['brave_web_search', 'brave_local_search'],
    status: 'requires_api_key',
    envKey: 'BRAVE_API_KEY',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Interact with GitHub repositories',
    icon: '🐙',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    tools: ['search_repositories', 'get_file_contents', 'create_issue', 'list_commits'],
    status: 'requires_api_key',
    envKey: 'GITHUB_PERSONAL_ACCESS_TOKEN',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query PostgreSQL databases',
    icon: '🐘',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    tools: ['query', 'list_tables', 'describe_table'],
    status: 'requires_connection',
    envKey: 'POSTGRES_CONNECTION_STRING',
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    icon: '🎭',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    tools: ['navigate', 'screenshot', 'click', 'type', 'evaluate'],
    status: 'available',
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Knowledge graph for persistent memory',
    icon: '🧠',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    tools: ['create_entity', 'create_relation', 'search_nodes', 'read_graph'],
    status: 'available',
  },
];

// Track connected servers
const connectedServers: Map<string, {
  serverId: string;
  connectedAt: Date;
  tools: string[];
}> = new Map();

export async function mcpRoutes(fastify: FastifyInstance) {
  // List available MCP servers
  fastify.get('/servers', async (request, reply) => {
    const servers = AVAILABLE_SERVERS.map(server => ({
      ...server,
      connected: connectedServers.has(server.id),
      connectedAt: connectedServers.get(server.id)?.connectedAt,
    }));

    return { servers };
  });

  // Connect to an MCP server
  fastify.post('/connect', async (request, reply) => {
    try {
      const { serverId } = request.body as { serverId: string };

      const serverConfig = AVAILABLE_SERVERS.find(s => s.id === serverId);
      if (!serverConfig) {
        return reply.status(404).send({
          error: `Server "${serverId}" not found`,
        });
      }

      // Check if server requires API key
      if (serverConfig.status === 'requires_api_key' && serverConfig.envKey) {
        if (!process.env[serverConfig.envKey]) {
          return reply.status(400).send({
            error: `Server requires ${serverConfig.envKey} environment variable`,
          });
        }
      }

      // Connect to the server
      const success = await mcpService.connect(serverConfig.command, serverConfig.args);

      if (success) {
        // Get available tools
        let tools: string[] = [];
        try {
          const toolList = await mcpService.listTools();
          tools = toolList.map((t: any) => t.name);
        } catch (e) {
          tools = serverConfig.tools; // Use predefined list as fallback
        }

        connectedServers.set(serverId, {
          serverId,
          connectedAt: new Date(),
          tools,
        });

        return {
          success: true,
          message: `Connected to ${serverConfig.name}`,
          tools,
        };
      } else {
        return reply.status(500).send({
          error: `Failed to connect to ${serverConfig.name}`,
        });
      }
    } catch (error: any) {
      return reply.status(500).send({
        error: error.message || 'Connection failed',
      });
    }
  });

  // Disconnect from current MCP server
  fastify.post('/disconnect', async (request, reply) => {
    try {
      await mcpService.disconnect();
      connectedServers.clear();

      return {
        success: true,
        message: 'Disconnected from MCP server',
      };
    } catch (error: any) {
      return reply.status(500).send({
        error: error.message || 'Disconnection failed',
      });
    }
  });

  // List tools from connected server
  fastify.get('/tools', async (request, reply) => {
    try {
      const tools = await mcpService.listTools();
      return { tools };
    } catch (error: any) {
      // Return empty list if not connected
      if (error.message.includes('not connected')) {
        return { tools: [], message: 'No MCP server connected' };
      }
      return reply.status(500).send({
        error: error.message || 'Failed to list tools',
      });
    }
  });

  // Execute an MCP tool
  fastify.post('/execute', async (request, reply) => {
    try {
      const body = executeToolSchema.parse(request.body);

      console.log(`🔧 Executing MCP tool: ${body.toolName}`);
      const result = await mcpService.callTool(body.toolName, body.args);

      return {
        success: true,
        result,
      };
    } catch (error: any) {
      console.error('MCP tool execution error:', error);

      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        error: error.message || 'Tool execution failed',
      });
    }
  });

  // Read a resource
  fastify.post('/resource', async (request, reply) => {
    try {
      const { uri } = request.body as { uri: string };

      if (!uri) {
        return reply.status(400).send({
          error: 'URI is required',
        });
      }

      const result = await mcpService.readResource(uri);
      return {
        success: true,
        resource: result,
      };
    } catch (error: any) {
      return reply.status(500).send({
        error: error.message || 'Failed to read resource',
      });
    }
  });

  // Get status of MCP connections
  fastify.get('/status', async (request, reply) => {
    const connections = Array.from(connectedServers.values());
    
    return {
      connected: connections.length > 0,
      servers: connections,
      availableServers: AVAILABLE_SERVERS.length,
    };
  });
}


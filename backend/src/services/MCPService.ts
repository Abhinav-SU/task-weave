import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MCPService {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async connect(serverCommand: string, serverArgs: string[] = []) {
    try {
      this.transport = new StdioClientTransport({
        command: serverCommand,
        args: serverArgs,
      });

      this.client = new Client({
        name: 'taskweave-mcp-client',
        version: '1.0.0',
      }, {
        capabilities: {
          tools: {},
        },
      });

      await this.client.connect(this.transport);
      console.log('✓ MCP Client connected');
      return true;
    } catch (error) {
      console.error('Failed to connect MCP client:', error);
      return false;
    }
  }

  async listTools() {
    if (!this.client) {
      throw new Error('MCP Client not connected');
    }

    const response = await this.client.request({
      method: 'tools/list',
    }, { _meta: {} });

    return response.tools || [];
  }

  async callTool(toolName: string, args: Record<string, any>) {
    if (!this.client) {
      throw new Error('MCP Client not connected');
    }

    const response = await this.client.request({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }, { _meta: {} });

    return response;
  }

  async readResource(uri: string) {
    if (!this.client) {
      throw new Error('MCP Client not connected');
    }

    const response = await this.client.request({
      method: 'resources/read',
      params: { uri },
    }, { _meta: {} });

    return response;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
      console.log('✓ MCP Client disconnected');
    }
  }
}

export const mcpService = new MCPService();

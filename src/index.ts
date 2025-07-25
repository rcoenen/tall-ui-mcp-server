#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { componentHandlers } from './handlers/components.js';
import { ComponentRegistry } from './registry/loader.js';

const server = new Server(
  {
    name: 'tall-ui-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize component registry
const registry = new ComponentRegistry();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'tallui_list_components',
        description: 'List all available TALL UI components',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category (optional)',
            },
          },
        },
      },
      {
        name: 'tallui_get_component',
        description: 'Get detailed information about a specific component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., "button", "modal")',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'tallui_search_components',
        description: 'Search components by keyword',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'tallui_get_component_example',
        description: 'Get usage examples for a component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name',
            },
            exampleIndex: {
              type: 'number',
              description: 'Example index (optional)',
            },
          },
          required: ['name'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'tallui_list_components':
        return await componentHandlers.listComponents(registry, args as any || {});
      
      case 'tallui_get_component':
        return await componentHandlers.getComponent(registry, args as any || {});
      
      case 'tallui_search_components':
        return await componentHandlers.searchComponents(registry, args as any || {});
      
      case 'tallui_get_component_example':
        return await componentHandlers.getComponentExample(registry, args as any || {});
      
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error}`
    );
  }
});

// Initialize registry and start server
async function main() {
  await registry.loadComponents();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TALL UI MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
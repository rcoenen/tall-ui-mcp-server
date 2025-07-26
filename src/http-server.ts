#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { componentHandlers } from './handlers/components.js';
import { ComponentRegistry } from './registry/loader.js';

// Store active transports by session ID
const activeTransports = new Map<string, SSEServerTransport>();

// Initialize component registry
const registry = new ComponentRegistry();

// Create MCP server instance
const mcpServer = new Server(
  {
    name: 'tall-ui-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up MCP server handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
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

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
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

// Create HTTP server
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  try {
    if (url.pathname === '/sse' && req.method === 'GET') {
      // Handle SSE connection
      const transport = new SSEServerTransport('/message', res, {
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false
      });
      
      activeTransports.set(transport.sessionId, transport);
      
      transport.onclose = () => {
        activeTransports.delete(transport.sessionId);
      };
      
      transport.onerror = (error) => {
        console.error('Transport error:', error);
        activeTransports.delete(transport.sessionId);
      };
      
      await mcpServer.connect(transport);
      await transport.start();
      
    } else if (url.pathname === '/message' && req.method === 'POST') {
      // Handle POST messages
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        res.writeHead(400);
        res.end('Missing sessionId');
        return;
      }
      
      const transport = activeTransports.get(sessionId);
      if (!transport) {
        res.writeHead(404);
        res.end('Session not found');
        return;
      }
      
      await transport.handlePostMessage(req, res);
      
    } else if (url.pathname === '/health') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        server: 'tall-ui-mcp-server',
        version: '1.0.0',
        transport: 'sse'
      }));
      
    } else {
      // Serve basic info page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TALL UI MCP Server</title>
        </head>
        <body>
          <h1>TALL UI MCP Server</h1>
          <p>This is a Model Context Protocol server for TALL stack UI components.</p>
          <h2>MCP Endpoints:</h2>
          <ul>
            <li><strong>GET /sse</strong> - Establish SSE connection</li>
            <li><strong>POST /message</strong> - Send MCP messages</li>
            <li><strong>GET /health</strong> - Health check</li>
          </ul>
          <h2>Usage:</h2>
          <p>Configure your MCP client to use:</p>
          <pre>
{
  "mcpServers": {
    "tall-ui": {
      "command": "node",
      "args": ["path/to/dist/http-server.js"],
      "transport": "sse",
      "url": "${req.headers.host}/sse"
    }
  }
}
          </pre>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
});

const PORT = process.env.PORT || 3000;

async function main() {
  await registry.loadComponents();
  
  server.listen(PORT, () => {
    console.log(`TALL UI MCP Server (HTTP) listening on port ${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
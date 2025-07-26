#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { componentHandlers } from './handlers/components.js';
import { ComponentRegistry } from './registry/loader.js';

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

// Parse JSON body
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Create HTTP server for Streamable HTTP transport
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
    if (url.pathname === '/mcp' && req.method === 'POST') {
      // Handle MCP Streamable HTTP requests
      const body = await parseBody(req);
      
      if (!body || !body.jsonrpc) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
        return;
      }

      // Process the request through MCP server
      let response;
      
      if (body.method === 'tools/list') {
        // Manually call the handler we set up
        response = await (async () => {
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
        })();
      } else if (body.method === 'tools/call') {
        // Handle tool calls
        const { name, arguments: args } = body.params;
        
        try {
          let result;
          switch (name) {
            case 'tallui_list_components':
              result = await componentHandlers.listComponents(registry, args || {});
              break;
            case 'tallui_get_component':
              result = await componentHandlers.getComponent(registry, args || {});
              break;
            case 'tallui_search_components':
              result = await componentHandlers.searchComponents(registry, args || {});
              break;
            case 'tallui_get_component_example':
              result = await componentHandlers.getComponentExample(registry, args || {});
              break;
            default:
              throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
          }
          response = result;
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error}`);
        }
      } else if (body.method === 'initialize') {
        response = {
          protocolVersion: '2025-03-26',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'tall-ui-mcp-server',
            version: '1.0.0'
          }
        };
      } else if (body.method === 'notifications/initialized') {
        // Claude Code sends this after initialize, just acknowledge it
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          result: null,
          id: body.id
        }));
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found'
          },
          id: body.id
        }));
        return;
      }

      // Send response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        result: response,
        id: body.id
      }));
      
    } else if (url.pathname === '/health') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        server: 'tall-ui-mcp-server',
        version: '1.0.0',
        transport: 'streamable-http',
        protocol: '2025-03-26'
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
          <h1>TALL UI MCP Server (Streamable HTTP)</h1>
          <p>This is a Model Context Protocol server for TALL stack UI components.</p>
          <h2>MCP Endpoint:</h2>
          <ul>
            <li><strong>POST /mcp</strong> - MCP protocol endpoint</li>
            <li><strong>GET /health</strong> - Health check</li>
          </ul>
          <h2>Usage:</h2>
          <p>Configure your MCP client to use:</p>
          <pre>
claude mcp add --transport http tall-ui ${req.headers.host}/mcp
          </pre>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = process.env.PORT || 3000;

async function main() {
  await registry.loadComponents();
  
  server.listen(PORT, () => {
    console.log(`TALL UI MCP Server (Streamable HTTP) listening on port ${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
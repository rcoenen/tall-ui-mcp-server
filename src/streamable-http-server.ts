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
import { iconHandlers } from './handlers/icons.js';
import { IconRegistry } from './icons/registry.js';

// Initialize registries
const componentRegistry = new ComponentRegistry();
const iconRegistry = new IconRegistry();

// Create MCP server instance
const mcpServer = new Server(
  {
    name: 'wireui-mcp-server',
    version: '1.1.0',
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
        description: 'List all available WireUI components',
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
        return await componentHandlers.listComponents(componentRegistry, args as any || {});
      
      case 'tallui_get_component':
        return await componentHandlers.getComponent(componentRegistry, args as any || {});
      
      case 'tallui_search_components':
        return await componentHandlers.searchComponents(componentRegistry, args as any || {});
      
      case 'tallui_get_component_example':
        return await componentHandlers.getComponentExample(componentRegistry, args as any || {});
      
      case 'wireui_list_icons':
        return await iconHandlers.listIcons(iconRegistry, args as any || {});
      
      case 'wireui_check_icon':
        return await iconHandlers.checkIcon(iconRegistry, args as any || {});
      
      case 'wireui_find_similar_icons':
        return await iconHandlers.findSimilarIcons(iconRegistry, args as any || {});
      
      case 'wireui_get_icon_example':
        return await iconHandlers.getIconExample(iconRegistry, args as any || {});
      
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
                description: 'List all available WireUI components',
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
              {
                name: 'wireui_list_icons',
                description: 'List all available icons from Heroicons and Phosphor',
                inputSchema: {
                  type: 'object',
                  properties: {
                    library: {
                      type: 'string',
                      enum: ['heroicons', 'phosphor', 'all'],
                      description: 'Filter by icon library',
                    },
                    search: {
                      type: 'string',
                      description: 'Search icons by name or tags',
                    },
                  },
                },
              },
              {
                name: 'wireui_check_icon',
                description: 'Check if an icon exists and get its variants',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Icon name to check',
                    },
                    library: {
                      type: 'string',
                      enum: ['heroicons', 'phosphor'],
                      description: 'Specific library to check',
                    },
                    variant: {
                      type: 'string',
                      description: 'Specific variant to check',
                    },
                  },
                  required: ['name'],
                },
              },
              {
                name: 'wireui_find_similar_icons',
                description: 'Find icons similar to a given name (fuzzy search)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Icon name to search for',
                    },
                    limit: {
                      type: 'number',
                      description: 'Maximum number of suggestions (default: 5)',
                    },
                  },
                  required: ['name'],
                },
              },
              {
                name: 'wireui_get_icon_example',
                description: 'Get usage examples for an icon',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Icon name',
                    },
                    library: {
                      type: 'string',
                      enum: ['heroicons', 'phosphor'],
                      description: 'Icon library',
                    },
                    variant: {
                      type: 'string',
                      description: 'Specific variant',
                    },
                  },
                  required: ['name', 'library'],
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
              result = await componentHandlers.listComponents(componentRegistry, args || {});
              break;
            case 'tallui_get_component':
              result = await componentHandlers.getComponent(componentRegistry, args || {});
              break;
            case 'tallui_search_components':
              result = await componentHandlers.searchComponents(componentRegistry, args || {});
              break;
            case 'tallui_get_component_example':
              result = await componentHandlers.getComponentExample(componentRegistry, args || {});
              break;
            case 'wireui_list_icons':
              result = await iconHandlers.listIcons(iconRegistry, args || {});
              break;
            case 'wireui_check_icon':
              result = await iconHandlers.checkIcon(iconRegistry, args || {});
              break;
            case 'wireui_find_similar_icons':
              result = await iconHandlers.findSimilarIcons(iconRegistry, args || {});
              break;
            case 'wireui_get_icon_example':
              result = await iconHandlers.getIconExample(iconRegistry, args || {});
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
            name: 'wireui-mcp-server',
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
        server: 'wireui-mcp-server',
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
          <title>WireUI MCP Server</title>
        </head>
        <body>
          <h1>WireUI MCP Server (Streamable HTTP)</h1>
          <p>This is a Model Context Protocol server for TALL stack UI components.</p>
          <h2>MCP Endpoint:</h2>
          <ul>
            <li><strong>POST /mcp</strong> - MCP protocol endpoint</li>
            <li><strong>GET /health</strong> - Health check</li>
          </ul>
          <h2>Usage:</h2>
          <p>Configure your MCP client to use:</p>
          <pre>
claude mcp add --transport http wireui ${req.headers.host}/mcp
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
  await componentRegistry.loadComponents();
  await iconRegistry.loadIcons();
  
  server.listen(PORT, () => {
    console.log(`WireUI MCP Server (Streamable HTTP) listening on port ${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
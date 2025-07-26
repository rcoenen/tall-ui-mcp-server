#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { ComponentRegistry } from './registry/loader.js';
import { componentHandlers } from './handlers/components.js';

const registry = new ComponentRegistry();

// CORS headers
function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Parse JSON body
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Handle API requests
async function handleApiRequest(req: IncomingMessage, res: ServerResponse, endpoint: string) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    let result;
    const body = req.method === 'POST' ? await parseBody(req) : {};
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const params = Object.fromEntries(url.searchParams);
    const args = { ...params, ...body };

    switch (endpoint) {
      case 'list':
        result = await componentHandlers.listComponents(registry, args);
        break;
      case 'get':
        if (!args.name) {
          throw new Error('Component name is required');
        }
        result = await componentHandlers.getComponent(registry, args);
        break;
      case 'search':
        if (!args.query) {
          throw new Error('Search query is required');
        }
        result = await componentHandlers.searchComponents(registry, args);
        break;
      case 'example':
        if (!args.name) {
          throw new Error('Component name is required');
        }
        result = await componentHandlers.getComponentExample(registry, args);
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result, null, 2));
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }));
  }
}

// Create server
const server = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  
  // Health check
  if (url.pathname === '/health') {
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', components: registry.getAll().length }));
    return;
  }

  // API endpoints
  if (url.pathname === '/api/components') {
    await handleApiRequest(req, res, 'list');
    return;
  }

  if (url.pathname === '/api/components/get') {
    await handleApiRequest(req, res, 'get');
    return;
  }

  if (url.pathname === '/api/components/search') {
    await handleApiRequest(req, res, 'search');
    return;
  }

  if (url.pathname === '/api/components/example') {
    await handleApiRequest(req, res, 'example');
    return;
  }

  // Documentation page
  if (url.pathname === '/' || url.pathname === '/docs') {
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>TALL UI MCP Server</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; }
        .endpoint { background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
        .method { background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        code { background: #e5e7eb; padding: 2px 4px; border-radius: 3px; }
        .example { background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>🏗️ TALL UI MCP Server</h1>
    <p>A web API for WireUI v2 component information. This server provides detailed metadata about all ${registry.getAll().length} WireUI components.</p>
    
    <h2>📋 Available Endpoints</h2>
    
    <div class="endpoint">
        <h3><span class="method">GET</span> /api/components</h3>
        <p>List all available components</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/components</code><br>
            <code>GET /api/components?category=forms</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/components/get</h3>
        <p>Get detailed information about a specific component</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/components/get?name=button</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/components/search</h3>
        <p>Search components by keyword</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/components/search?query=form</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/components/example</h3>
        <p>Get usage examples for a component</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/components/example?name=button</code><br>
            <code>GET /api/components/example?name=button&exampleIndex=1</code>
        </div>
    </div>

    <h2>🎯 Quick Test</h2>
    <p>Try these endpoints:</p>
    <ul>
        <li><a href="/api/components" target="_blank">List all components</a></li>
        <li><a href="/api/components/get?name=button" target="_blank">Get button component</a></li>
        <li><a href="/api/components/search?query=form" target="_blank">Search for form components</a></li>
        <li><a href="/health" target="_blank">Health check</a></li>
    </ul>

    <h2>📖 About</h2>
    <p>This server provides comprehensive information about WireUI v2 components including props, slots, examples, and best practices. Originally designed as an MCP server, this web version makes the data accessible via HTTP API.</p>
    
    <p><strong>Version:</strong> 1.0.0<br>
    <strong>Components:</strong> ${registry.getAll().length}<br>
    <strong>GitHub:</strong> <a href="https://github.com/rcoenen/tall-ui-mcp-server">rcoenen/tall-ui-mcp-server</a></p>
</body>
</html>
    `);
    return;
  }

  // 404
  setCorsHeaders(res);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
async function main() {
  console.log('Loading components...');
  await registry.loadComponents();
  console.log(`Loaded ${registry.getAll().length} components`);
  
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🏗️ TALL UI MCP Server running on port ${port}`);
    console.log(`📖 Documentation: http://localhost:${port}`);
    console.log(`🔍 API: http://localhost:${port}/api/components`);
  });
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
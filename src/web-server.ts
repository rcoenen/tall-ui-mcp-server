#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { ComponentRegistry } from './registry/loader.js';
import { componentHandlers } from './handlers/components.js';
import { IconRegistry } from './icons/registry.js';
import { iconHandlers } from './handlers/icons.js';

const componentRegistry = new ComponentRegistry();
const iconRegistry = new IconRegistry();

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
        result = await componentHandlers.listComponents(componentRegistry, args);
        break;
      case 'get':
        if (!args.name) {
          throw new Error('Component name is required');
        }
        result = await componentHandlers.getComponent(componentRegistry, args);
        break;
      case 'search':
        if (!args.query) {
          throw new Error('Search query is required');
        }
        result = await componentHandlers.searchComponents(componentRegistry, args);
        break;
      case 'example':
        if (!args.name) {
          throw new Error('Component name is required');
        }
        result = await componentHandlers.getComponentExample(componentRegistry, args);
        break;
      case 'listIcons':
        result = await iconHandlers.listIcons(iconRegistry, args);
        break;
      case 'checkIcon':
        if (!args.name) {
          throw new Error('Icon name is required');
        }
        result = await iconHandlers.checkIcon(iconRegistry, args);
        break;
      case 'findSimilar':
        if (!args.name) {
          throw new Error('Icon name is required');
        }
        result = await iconHandlers.findSimilarIcons(iconRegistry, args);
        break;
      case 'iconExample':
        if (!args.name || !args.library) {
          throw new Error('Icon name and library are required');
        }
        result = await iconHandlers.getIconExample(iconRegistry, args);
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
    res.end(JSON.stringify({ status: 'ok', components: componentRegistry.getAll().length }));
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

  // Icon API endpoints
  if (url.pathname === '/api/icons') {
    await handleApiRequest(req, res, 'listIcons');
    return;
  }

  if (url.pathname === '/api/icons/check') {
    await handleApiRequest(req, res, 'checkIcon');
    return;
  }

  if (url.pathname === '/api/icons/similar') {
    await handleApiRequest(req, res, 'findSimilar');
    return;
  }

  if (url.pathname === '/api/icons/example') {
    await handleApiRequest(req, res, 'iconExample');
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
    <title>WireUI MCP Server</title>
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
    <h1>🏗️ WireUI MCP Server</h1>
    <p>A web API for WireUI v2 component information and icon libraries. This server provides detailed metadata about all ${componentRegistry.getAll().length} WireUI components and ${iconRegistry.listIcons().length} icons from Heroicons and Phosphor.</p>
    
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

    <h2>🎨 Icon Endpoints (NEW! v1.1.0)</h2>
    
    <div class="endpoint">
        <h3><span class="method">GET</span> /api/icons</h3>
        <p>List all available icons from Heroicons and Phosphor</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/icons</code><br>
            <code>GET /api/icons?library=heroicons</code><br>
            <code>GET /api/icons?search=user</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/icons/check</h3>
        <p>Check if an icon exists and get its variants</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/icons/check?name=user</code><br>
            <code>GET /api/icons/check?name=user&library=heroicons&variant=solid</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/icons/similar</h3>
        <p>Find icons similar to a given name (fuzzy search)</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/icons/similar?name=usr</code><br>
            <code>GET /api/icons/similar?name=person&limit=10</code>
        </div>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> /api/icons/example</h3>
        <p>Get usage examples for an icon</p>
        <div class="example">
            <strong>Example:</strong><br>
            <code>GET /api/icons/example?name=user&library=heroicons</code><br>
            <code>GET /api/icons/example?name=user&library=phosphor&variant=bold</code>
        </div>
    </div>

    <h2>🎯 Quick Test</h2>
    <p>Try these endpoints:</p>
    <h3>Components:</h3>
    <ul>
        <li><a href="/api/components" target="_blank">List all components</a></li>
        <li><a href="/api/components/get?name=button" target="_blank">Get button component</a></li>
        <li><a href="/api/components/search?query=form" target="_blank">Search for form components</a></li>
    </ul>
    <h3>Icons:</h3>
    <ul>
        <li><a href="/api/icons?library=heroicons" target="_blank">List all Heroicons</a></li>
        <li><a href="/api/icons/check?name=user" target="_blank">Check if 'user' icon exists</a></li>
        <li><a href="/api/icons/similar?name=usr" target="_blank">Find icons similar to 'usr'</a></li>
        <li><a href="/api/icons/example?name=user&library=heroicons" target="_blank">Get 'user' icon examples</a></li>
    </ul>
    <h3>System:</h3>
    <ul>
        <li><a href="/health" target="_blank">Health check</a></li>
    </ul>

    <h2>📖 About</h2>
    <p>This server provides comprehensive information about WireUI v2 components including props, slots, examples, and best practices. Originally designed as an MCP server, this web version makes the data accessible via HTTP API.</p>
    
    <p><strong>Version:</strong> 1.0.0<br>
    <strong>Components:</strong> ${componentRegistry.getAll().length}<br>
    <strong>GitHub:</strong> <a href="https://github.com/rcoenen/wireui-mcp-server">rcoenen/wireui-mcp-server</a></p>
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
  await componentRegistry.loadComponents();
  console.log(`Loaded ${componentRegistry.getAll().length} components`);
  
  console.log('Loading icons...');
  await iconRegistry.loadIcons();
  console.log(`Loaded ${iconRegistry.listIcons().length} icons`);
  
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🏗️ WireUI MCP Server running on port ${port}`);
    console.log(`📖 Documentation: http://localhost:${port}`);
    console.log(`🔍 API: http://localhost:${port}/api/components`);
  });
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
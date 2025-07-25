import { ComponentRegistry } from '../registry/loader.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

interface ListComponentsArgs {
  category?: string;
}

interface GetComponentArgs {
  name: string;
}

interface SearchComponentsArgs {
  query: string;
}

interface GetComponentExampleArgs {
  name: string;
  exampleIndex?: number;
}

export const componentHandlers = {
  async listComponents(registry: ComponentRegistry, args: ListComponentsArgs) {
    const { category } = args;
    
    const components = category 
      ? registry.getByCategory(category)
      : registry.getAll();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: components.length,
            category: category || 'all',
            components: components.map(c => ({
              name: c.name,
              category: c.category,
              description: c.description,
            })),
          }, null, 2),
        },
      ],
    };
  },

  async getComponent(registry: ComponentRegistry, args: GetComponentArgs) {
    const { name } = args;
    
    const component = registry.getByName(name);
    if (!component) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Component "${name}" not found`
      );
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(component, null, 2),
        },
      ],
    };
  },

  async searchComponents(registry: ComponentRegistry, args: SearchComponentsArgs) {
    const { query } = args;
    
    const results = registry.search(query);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            count: results.length,
            results: results.map(c => ({
              name: c.name,
              category: c.category,
              description: c.description,
              relevance: c.tags?.filter(t => 
                t.toLowerCase().includes(query.toLowerCase())
              ),
            })),
          }, null, 2),
        },
      ],
    };
  },

  async getComponentExample(registry: ComponentRegistry, args: GetComponentExampleArgs) {
    const { name, exampleIndex = 0 } = args;
    
    const component = registry.getByName(name);
    if (!component) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Component "${name}" not found`
      );
    }
    
    if (!component.examples || component.examples.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No examples available for component "${name}"`,
          },
        ],
      };
    }
    
    const example = component.examples[exampleIndex];
    if (!example) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Example index ${exampleIndex} out of range (0-${component.examples.length - 1})`
      );
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            component: name,
            exampleIndex,
            totalExamples: component.examples.length,
            example,
          }, null, 2),
        },
      ],
    };
  },
};
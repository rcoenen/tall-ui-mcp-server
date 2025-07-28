import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { IconRegistry } from '../icons/registry.js';

export const iconHandlers = {
  async listIcons(
    registry: IconRegistry,
    args: { library?: 'heroicons' | 'phosphor' | 'all'; search?: string }
  ) {
    try {
      const library = args.library === 'all' ? undefined : args.library;
      const icons = registry.listIcons(library, args.search);
      
      // Group by library for better organization
      const grouped = icons.reduce((acc, icon) => {
        if (!acc[icon.library]) {
          acc[icon.library] = [];
        }
        acc[icon.library].push({
          name: icon.name,
          variants: icon.variants,
        });
        return acc;
      }, {} as Record<string, Array<{ name: string; variants: string[] }>>);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              totalIcons: icons.length,
              libraries: grouped,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list icons: ${error}`
      );
    }
  },

  async checkIcon(
    registry: IconRegistry,
    args: { name: string; library?: 'heroicons' | 'phosphor'; variant?: string }
  ) {
    try {
      const result = registry.checkIcon(args.name, args.library, args.variant);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to check icon: ${error}`
      );
    }
  },

  async findSimilarIcons(
    registry: IconRegistry,
    args: { name: string; limit?: number }
  ) {
    try {
      const suggestions = registry.findSimilarIcons(args.name, args.limit || 5);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query: args.name,
              suggestions,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to find similar icons: ${error}`
      );
    }
  },

  async getIconExample(
    registry: IconRegistry,
    args: { name: string; library: 'heroicons' | 'phosphor'; variant?: string }
  ) {
    try {
      const example = registry.getIconExample(args.name, args.library, args.variant);
      const checkResult = registry.checkIcon(args.name, args.library, args.variant);
      
      let content = `## Icon: ${args.name} (${args.library})\n\n`;
      
      if (checkResult.exists) {
        content += `### Basic Usage\n\`\`\`blade\n${example}\n\`\`\`\n\n`;
        content += `### All Variants\n`;
        
        checkResult.variants!.forEach(v => {
          const variantExample = registry.getIconExample(args.name, args.library, v);
          content += `\n**${v}:**\n\`\`\`blade\n${variantExample}\n\`\`\`\n`;
        });
        
        content += `\n### With Attributes\n\`\`\`blade\n`;
        content += `{{-- Custom size and color --}}\n`;
        content += `<x-icon name="${args.name}" class="w-5 h-5 text-primary-500" />\n\n`;
        content += `{{-- Using component syntax --}}\n`;
        if (args.library === 'heroicons') {
          content += `<x-heroicons::${args.variant || 'outline'}.${args.name} class="w-6 h-6" />\n`;
        } else {
          content += `<x-phosphor.icons::${args.variant || 'regular'}.${args.name} class="w-6 h-6" />\n`;
        }
        content += `\`\`\``;
      } else {
        content += checkResult.message || 'Icon not found';
        
        if (checkResult.suggestions && checkResult.suggestions.length > 0) {
          content += `\n\n### Did you mean?\n`;
          checkResult.suggestions.forEach(suggestion => {
            content += `- **${suggestion.name}** (${suggestion.library})\n`;
          });
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get icon example: ${error}`
      );
    }
  },
};
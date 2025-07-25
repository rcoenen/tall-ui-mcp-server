import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ComponentMetadata, validateComponentMetadata } from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ComponentRegistry {
  private components: Map<string, ComponentMetadata> = new Map();
  private componentsByCategory: Map<string, ComponentMetadata[]> = new Map();

  async loadComponents(): Promise<void> {
    const componentsDir = join(__dirname, '../components/wireui');
    
    try {
      const files = await readdir(componentsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const content = await readFile(join(componentsDir, file), 'utf-8');
        const data = JSON.parse(content);
        
        const validated = validateComponentMetadata(data);
        if (validated) {
          this.components.set(validated.name, validated);
          
          // Index by category
          const categoryComponents = this.componentsByCategory.get(validated.category) || [];
          categoryComponents.push(validated);
          this.componentsByCategory.set(validated.category, categoryComponents);
        }
      }
      
      console.error(`Loaded ${this.components.size} components`);
    } catch (error) {
      console.error('Error loading components:', error);
      // Continue with empty registry rather than crash
    }
  }

  getAll(): ComponentMetadata[] {
    return Array.from(this.components.values());
  }

  getByName(name: string): ComponentMetadata | undefined {
    return this.components.get(name);
  }

  getByCategory(category: string): ComponentMetadata[] {
    return this.componentsByCategory.get(category) || [];
  }

  search(query: string): ComponentMetadata[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.getAll().filter(component => 
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.category.toLowerCase().includes(lowercaseQuery) ||
      component.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getCategories(): string[] {
    return Array.from(this.componentsByCategory.keys()).sort();
  }
}
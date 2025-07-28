import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IconLibrary, IconMetadata, IconCheckResult } from './schema.js';

export class IconRegistry {
  private heroicons: IconLibrary | null = null;
  private phosphor: IconLibrary | null = null;
  private iconIndex: Map<string, IconMetadata[]> = new Map();
  
  async loadIcons(): Promise<void> {
    const projectRoot = process.cwd();
    const dataDir = join(projectRoot, 'src/icons/data');
    
    try {
      // Load Heroicons
      const heroiconsData = await readFile(join(dataDir, 'heroicons.json'), 'utf-8');
      this.heroicons = JSON.parse(heroiconsData);
      
      // Load Phosphor icons
      const phosphorData = await readFile(join(dataDir, 'phosphor.json'), 'utf-8');
      this.phosphor = JSON.parse(phosphorData);
      
      // Build index for faster lookups
      this.buildIndex();
      
      console.log(`Loaded ${this.heroicons.totalIcons} Heroicons and ${this.phosphor.totalIcons} Phosphor icons`);
    } catch (error) {
      console.error('Failed to load icon data:', error);
      // Initialize with empty data if files don't exist
      this.heroicons = { name: 'heroicons', version: '', totalIcons: 0, variants: [], icons: [], lastUpdated: '' };
      this.phosphor = { name: 'phosphor', version: '', totalIcons: 0, variants: [], icons: [], lastUpdated: '' };
    }
  }
  
  private buildIndex(): void {
    this.iconIndex.clear();
    
    // Index all icons by name
    [...(this.heroicons?.icons || []), ...(this.phosphor?.icons || [])].forEach(icon => {
      const existing = this.iconIndex.get(icon.name) || [];
      existing.push(icon);
      this.iconIndex.set(icon.name, existing);
    });
  }
  
  checkIcon(name: string, library?: 'heroicons' | 'phosphor', variant?: string): IconCheckResult {
    const icons = this.iconIndex.get(name);
    
    if (!icons || icons.length === 0) {
      // Icon doesn't exist, find suggestions
      const suggestions = this.findSimilarIcons(name);
      return {
        exists: false,
        suggestions,
        message: suggestions.length > 0 
          ? `Icon '${name}' not found. Did you mean '${suggestions[0].name}'?`
          : `Icon '${name}' not found.`
      };
    }
    
    // Filter by library if specified
    const matchingIcons = library 
      ? icons.filter(i => i.library === library)
      : icons;
    
    if (matchingIcons.length === 0) {
      return {
        exists: false,
        message: `Icon '${name}' not found in ${library} library.`
      };
    }
    
    const icon = matchingIcons[0];
    
    // Check variant if specified
    if (variant && !icon.variants.includes(variant)) {
      return {
        exists: true,
        library: icon.library,
        variants: icon.variants,
        message: `Icon '${name}' exists but variant '${variant}' not found. Available: ${icon.variants.join(', ')}`
      };
    }
    
    return {
      exists: true,
      library: icon.library,
      variants: icon.variants,
    };
  }
  
  findSimilarIcons(name: string, limit: number = 5): Array<{
    name: string;
    library: 'heroicons' | 'phosphor';
    similarity: number;
    variants: string[];
  }> {
    const results: Array<{
      name: string;
      library: 'heroicons' | 'phosphor';
      similarity: number;
      variants: string[];
    }> = [];
    
    // Simple similarity check based on:
    // 1. Exact substring match
    // 2. Levenshtein distance
    // 3. Tag matches
    
    this.iconIndex.forEach((icons, iconName) => {
      icons.forEach(icon => {
        let similarity = 0;
        
        // Exact substring match
        if (iconName.includes(name) || name.includes(iconName)) {
          similarity += 0.5;
        }
        
        // Calculate simple character-based similarity
        const distance = this.levenshteinDistance(name, iconName);
        const maxLen = Math.max(name.length, iconName.length);
        similarity += (1 - distance / maxLen) * 0.3;
        
        // Check tag matches
        if (icon.tags?.some(tag => tag.includes(name) || name.includes(tag))) {
          similarity += 0.2;
        }
        
        if (similarity > 0.3) {
          results.push({
            name: iconName,
            library: icon.library,
            similarity,
            variants: icon.variants,
          });
        }
      });
    });
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  listIcons(library?: 'heroicons' | 'phosphor', search?: string): IconMetadata[] {
    let icons: IconMetadata[] = [];
    
    if (!library || library === 'heroicons') {
      icons.push(...(this.heroicons?.icons || []));
    }
    
    if (!library || library === 'phosphor') {
      icons.push(...(this.phosphor?.icons || []));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      icons = icons.filter(icon => 
        icon.name.toLowerCase().includes(searchLower) ||
        icon.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return icons;
  }
  
  getIconExample(name: string, library: 'heroicons' | 'phosphor', variant?: string): string {
    const checkResult = this.checkIcon(name, library, variant);
    
    if (!checkResult.exists) {
      return `<!-- ${checkResult.message} -->`;
    }
    
    const variantToUse = variant || checkResult.variants![0];
    
    if (library === 'heroicons') {
      if (variantToUse === 'outline') {
        return `<x-icon name="${name}" />`;
      } else if (variantToUse === 'solid') {
        return `<x-icon name="${name}" solid />`;
      } else if (variantToUse === 'mini.solid') {
        return `<x-icon name="${name}" solid mini />`;
      }
    } else if (library === 'phosphor') {
      if (variantToUse === 'regular') {
        return `<x-icon name="${name}" />`;
      } else {
        return `<x-icon name="${name}" ${variantToUse} />`;
      }
    }
    
    return `<x-icon name="${name}" />`;
  }
}
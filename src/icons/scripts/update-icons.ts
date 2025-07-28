#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IconLibrary } from '../schema.js';

const HEROICONS_VARIANTS = {
  outline: '24/outline',
  solid: '24/solid',
  'mini.solid': '20/solid',
};

const PHOSPHOR_VARIANTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];

async function fetchHeroicons(): Promise<IconLibrary> {
  console.log('Fetching Heroicons...');
  const icons = new Set<string>();
  
  // Fetch icon names from outline variant (all variants have same icons)
  const response = await fetch('https://api.github.com/repos/tailwindlabs/heroicons/contents/optimized/24/outline');
  const files = await response.json();
  
  if (!Array.isArray(files)) {
    throw new Error('Failed to fetch Heroicons');
  }
  
  files.forEach((file: any) => {
    if (file.name.endsWith('.svg')) {
      icons.add(file.name.replace('.svg', ''));
    }
  });
  
  const iconList = Array.from(icons).map(name => ({
    name,
    library: 'heroicons' as const,
    variants: Object.keys(HEROICONS_VARIANTS),
    tags: generateTags(name),
  }));
  
  return {
    name: 'heroicons',
    version: '2.1.5',
    totalIcons: iconList.length,
    variants: Object.keys(HEROICONS_VARIANTS),
    icons: iconList,
    lastUpdated: new Date().toISOString(),
  };
}

async function fetchPhosphorIcons(): Promise<IconLibrary> {
  console.log('Fetching Phosphor icons...');
  const icons = new Set<string>();
  
  // Fetch from regular variant (all variants have same icons)
  const response = await fetch('https://api.github.com/repos/phosphor-icons/core/contents/assets/regular');
  const files = await response.json();
  
  if (!Array.isArray(files)) {
    throw new Error('Failed to fetch Phosphor icons');
  }
  
  files.forEach((file: any) => {
    if (file.name.endsWith('.svg')) {
      icons.add(file.name.replace('.svg', ''));
    }
  });
  
  const iconList = Array.from(icons).map(name => ({
    name,
    library: 'phosphor' as const,
    variants: PHOSPHOR_VARIANTS,
    tags: generateTags(name),
  }));
  
  return {
    name: 'phosphor',
    version: '2.0.0',
    totalIcons: iconList.length,
    variants: PHOSPHOR_VARIANTS,
    icons: iconList,
    lastUpdated: new Date().toISOString(),
  };
}

function generateTags(iconName: string): string[] {
  // Convert kebab-case to tags
  const words = iconName.split('-');
  const tags = [...words];
  
  // Add common aliases
  if (iconName.includes('user')) tags.push('person', 'people');
  if (iconName.includes('arrow')) tags.push('direction');
  if (iconName.includes('check')) tags.push('tick', 'done');
  if (iconName.includes('x-mark')) tags.push('close', 'cross');
  if (iconName.includes('plus')) tags.push('add');
  if (iconName.includes('minus')) tags.push('remove', 'subtract');
  
  return [...new Set(tags)];
}

async function main() {
  try {
    const projectRoot = process.cwd();
    const dataDir = join(projectRoot, 'src/icons/data');
    
    // Fetch and save Heroicons
    const heroicons = await fetchHeroicons();
    await writeFile(
      join(dataDir, 'heroicons.json'),
      JSON.stringify(heroicons, null, 2)
    );
    console.log(`✓ Saved ${heroicons.totalIcons} Heroicons`);
    
    // Fetch and save Phosphor icons
    const phosphor = await fetchPhosphorIcons();
    await writeFile(
      join(dataDir, 'phosphor.json'),
      JSON.stringify(phosphor, null, 2)
    );
    console.log(`✓ Saved ${phosphor.totalIcons} Phosphor icons`);
    
    console.log('\n✨ Icon data updated successfully!');
  } catch (error) {
    console.error('Error updating icons:', error);
    process.exit(1);
  }
}

main();
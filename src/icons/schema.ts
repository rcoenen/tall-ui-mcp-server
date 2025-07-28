import { z } from 'zod';

export const IconVariantSchema = z.object({
  name: z.string(),
  size: z.number().optional(),
});

export const IconMetadataSchema = z.object({
  name: z.string(),
  library: z.enum(['heroicons', 'phosphor']),
  variants: z.array(z.string()),
  aliases: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const IconLibrarySchema = z.object({
  name: z.string(),
  version: z.string(),
  totalIcons: z.number(),
  variants: z.array(z.string()),
  icons: z.array(IconMetadataSchema),
  lastUpdated: z.string(),
});

export type IconMetadata = z.infer<typeof IconMetadataSchema>;
export type IconLibrary = z.infer<typeof IconLibrarySchema>;

export interface IconCheckResult {
  exists: boolean;
  library?: 'heroicons' | 'phosphor';
  variants?: string[];
  suggestions?: Array<{
    name: string;
    library: 'heroicons' | 'phosphor';
    similarity: number;
    variants: string[];
  }>;
  message?: string;
}
import { z } from 'zod';

// Prop schema
const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.any().optional(),
  enum: z.array(z.string()).optional(),
});

// Slot schema
const SlotSchema = z.object({
  name: z.string(),
  description: z.string(),
  required: z.boolean().default(false),
});

// Event schema
const EventSchema = z.object({
  name: z.string(),
  description: z.string(),
  payload: z.string().optional(),
});

// Example schema
const ExampleSchema = z.object({
  title: z.string(),
  description: z.string(),
  code: z.string(),
  livewire_context: z.string().optional(),
});

// Main component metadata schema
export const ComponentMetadataSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  wireui_version: z.string().optional(),
  props: z.array(PropSchema).default([]),
  slots: z.array(SlotSchema).default([]),
  events: z.array(EventSchema).default([]),
  wireui_features: z.array(z.string()).default([]),
  alpine_directives: z.array(z.string()).default([]),
  tailwind_classes: z.array(z.string()).default([]),
  examples: z.array(ExampleSchema).default([]),
  best_practices: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type ComponentMetadata = z.infer<typeof ComponentMetadataSchema>;
export type ComponentProp = z.infer<typeof PropSchema>;
export type ComponentSlot = z.infer<typeof SlotSchema>;
export type ComponentEvent = z.infer<typeof EventSchema>;
export type ComponentExample = z.infer<typeof ExampleSchema>;

export function validateComponentMetadata(data: unknown): ComponentMetadata | null {
  try {
    return ComponentMetadataSchema.parse(data);
  } catch (error) {
    console.error('Invalid component metadata:', error);
    return null;
  }
}
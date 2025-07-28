# WireUI MCP Server - TODO List

## 🚀 Immediate Priority

### 1. Push Latest Changes
- [ ] Resolve git credentials issue (alrighdee vs rcoenen)
- [ ] Push commit "Fix component path resolution and improve README"

### 2. Add Core WireUI Components
- [ ] **select.json** - Dropdown select with search
- [ ] **toggle.json** - Toggle switch component
- [ ] **alert.json** - Alert/notification component
- [ ] **card.json** - Card container component
- [ ] **dropdown.json** - Dropdown menu component
- [ ] **datetime-picker.json** - Date and time picker
- [ ] **phone.json** - Phone number input
- [ ] **textarea.json** - Multiline text input

## 📦 Component Templates

When adding new components, use this structure:

```json
{
  "name": "component-name",
  "category": "forms|actions|overlays|feedback",
  "description": "Brief description",
  "version": "1.0.0",
  "wireui_version": "^2.4",
  "props": [
    {
      "name": "prop-name",
      "type": "string|boolean|number",
      "description": "What it does",
      "required": false,
      "default": "value"
    }
  ],
  "slots": [
    {
      "name": "default",
      "description": "Main content",
      "required": false
    }
  ],
  "wireui_features": ["wire:model", "wire:click"],
  "alpine_directives": ["x-data", "x-show"],
  "examples": [
    {
      "title": "Basic Example",
      "description": "Simple usage",
      "code": "<x-component />",
      "livewire_context": "optional"
    }
  ],
  "best_practices": [],
  "accessibility": [],
  "tags": ["tag1", "tag2"]
}
```

## 🔧 Feature Enhancements

### Component Generation
- [ ] Add `tallui_generate_form` tool
- [ ] Implement component composition helper
- [ ] Create layout generators (cards, grids)

### Validation & Intelligence
- [ ] Add prop validation against WireUI docs
- [ ] Implement "common mistakes" warnings
- [ ] Add Tailwind class validation

### Developer Experience
- [ ] Create VS Code extension for component preview
- [ ] Add component snippets generator
- [ ] Build interactive documentation site

## 🗂️ Project Organization

### Documentation
- [ ] Add CONTRIBUTING.md
- [ ] Create component authoring guide
- [ ] Add example AI conversations
- [ ] Document MCP protocol specifics

### Testing
- [ ] Add unit tests for registry
- [ ] Create integration tests
- [ ] Add component validation tests
- [ ] Set up GitHub Actions CI

### Infrastructure
- [ ] Add npm publish workflow
- [ ] Create release automation
- [ ] Set up component auto-discovery
- [ ] Add telemetry for usage patterns

## 💡 Future Ideas

### Advanced Components
- [ ] Filament admin panel components
- [ ] Jetstream components
- [ ] Custom TALL patterns library

### AI Enhancements
- [ ] Component recommendation engine
- [ ] Auto-fix common errors
- [ ] Style consistency checker
- [ ] Performance optimization tips

### Integrations
- [ ] Laravel project scanner
- [ ] Tailwind config reader
- [ ] Alpine.js component detector
- [ ] Livewire component analyzer

## 📝 Notes for Next Session

1. **Current Working Directory**: `/Users/rob/Dev/wireui-mcp-server`
2. **Last Command Run**: `npm run inspect`
3. **Server Status**: Working correctly with 3 components
4. **Git Status**: Changes committed locally, need to push

### Quick Commands
```bash
# Build and test
npm run build && npm run inspect

# Add new component
# 1. Create src/components/wireui/[name].json
# 2. npm run build
# 3. Test with inspector

# Check what's loaded
# In inspector, run tallui_list_components
```

### Component Research
- WireUI Docs: https://wireui.dev/
- WireUI v2 Docs: https://v2.wireui.dev/
- GitHub: https://github.com/wireui/wireui

---
*Use this file to track progress and hand off to the next Claude session*
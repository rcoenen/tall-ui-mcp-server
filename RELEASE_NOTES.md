# Release Notes - v1.0.0

## 🎉 Complete WireUI v2 Coverage Achieved!

### Summary
This release marks a major milestone: **100% coverage of all 26 WireUI v2 components**. The MCP server now provides comprehensive support for the entire WireUI component library.

### What's New
- **23 new components added**, bringing total coverage from 3 to 26 components
- All components include:
  - Complete prop definitions with types and defaults
  - Slot documentation
  - Multiple real-world examples
  - Best practices and accessibility guidelines
  - Livewire integration examples
  - Alpine.js directive usage

### Components Added
**UI Components:** Alert, Avatar, Badge, Card, Dropdown, Icon, Link, Table  
**Form Components:** Checkbox, Color Picker, Currency, Datetime Picker, Errors, Maskable, Native Select, Number, Password, Phone, Radio, Select, Textarea, Time Picker, Toggle

### Important Fixes
- Fixed time-picker validation error (enum values must be strings)
- All components follow WireUI v2 patterns (boolean props, Heroicons v2)

### Breaking Changes
None for new installations. Existing users should note that many components now use boolean props instead of variant strings (see CHANGELOG.md for migration guide).

### Requirements
- WireUI v2.x
- Tailwind CSS v3 (v4 not supported)
- Heroicons v2
- Alpine.js v3
- Livewire v3

### Next Steps
With complete component coverage, future releases will focus on:
- Component validation tools
- Form generation helpers
- Enhanced examples and patterns
- Support for other TALL stack UI libraries

---

**Full Changelog**: https://github.com/rcoenen/wireui-mcp-server/blob/main/CHANGELOG.md
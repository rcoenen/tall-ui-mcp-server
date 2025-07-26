# Changelog

All notable changes to the TALL UI MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added - 2025-07-26

#### Production Best Practices Documentation (17:30 UTC)
- **Created BEST_PRACTICES_WIREUI.md**: Comprehensive guide based on real-world production issues
- **Added critical warnings** to select.json, datetime-picker.json, and input.json components
- **Documented solutions** for:
  - Tailwind CSS dynamic class purging in production
  - Background color box issues
  - Text alignment and color problems
  - Accessibility errors (PR #1087 submitted to WireUI)
- **Updated README.md** with prominent link to best practices guide

### Fixed - 2025-07-26

#### Currency Component Fixes (12:45 UTC)

##### 🔧 currency.json - Fixed Based on Test Harness Validation
- **Fixed icon name**: Changed `right-icon="trending-up"` to `right-icon="arrow-trending-up"` for Heroicons v2 compatibility
- **Enhanced reliability**: Added explicit `prefix="$"` to basic examples for consistent currency symbol display
- **Test harness findings**: Confirmed component exists and functions correctly in WireUI v2.4
- **Validation results**: All props (prefix, decimal, thousands, precision) work as specified

#### Select Component Configuration Fixes (13:00 UTC)

##### 🔧 select.json - Fixed Option Configuration Requirements
- **BREAKING CHANGE**: Updated option array structure for WireUI v2.4 compatibility
  - **Old format**: `['value' => 1, 'label' => 'John Doe']`
  - **New format**: `['id' => 1, 'name' => 'John Doe']` with `option-label="name"` and `option-value="id"`
- **Test harness discovery**: WireUI select component requires explicit `option-label` and `option-value` props
- **Fixed multiple examples**: Updated Basic Select, Select with Descriptions, Multiple Selection examples
- **Fixed icon name**: Changed `'icon' => 'exclamation'` to `'icon' => 'exclamation-triangle'` in priority example

##### 🔧 datetime-picker.json - Fixed Embedded Select Example
- **Updated booking system example**: Fixed embedded select component to use correct option configuration
- **Consistency improvement**: Ensures all select usage across components follows same pattern

### Fixed - 2025-07-26

#### Code Display Component Issues (11:50 UTC)

##### 🐛 Fixed Code Block Rendering in Test Harness
- Fixed issue where code examples were rendering as black rectangles
- Replaced `<x-code>` component usage with properly escaped HTML entities
- Blade syntax inside code examples was being evaluated instead of displayed
- Updated all demo pages to use `<pre><code>` with HTML entity encoding

#### Table Component Removal (10:45 UTC)

##### 🗑️ Removed table.json - WireUI Does Not Provide Table Component
- **BREAKING CHANGE**: Removed `table.json` from the MCP server
- Testing revealed that WireUI v2 does not actually provide a table component
- WireUI's documentation lists "Table" but redirects to Livewire PowerGrid (external package)
- Updated test harness to demonstrate WireUI-styled tables using standard HTML

### Added - 2025-07-25 (Part 2)

#### Complete WireUI v2 Component Coverage (15:00 - 16:30 UTC)

##### 🎉 All 25 WireUI Components Now Implemented!

Added the remaining 23 components to achieve 100% coverage of WireUI v2:

**UI Components:**
- ✅ Alert (fixed earlier)
- ✅ Avatar 
- ✅ Badge (fixed earlier)
- ✅ Button (fixed earlier)
- ✅ Card
- ✅ Dropdown (fixed earlier)
- ✅ Icon (fixed earlier)
- ✅ Link (fixed earlier)
- ✅ Modal (updated earlier)

**Form Components:**
- ✅ Checkbox
- ✅ Color Picker
- ✅ Currency
- ✅ Datetime Picker
- ✅ Errors
- ✅ Input (existing)
- ✅ Maskable
- ✅ Native Select
- ✅ Number
- ✅ Password
- ✅ Phone
- ✅ Radio
- ✅ Select
- ✅ Textarea
- ✅ Time Picker
- ✅ Toggle

All new components follow the corrected patterns:
- Boolean props for colors/variants
- Heroicons v2 naming convention
- Comprehensive examples and documentation
- Accessibility guidelines
- Best practices

##### 🐛 Fixed Time Picker Validation Error
- Changed `interval` enum values from numbers to strings to pass Zod validation

### Fixed - 2025-07-25

#### Component Specification Updates (14:45 - 14:50 UTC)

Based on comprehensive testing with a WireUI v2 test harness, the following critical fixes were applied:

##### 🔧 alert.json - Fixed at 14:46 UTC
- **BREAKING CHANGE**: Replaced `variant` prop with boolean color props
  - Removed: `variant` prop with enum values
  - Added: `info`, `success`, `warning`, `error`, `neutral` boolean props
- Updated all examples to use new boolean prop syntax
- Added `setup_requirements` section specifying Tailwind CSS v3 compatibility

##### 🔧 badge.json - Fixed at 14:47 UTC
- **BREAKING CHANGE**: Replaced `variant` prop with boolean color props
  - Removed: `variant` prop with enum values
  - Added: `primary`, `secondary`, `positive`, `negative`, `warning`, `info`, `gray`, `slate`, `neutral` boolean props
- Fixed icon names in examples:
  - `cog` → `cog-6-tooth` (Heroicons v2)
- Updated all examples to use boolean prop syntax
- Added `setup_requirements` section

##### 🔧 button.json - Fixed at 14:48 UTC
- **BREAKING CHANGE**: Replaced `variant` prop with boolean props for colors and styles
- Updated examples:
  - Changed `variant="outline"` to `outline` boolean prop
- Added `setup_requirements` section

##### 🔧 dropdown.json - Fixed at 14:48 UTC
- Updated icon names to Heroicons v2:
  - `dots-vertical` → `ellipsis-vertical`
  - `cog` → `cog-6-tooth`
  - `logout` → `arrow-right-on-rectangle`
  - `duplicate` → `document-duplicate`
- Added `setup_requirements` section

##### 🔧 icon.json - Fixed at 14:49 UTC
- Updated all icon examples to Heroicons v2:
  - `menu` → `bars-3`
  - `x` → `x-mark`
  - `duplicate` → `document-duplicate`
  - `exclamation` → `exclamation-triangle`
  - `refresh` → `arrow-path`
  - `loader` → `arrow-path`
- Added `setup_requirements` section

##### 🔧 link.json - Fixed at 14:49 UTC
- **BREAKING CHANGE**: Replaced `variant` prop with boolean color props
- Updated icon names in examples:
  - `external-link` → `arrow-top-right-on-square`
  - `chart-bar` → `chart-bar-square`
- Updated all examples to use boolean prop syntax
- Added `setup_requirements` section

##### ✅ modal.json - Verified at 14:50 UTC
- No changes required (already correct)
- Confirmed setup requirements were properly documented

### Added - 2025-07-25

#### Documentation (14:51 UTC)
- Created `CHANGELOG_FIXES.md` with detailed fix information
- Added this `CHANGELOG.md` for version tracking

### Technical Details

#### Root Cause
Testing revealed that the MCP server specifications were based on outdated WireUI documentation or assumptions. WireUI v2 actually uses:
- Boolean props for colors/variants instead of string enum props
- Heroicons v2 icon naming convention
- Requires Tailwind CSS v3 (v4 is not compatible)

#### Testing Methodology
A comprehensive test harness was built using:
- Laravel 12.21.0
- Livewire 3.6.4
- Alpine.js 3.x
- Tailwind CSS 3.4.5
- WireUI 2.4

This revealed multiple discrepancies between the MCP server specs and actual WireUI v2 implementation.

#### Impact
These fixes ensure that developers using the MCP server will:
- Generate working WireUI components on first attempt
- Avoid debugging prop mismatches
- Use correct Heroicons v2 names
- Understand framework version requirements upfront

### Migration Guide

For users who have already implemented components based on the old specifications:

1. **Update color/variant props**:
   ```blade
   <!-- Old -->
   <x-alert variant="info" />
   <x-badge variant="primary" />
   
   <!-- New -->
   <x-alert info />
   <x-badge primary />
   ```

2. **Update icon names** to Heroicons v2 naming convention

3. **Ensure Tailwind CSS v3** is used (v4 is not compatible with WireUI v2)

---

## Previous Versions

No previous versions documented yet. This represents the first major correction based on real-world testing.
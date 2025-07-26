# WireUI v2 Best Practices & Common Pitfalls

Based on real-world implementation experience with WireUI v2.4.3 and Laravel/Livewire applications.

## 🚨 Critical Issues to Know

### 1. Tailwind CSS Dynamic Classes & Production Builds
**Problem**: WireUI uses dynamic classes that Tailwind doesn't see during build, causing styling to break in production.

**Example of the issue**:
```css
/* These classes get purged in production */
bg-background-white
dark:bg-background-dark
```

**Solution**: Add WireUI paths to your `tailwind.config.js` AND safelist dynamic classes:
```javascript
content: [
    './resources/views/**/*.blade.php',
    './vendor/wireui/wireui/src/**/*.php',
    './vendor/wireui/wireui/ts/**/*.ts',   
],
safelist: [
    // WireUI shadow classes
    'shadow-none',
    'shadow-xs', 
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
    'shadow-inner',
    'hover:shadow-xs',
    'hover:shadow-sm',
    'hover:shadow-md',
    'hover:shadow-lg',
    'hover:shadow-xl',
    'hover:shadow-2xl',
    // Add other dynamic classes as needed
],
```

### 2. Background Colors Causing Blue/Gray Boxes
**Problem**: WireUI's default `background.white` and `background.dark` colors create unwanted wrapper boxes around inputs.

**Solution**: Override in `tailwind.config.js`:
```javascript
theme: {
    extend: {
        colors: {
            background: {
                white: 'transparent',
                dark: 'transparent',
            },
        },
    },
},
```

### 3. Accessibility Issues (As of v2.4.3)
**Problem**: WireUI generates invalid HTML with `name` attributes on `<label>` elements.

**Current Status**: PR submitted (#1087). Causes console warnings but doesn't break functionality.

**Temporary workaround**: None recommended - wait for official fix rather than patching vendor files.

## ✅ Styling Best Practices

### 1. Configure WireUI Properly, Don't Fight It
**DON'T**: Add complex CSS overrides trying to fix styling issues
```css
/* BAD - Fighting against WireUI */
.wireui-select-option > div > label > button {
    border: 1px solid #ccc !important;
}
```

**DO**: Use Tailwind configuration to customize WireUI
```javascript
// tailwind.config.js
theme: {
    extend: {
        colors: {
            primary: colors.blue,
            // Customize other WireUI colors
        }
    }
}
```

### 2. Target the Right Elements
WireUI components have complex nested structures. Understanding the DOM is crucial.

**Example - Select Component Structure**:
```html
<div> <!-- Wrapper -->
    <label> <!-- Container with background -->
        <button> <!-- The actual dropdown trigger -->
            <span>Selected Value</span>
        </button>
    </label>
</div>
```

**CSS Targeting**:
```css
/* Target the button inside the label for dropdowns */
[x-data*="wireui:select"] button {
    @apply pl-3 pr-10; /* Fix padding */
}
```

### 3. Use Tailwind @apply for Consistency
**DON'T**: Use inline styles or raw CSS
```css
/* BAD */
input { color: #111827; }
```

**DO**: Use Tailwind utilities
```css
/* GOOD */
input { @apply text-gray-900; }
```

## 📋 Component-Specific Tips

### Select/Dropdown Components
- The visible element is a `<button>` inside a `<label>`
- Text alignment issues? Target the button, not the wrapper
- Border issues? The border is on the label element

### DateTime Picker
- Icons spacing issues are common
- Target specific elements: `svg.mr-2` for clear button, `button.px-4` for calendar button
- The actual input is hidden - the visible input is for display only

### Radio Buttons
- Always provide both `id` and `name` attributes
- Group related radios with the same `name`
- WireUI radio labels can have color issues - may need explicit text color classes

## 🎨 Color & Theme Customization

### Input Text Colors
By default, input text might appear gray. Fix globally:
```css
@layer components {
    input[type="text"],
    input[type="email"],
    /* ... other types ... */
    textarea {
        @apply text-gray-900;
    }
}
```

### Dark Mode Considerations
WireUI supports dark mode. Always test both modes:
```css
/* Light mode fix */
.some-class { @apply text-gray-900; }

/* Don't forget dark mode */
.some-class { @apply dark:text-gray-100; }
```

## 🛠️ Debugging Tips

### 1. Production vs Development Differences
**Always check**:
- Run `npm run build` locally
- Check if classes exist in compiled CSS
- Look for dynamic class generation
- Clear all caches: `php artisan cache:clear`

### 2. Browser DevTools
- Inspect the actual DOM structure
- WireUI components often have multiple nested elements
- The element you see might not be the one with the styling

### 3. Common Console Errors
- "Incorrect use of `<label for=FORM_ELEMENT>`" - Known WireUI bug
- Alpine.js errors - Usually initialization timing issues

## 🚀 Performance Considerations

### 1. Minimize Custom CSS
Each CSS override adds to your bundle size and specificity wars.

### 2. Use WireUI's Built-in Props
Instead of custom styling, use component props:
```blade
{{-- Good - Use built-in props --}}
<x-button primary lg icon="check" />

{{-- Bad - Custom CSS for standard variants --}}
<x-button class="bg-blue-600 text-white px-6 py-3" />
```

## 📝 Form Building Guidelines

### 1. Consistent Structure
```blade
<div>
    <label for="field_name" class="block text-sm font-medium text-gray-700 mb-1">
        Field Label <span class="text-red-500">*</span>
    </label>
    <x-input id="field_name" wire:model.defer="field_name" />
    @error('field_name')
        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
    @enderror
</div>
```

### 2. Accessibility
- Always include `id` attributes
- Match `label[for]` with input `id`
- Use semantic HTML
- Include aria-labels for complex components

## ⚠️ Known Issues & Workarounds

### Issue: Double Borders on Inputs
**Cause**: Both wrapper and input have borders
**Fix**: Remove inner borders, keep wrapper borders

### Issue: Dropdown Text Alignment
**Cause**: Missing padding on button element
**Fix**: Target button inside select component

### Issue: Date Picker Icon Spacing
**Cause**: Default margin/padding too large
**Fix**: Reduce padding on specific buttons

## 🔄 Migration Notes

### From Raw HTML to WireUI
- WireUI components are more complex than native inputs
- Plan for styling adjustments
- Test thoroughly in production builds
- Consider accessibility from the start

### Version Compatibility
- WireUI v2 requires Tailwind CSS v3 (not v4!)
- Livewire v3 required
- Alpine.js v3 required
- Check all dependency versions

## 📚 Resources

- [WireUI Documentation](https://wireui.dev)
- [WireUI GitHub Issues](https://github.com/wireui/wireui/issues)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Livewire Documentation](https://livewire.laravel.com)

## 🤝 Contributing Back

Found a bug? 
1. Check existing issues first
2. Create minimal reproduction
3. Submit detailed issue report
4. Consider submitting a PR

Remember: WireUI is open source. Contributing fixes helps everyone!
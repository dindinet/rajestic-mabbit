# Hugo Responsive Section Background with CSS Bundling - Complete Guide

This document contains the complete conversation and implementation for creating a comprehensive Hugo partial system with dynamic CSS generation, theme configuration, and plugin-like architecture.

## Overview

We enhanced a Hugo partial for responsive section backgrounds to support:
- Background images (original functionality)
- Solid background colors
- Linear and radial gradients
- Dynamic CSS generation and bundling
- Theme configuration via data files
- CSS custom properties for design tokens
- Plugin-like partial ecosystem

## 1. Enhanced Responsive Section Background Partial

**File: `layouts/partials/responsive-section-bg.html`**

```html
{{/* 
  Enhanced Responsive Section Background Partial with CSS Bundle Integration
  
  This version collects CSS rules and integrates with your CSS bundle instead of inline styles
  
  Usage remains the same:
  {{ partial "responsive-section-bg.html" (dict 
    "class" "section bg-blue section--padding"
    "bgColor" "#ff6b6b"
  ) }}
*/}}

{{- $src := .src -}}
{{- $class := .class | default "section" -}}
{{- $containerWidth := .containerWidth | default 100 -}}
{{- $opacity := .opacity | default 1 -}}
{{- $bgSize := .bgSize | default "cover" -}}
{{- $bgRepeat := .bgRepeat | default "no-repeat" -}}
{{- $bgPosition := .bgPosition | default "center" -}}
{{- $bgColor := .bgColor -}}
{{- $linearGradient := .linearGradient -}}
{{- $radialGradient := .radialGradient -}}

{{/* Generate unique class name for styling */}}
{{- $uniqueClass := "" -}}
{{- if $src -}}
  {{- $uniqueClass = printf "section-bg-%s" (substr (md5 $src) 0 8) -}}
{{- else if $bgColor -}}
  {{- $uniqueClass = printf "section-bg-%s" (substr (md5 $bgColor) 0 8) -}}
{{- else if $linearGradient -}}
  {{- $gradientString := printf "%v" $linearGradient -}}
  {{- $uniqueClass = printf "section-bg-%s" (substr (md5 $gradientString) 0 8) -}}
{{- else if $radialGradient -}}
  {{- $gradientString := printf "%v" $radialGradient -}}
  {{- $uniqueClass = printf "section-bg-%s" (substr (md5 $gradientString) 0 8) -}}
{{- else -}}
  {{- $uniqueClass = printf "section-bg-%s" (substr (md5 (string now.Unix)) 0 8) -}}
{{- end -}}

{{/* Generate CSS rule instead of inline styles */}}
{{- $cssRule := "" -}}

{{/* Handle solid color background */}}
{{- if $bgColor -}}
  {{- $cssRule = printf ".%s { background-color: %s; position: relative; }" $uniqueClass $bgColor -}}

{{/* Handle linear gradient background */}}
{{- else if $linearGradient -}}
  {{- $angle := $linearGradient.angle | default "to bottom" -}}
  {{- $from := $linearGradient.from -}}
  {{- $to := $linearGradient.to -}}
  {{- $stops := $linearGradient.stops -}}
  
  {{- $gradientValue := "" -}}
  {{- if $stops -}}
    {{/* Handle multiple stops */}}
    {{- $stopStrings := slice -}}
    {{- range $stops -}}
      {{- $stopString := .color -}}
      {{- if .position -}}
        {{- $stopString = printf "%s %s" .color .position -}}
      {{- end -}}
      {{- $stopStrings = $stopStrings | append $stopString -}}
    {{- end -}}
    {{- $gradientValue = printf "linear-gradient(%s, %s)" $angle (delimit $stopStrings ", ") -}}
  {{- else if and $from $to -}}
    {{/* Handle simple from/to gradient */}}
    {{- $gradientValue = printf "linear-gradient(%s, %s, %s)" $angle $from $to -}}
  {{- else -}}
    {{/* Fallback to transparent */}}
    {{- $gradientValue = "linear-gradient(to bottom, transparent, transparent)" -}}
  {{- end -}}
  
  {{- $cssRule = printf ".%s { background: %s; position: relative; }" $uniqueClass $gradientValue -}}

{{/* Handle radial gradient background */}}
{{- else if $radialGradient -}}
  {{- $shape := $radialGradient.shape | default "ellipse" -}}
  {{- $position := $radialGradient.position | default "center" -}}
  {{- $from := $radialGradient.from -}}
  {{- $to := $radialGradient.to -}}
  {{- $stops := $radialGradient.stops -}}
  
  {{- $gradientValue := "" -}}
  {{- if $stops -}}
    {{/* Handle multiple stops */}}
    {{- $stopStrings := slice -}}
    {{- range $stops -}}
      {{- $stopString := .color -}}
      {{- if .position -}}
        {{- $stopString = printf "%s %s" .color .position -}}
      {{- end -}}
      {{- $stopStrings = $stopStrings | append $stopString -}}
    {{- end -}}
    {{- $gradientValue = printf "radial-gradient(%s at %s, %s)" $shape $position (delimit $stopStrings ", ") -}}
  {{- else if and $from $to -}}
    {{/* Handle simple from/to gradient */}}
    {{- $gradientValue = printf "radial-gradient(%s at %s, %s, %s)" $shape $position $from $to -}}
  {{- else -}}
    {{/* Fallback to transparent */}}
    {{- $gradientValue = "radial-gradient(circle at center, transparent, transparent)" -}}
  {{- end -}}
  
  {{- $cssRule = printf ".%s { background: %s; position: relative; }" $uniqueClass $gradientValue -}}

{{/* Handle image background (original functionality with CSS generation) */}}
{{- else if $src -}}
  {{/* Check if image is SVG */}}
  {{- $isSVG := eq (path.Ext $src) ".svg" -}}
  {{/* Check if image is remote */}}
  {{- $isRemote := or (hasPrefix $src "http://") (hasPrefix $src "https://") -}}

  {{/* Handle SVG case - use original image */}}
  {{- if $isSVG -}}
    {{- $cssRule = printf ".%s { background-image: url('%s'); background-size: %s; background-repeat: %s; background-position: %s; position: relative; } .%s picture { /* Allow picture to flow normally with content */ } .%s picture img { width: 100%%; height: auto; }" $uniqueClass $src $bgSize $bgRepeat $bgPosition $uniqueClass $uniqueClass -}}
  {{- else -}}
    {{/* Get the image resource */}}
    {{- $image := "" -}}
    {{- if $isRemote -}}
      {{- $tryResult := try (resources.GetRemote $src) -}}
      {{- if $tryResult -}}
        {{- $image = $tryResult.Value -}}
      {{- else -}}
        {{/* Fallback if remote image fails to load */}}
        {{- $cssRule = printf ".%s { background-image: url('%s'); background-size: %s; background-repeat: %s; background-position: %s; position: relative; } .%s picture { /* Allow picture to flow normally with content */ } .%s picture img { width: 100%%; height: auto; }" $uniqueClass $src $bgSize $bgRepeat $bgPosition $uniqueClass $uniqueClass -}}
      {{- end -}}
    {{- else -}}
      {{- $image = resources.Get $src -}}
    {{- end -}}

    {{- if $image -}}
      {{/* Calculate container width for optimal background image size */}}
      {{- $getContainerWidth := "" -}}
      {{- if reflect.IsMap $containerWidth -}}
        {{- $getContainerWidth = $containerWidth -}}
      {{- else -}}
        {{- $getContainerWidth = dict "desktop" $containerWidth "tablet" $containerWidth "mobile" $containerWidth -}}
      {{- end -}}

      {{/* Get container widths with defaults */}}
      {{- $desktopWidth := index $getContainerWidth "desktop" | default 100 -}}
      {{- $tabletWidth := index $getContainerWidth "tablet" | default 100 -}}
      {{- $mobileWidth := index $getContainerWidth "mobile" | default 100 -}}

      {{/* Calculate optimal image size for background (use largest needed size) */}}
      {{- $desktopSize := div (mul 1200 $desktopWidth) 100 -}}
      {{- $tabletSize := div (mul 900 $tabletWidth) 100 -}}
      {{- $mobileSize := div (mul 600 $mobileWidth) 100 -}}
      
      {{/* Use the largest size needed for the background image */}}
      {{- $maxSize := $desktopSize -}}
      {{- if gt $tabletSize $maxSize -}}{{ $maxSize = $tabletSize }}{{- end -}}
      {{- if gt $mobileSize $maxSize -}}{{ $maxSize = $mobileSize }}{{- end -}}
      
      {{/* Generate optimized background image with opacity filter */}}
      {{- $bgImage := $image.Resize (printf "%dx" $maxSize) -}}
      {{- if ne $opacity 1 -}}
          {{- $bgImage = $bgImage.Filter (images.Opacity $opacity) -}}
      {{- end -}}
      
      {{- $cssRule = printf ".%s { background-image: url('%s'); background-size: %s; background-repeat: %s; background-position: %s; position: relative; } .%s picture { /* Allow picture to flow normally with content */ } .%s picture img { width: 100%%; height: auto; }" $uniqueClass $bgImage.RelPermalink $bgSize $bgRepeat $bgPosition $uniqueClass $uniqueClass -}}
    {{- else -}}
      {{/* Fallback if image resource not found */}}
      {{- $cssRule = printf ".%s { background-image: url('%s'); background-size: %s; background-repeat: %s; background-position: %s; position: relative; } .%s picture { /* Allow picture to flow normally with content */ } .%s picture img { width: 100%%; height: auto; }" $uniqueClass $src $bgSize $bgRepeat $bgPosition $uniqueClass $uniqueClass -}}
    {{- end -}}
  {{- end -}}
{{- end -}}

{{/* Add CSS rule to site-wide collection for bundling */}}
{{- if $cssRule -}}
  {{/* Use site store with naming convention: css_collection_{partial_name} */}}
  {{- .Site.Store.SetInMap "css_collection_section_bg" $uniqueClass $cssRule -}}
{{- end -}}

{{/* Output section tag with class (no inline styles) */}}
{{- if $src -}}
  <section class="{{ $class }} {{ $uniqueClass }}">
{{- else if or $bgColor $linearGradient $radialGradient -}}
  <section class="{{ $class }} {{ $uniqueClass }}">
{{- else -}}
  <section class="{{ $class }}">
{{- end -}}
```

## 2. Universal CSS Collection System

**File: `layouts/partials/universal-css-collector.html`**

```html
{{/* 
  Universal CSS Collection System for baseof.html <head>
  
  This automatically discovers and bundles CSS from all partials that follow
  the naming convention: css_collection_{partial_name}
  
  Add this to your baseof.html in the <head> section
*/}}

{{/* Get all site store keys and find CSS collections */}}
{{- $allStoreData := .Site.Store -}}
{{- $cssCollections := slice -}}
{{- $dynamicCSSContent := "" -}}

{{/* Loop through all site store data to find CSS collections */}}
{{- range $key, $value := $allStoreData -}}
  {{- if hasPrefix $key "css_collection_" -}}
    {{/* Extract partial name from key */}}
    {{- $partialName := strings.TrimPrefix $key "css_collection_" -}}
    
    {{/* Add comment header for this partial's CSS */}}
    {{- $dynamicCSSContent = printf "%s\n/* === CSS from %s partial === */" $dynamicCSSContent $partialName -}}
    
    {{/* Add all CSS rules from this collection */}}
    {{- range $class, $rule := $value -}}
      {{- $dynamicCSSContent = printf "%s\n%s" $dynamicCSSContent $rule -}}
    {{- end -}}
    
    {{- $dynamicCSSContent = printf "%s\n" $dynamicCSSContent -}}
  {{- end -}}
{{- end -}}

{{/* Create dynamic CSS resource if we have any CSS */}}
{{- $dynamicCSS := "" -}}
{{- if ne (strings.TrimSpace $dynamicCSSContent) "" -}}
  {{- $dynamicCSS = resources.FromString "css/partials-generated.css" $dynamicCSSContent -}}
{{- end -}}

{{/* Bundle all CSS files - include variables.css first */}}
{{- $css := resources.Get "css/variables.css" | slice -}}
{{- $additionalCSS := resources.Match "css/*.css" -}}
{{- range $additionalCSS -}}
  {{- if ne .Name "css/variables.css" -}}
    {{- $css = $css | append . -}}
  {{- end -}}
{{- end -}}

{{/* Add dynamic CSS to the bundle if it exists */}}
{{- if $dynamicCSS -}}
  {{- $css = $css | append $dynamicCSS -}}
{{- end -}}

{{/* Concatenate and output final bundle */}}
{{- if $css -}}
  {{- $css = $css | resources.Concat "styles.css" -}}
  {{- if hugo.IsProduction -}}
    {{- $css = $css | resources.Minify -}}
  {{- end -}}
  <link rel="stylesheet" href="{{ $css.RelPermalink }}">
{{- end -}}

{{/* Optional: Debug output in development */}}
{{- if hugo.IsDevelopment -}}
  {{- if $dynamicCSS -}}
    <!-- Dynamic CSS collections found and bundled -->
    {{- range $key, $value := $allStoreData -}}
      {{- if hasPrefix $key "css_collection_" -}}
        <!-- {{ strings.TrimPrefix $key "css_collection_" }}: {{ len $value }} rules -->
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
```

## 3. Theme Configuration Data File

**File: `data/theme.yaml`**

```yaml
# Theme Configuration
# This file controls site-wide design tokens that can be edited via DecapCMS

layout:
  # Content width options: narrow, medium, wide, full
  content_width: "medium"
  
  # Section spacing (vertical gaps between sections)
  section_spacing: "2rem"
  section_spacing_large: "4rem"
  
  # Container max-widths
  container_narrow: "768px"
  container_medium: "1024px"
  container_wide: "1200px"
  container_full: "100%"
  
  # Grid and layout
  grid_gap: "1rem"
  grid_gap_large: "2rem"

colors:
  # Brand colors
  primary: "#3B82F6"
  secondary: "#8B5CF6"
  accent: "#F59E0B"
  
  # Neutral colors
  text_primary: "#1F2937"
  text_secondary: "#6B7280"
  text_muted: "#9CA3AF"
  
  # Background colors
  bg_primary: "#FFFFFF"
  bg_secondary: "#F9FAFB"
  bg_tertiary: "#F3F4F6"
  
  # Border colors
  border_light: "#E5E7EB"
  border_medium: "#D1D5DB"
  border_dark: "#9CA3AF"

typography:
  # Font families
  font_primary: "'Inter', system-ui, -apple-system, sans-serif"
  font_secondary: "'Merriweather', Georgia, serif"
  font_mono: "'JetBrains Mono', 'Fira Code', monospace"
  
  # Font sizes (using fluid typography)
  text_xs: "0.75rem"
  text_sm: "0.875rem"
  text_base: "1rem"
  text_lg: "1.125rem"
  text_xl: "1.25rem"
  text_2xl: "1.5rem"
  text_3xl: "1.875rem"
  text_4xl: "2.25rem"
  text_5xl: "3rem"
  
  # Line heights
  leading_tight: "1.25"
  leading_normal: "1.5"
  leading_relaxed: "1.75"
  
  # Font weights
  font_light: "300"
  font_normal: "400"
  font_medium: "500"
  font_semibold: "600"
  font_bold: "700"

spacing:
  # Spacing scale
  space_xs: "0.25rem"
  space_sm: "0.5rem"
  space_md: "1rem"
  space_lg: "1.5rem"
  space_xl: "2rem"
  space_2xl: "3rem"
  space_3xl: "4rem"
  
  # Component specific spacing
  button_padding_x: "1rem"
  button_padding_y: "0.5rem"
  card_padding: "1.5rem"
  section_padding_y: "3rem"

borders:
  # Border radius
  radius_sm: "0.125rem"
  radius_md: "0.375rem"
  radius_lg: "0.5rem"
  radius_xl: "0.75rem"
  radius_full: "9999px"
  
  # Border widths
  border_width: "1px"
  border_width_thick: "2px"

shadows:
  # Box shadows
  shadow_sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  shadow_md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  shadow_lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  shadow_xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"

animation:
  # Transition durations
  duration_fast: "150ms"
  duration_normal: "300ms"
  duration_slow: "500ms"
  
  # Easing functions
  ease_in: "ease-in"
  ease_out: "ease-out"
  ease_in_out: "ease-in-out"
```

## 4. CSS Custom Properties Foundation

**File: `assets/css/variables.css`**

```css
/* 
  CSS Custom Properties Foundation
  
  These are the default values that can be overridden by the theme data file.
  All partials should use these custom properties instead of hard-coded values.
*/

:root {
  /* Layout Variables */
  --content-width: medium;
  --section-spacing: 2rem;
  --section-spacing-large: 4rem;
  
  /* Container Widths */
  --container-narrow: 768px;
  --container-medium: 1024px;
  --container-wide: 1200px;
  --container-full: 100%;
  
  /* Active Container (set based on --content-width) */
  --container-active: var(--container-medium);
  
  /* Grid */
  --grid-gap: 1rem;
  --grid-gap-large: 2rem;
  
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-accent: #F59E0B;
  
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;
  --border-dark: #9CA3AF;
  
  /* Typography */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-secondary: 'Merriweather', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  
  /* Component Spacing */
  --button-padding-x: 1rem;
  --button-padding-y: 0.5rem;
  --card-padding: 1.5rem;
  --section-padding-y: 3rem;
  
  /* Borders */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  --border-width: 1px;
  --border-width-thick: 2px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --ease-in: ease-in;
  --ease-out: ease-out;
  --ease-in-out: ease-in-out;
}

/* Container Width Logic */
:root[data-content-width="narrow"] {
  --container-active: var(--container-narrow);
}

:root[data-content-width="medium"] {
  --container-active: var(--container-medium);
}

:root[data-content-width="wide"] {
  --container-active: var(--container-wide);
}

:root[data-content-width="full"] {
  --container-active: var(--container-full);
}

/* Base Container Class */
.container {
  width: 100%;
  max-width: var(--container-active);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}

/* Section Spacing Utilities */
.section {
  padding-top: var(--section-padding-y);
  padding-bottom: var(--section-padding-y);
}

.section--spacing {
  margin-bottom: var(--section-spacing);
}

.section--spacing-large {
  margin-bottom: var(--section-spacing-large);
}
```

## 5. Theme Override Generator

**File: `layouts/partials/theme-override-generator.html`**

```html
{{/* 
  Theme Override Generator
  
  Add this to baseof.html AFTER your main CSS link but BEFORE closing </head>
  This generates inline CSS overrides from your data/theme.yaml file
*/}}

{{/* Load theme configuration */}}
{{- $theme := site.Data.theme -}}

{{/* Generate CSS custom property overrides */}}
{{- $overrideCSS := "" -}}

{{/* Layout overrides */}}
{{- if $theme.layout -}}
  {{- with $theme.layout.content_width -}}
    {{- $overrideCSS = printf "%s\n  --content-width: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.section_spacing -}}
    {{- $overrideCSS = printf "%s\n  --section-spacing: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.section_spacing_large -}}
    {{- $overrideCSS = printf "%s\n  --section-spacing-large: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.container_narrow -}}
    {{- $overrideCSS = printf "%s\n  --container-narrow: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.container_medium -}}
    {{- $overrideCSS = printf "%s\n  --container-medium: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.container_wide -}}
    {{- $overrideCSS = printf "%s\n  --container-wide: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.container_full -}}
    {{- $overrideCSS = printf "%s\n  --container-full: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.grid_gap -}}
    {{- $overrideCSS = printf "%s\n  --grid-gap: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.layout.grid_gap_large -}}
    {{- $overrideCSS = printf "%s\n  --grid-gap-large: %s;" $overrideCSS . -}}
  {{- end -}}
{{- end -}}

{{/* Color overrides */}}
{{- if $theme.colors -}}
  {{- with $theme.colors.primary -}}
    {{- $overrideCSS = printf "%s\n  --color-primary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.secondary -}}
    {{- $overrideCSS = printf "%s\n  --color-secondary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.accent -}}
    {{- $overrideCSS = printf "%s\n  --color-accent: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.text_primary -}}
    {{- $overrideCSS = printf "%s\n  --text-primary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.text_secondary -}}
    {{- $overrideCSS = printf "%s\n  --text-secondary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.text_muted -}}
    {{- $overrideCSS = printf "%s\n  --text-muted: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.bg_primary -}}
    {{- $overrideCSS = printf "%s\n  --bg-primary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.bg_secondary -}}
    {{- $overrideCSS = printf "%s\n  --bg-secondary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.bg_tertiary -}}
    {{- $overrideCSS = printf "%s\n  --bg-tertiary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.border_light -}}
    {{- $overrideCSS = printf "%s\n  --border-light: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.border_medium -}}
    {{- $overrideCSS = printf "%s\n  --border-medium: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.colors.border_dark -}}
    {{- $overrideCSS = printf "%s\n  --border-dark: %s;" $overrideCSS . -}}
  {{- end -}}
{{- end -}}

{{/* Typography overrides */}}
{{- if $theme.typography -}}
  {{- with $theme.typography.font_primary -}}
    {{- $overrideCSS = printf "%s\n  --font-primary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.typography.font_secondary -}}
    {{- $overrideCSS = printf "%s\n  --font-secondary: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- with $theme.typography.font_mono -}}
    {{- $overrideCSS = printf "%s\n  --font-mono: %s;" $overrideCSS . -}}
  {{- end -}}
  {{- range $key, $value := $theme.typography -}}
    {{- if hasPrefix $key "text_" -}}
      {{- $cssVar := replace $key "_" "-" -}}
      {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
    {{- end -}}
    {{- if hasPrefix $key "leading_" -}}
      {{- $cssVar := replace $key "_" "-" -}}
      {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
    {{- end -}}
    {{- if hasPrefix $key "font_" -}}
      {{- $cssVar := replace $key "_" "-" -}}
      {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
    {{- end -}}
  {{- end -}}
{{- end -}}

{{/* Spacing overrides */}}
{{- if $theme.spacing -}}
  {{- range $key, $value := $theme.spacing -}}
    {{- $cssVar := replace $key "_" "-" -}}
    {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
  {{- end -}}
{{- end -}}

{{/* Borders overrides */}}
{{- if $theme.borders -}}
  {{- range $key, $value := $theme.borders -}}
    {{- $cssVar := replace $key "_" "-" -}}
    {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
  {{- end -}}
{{- end -}}

{{/* Shadows overrides */}}
{{- if $theme.shadows -}}
  {{- range $key, $value := $theme.shadows -}}
    {{- $cssVar := replace $key "_" "-" -}}
    {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
  {{- end -}}
{{- end -}}

{{/* Animation overrides */}}
{{- if $theme.animation -}}
  {{- range $key, $value := $theme.animation -}}
    {{- $cssVar := replace $key "_" "-" -}}
    {{- $overrideCSS = printf "%s\n  --%s: %s;" $overrideCSS $cssVar $value -}}
  {{- end -}}
{{- end -}}

{{/* Output inline CSS overrides if we have any */}}
{{- if ne (strings.TrimSpace $overrideCSS) "" -}}
<style>
:root {{ "{" }}{{ $overrideCSS | safeCSS }}
{{- if $theme.layout.content_width -}}
  --container-active: var(--container-{{ $theme.layout.content_width }});
{{- end -}}
{{ "}" }}
</style>
{{- end -}}
```

## 6. Complete baseof.html Structure

**File: `layouts/_default/baseof.html`**

```html
<!DOCTYPE html>
<html lang="{{ site.Language.Lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ if not .IsHome }}{{ .Title }} | {{ end }}{{ site.Title }}</title>
  
  <!-- Universal CSS Bundle (includes variables.css first, then partials-generated.css) -->
  {{ partial "universal-css-collector.html" . }}
  
  <!-- Theme Overrides (inline styles that override the variables) -->
  {{ partial "theme-override-generator.html" . }}
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

## 7. Usage Examples

### Basic Background Color

```html
{{ partial "responsive-section-bg.html" (dict 
  "class" "section hero"
  "bgColor" "#ff6b6b"
) }}
  <div class="container">
    <h1>Hero Section</h1>
  </div>
</section>
```

### Linear Gradient (Simple)

```html
{{ partial "responsive-section-bg.html" (dict 
  "class" "section cta"
  "linearGradient" (dict "angle" "45deg" "from" "#ff6b6b" "to" "#4ecdc4")
) }}
  <div class="container">
    <h2>Call to Action</h2>
  </div>
</section>
```

### Linear Gradient (Multiple Stops)

```html
{{ partial "responsive-section-bg.html" (dict 
  "class" "section features"
  "linearGradient" (dict 
    "angle" "135deg" 
    "stops" (slice 
      (dict "color" "#667eea" "position" "0%")
      (dict "color" "#764ba2" "position" "50%")
      (dict "color" "#f093fb" "position" "100%")
    )
  )
) }}
  <div class="container">
    <h2>Features Section</h2>
  </div>
</section>
```

### Radial Gradient

```html
{{ partial "responsive-section-bg.html" (dict 
  "class" "section testimonials"
  "radialGradient" (dict 
    "shape" "circle" 
    "position" "center"
    "from" "#ff6b6b" 
    "to" "#4ecdc4"
  )
) }}
  <div class="container">
    <h2>Testimonials</h2>
  </div>
</section>
```

### Background Image (Original Functionality)

```html
{{ partial "responsive-section-bg.html" (dict 
  "src" "images/hero-bg.jpg"
  "class" "section hero"
  "opacity" 0.8
  "bgSize" "cover"
  "bgPosition" "center center"
) }}
  <div class="container">
    <h1>Hero with Background Image</h1>
  </div>
</section>
```

## 8. Plugin Ecosystem Pattern

### Example: How Other Partials Would Follow the Pattern

**Responsive Image Partial:**
```html
{{/* Generate CSS for responsive image */}}
{{- $cssRule = printf ".responsive-img-%s { /* styles */ }" $uniqueClass -}}
{{- .Site.Store.SetInMap "css_collection_responsive_image" $uniqueClass $cssRule -}}
```

**Card Partial:**
```html
{{/* Generate CSS for card component */}}
{{- $cssRule = printf ".card-%s { background: var(--bg-secondary); padding: var(--card-padding); border-radius: var(--radius-lg); }" $uniqueClass -}}
{{- .Site.Store.SetInMap "css_collection_card" $uniqueClass $cssRule -}}
```

**Button Partial:**
```html
{{/* Generate CSS for button styles */}}
{{- $cssRule = printf ".btn-%s { background: var(--color-primary); color: white; padding: var(--button-padding-y) var(--button-padding-x); border-radius: var(--radius-md); }" $uniqueClass -}}
{{- .Site.Store.SetInMap "css_collection_button" $uniqueClass $cssRule -}}
```

## 9. Key Architectural Benefits

### CSS Bundling System
- ✅ **Zero Configuration**: New partials automatically get their CSS bundled
- ✅ **Namespace Isolation**: Each partial's CSS is clearly separated
- ✅ **Debug Friendly**: Development mode shows which partials contributed CSS
- ✅ **Performance**: Single CSS file with all dynamic styles
- ✅ **Plugin Ecosystem**: Developers can create partials without touching baseof.html

### Theme Configuration System
- ✅ **DecapCMS Compatible**: Easy to expose theme.yaml for editing
- ✅ **Design Tokens**: Centralized design system
- ✅ **CSS Custom Properties**: Modern, performant theming
- ✅ **Override Certainty**: Inline styles ensure overrides work
- ✅ **Server-side Rendering**: No client-side JavaScript required

### Naming Conventions
- ✅ **Consistent Pattern**: `css_collection_{partial_name}` for CSS storage
- ✅ **Automatic Discovery**: System automatically finds and bundles CSS
- ✅ **Scalable**: Unlimited partials can participate in the system

## 10. Generated CSS Output Example

The final bundled CSS will look like this:

```css
/* From variables.css */
:root {
  --color-primary: #3B82F6;
  --container-medium: 1024px;
  /* ... all other variables */
}

/* From partials-generated.css */
/* === CSS from section_bg partial === */
.section-bg-a1b2c3d4 { background-color: #ff6b6b; position: relative; }
.section-bg-e5f6g7h8 { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); position: relative; }

/* === CSS from responsive_image partial === */
.responsive-img-x9y8z7w6 { /* responsive image styles */ }

/* === CSS from card partial === */
.card-m5n4o3p2 { background: var(--bg-secondary); padding: var(--card-padding); }
```

Plus inline overrides from theme.yaml:

```html
<style>
:root {
  --color-primary: #FF5722;
  --container-active: var(--container-wide);
}
</style>
```

## 11. Error Resolution

### ZgotmplZ Error Fix

The original error occurred because Hugo's template security was blocking CSS generation. The fix was to escape CSS braces in the template:

**Problem:**
```html
:root {{{ $overrideCSS | safeCSS }}
```

**Solution:**
```html
:root {{ "{" }}{{ $overrideCSS | safeCSS }}{{ "}" }}
```

This prevents Hugo from interpreting CSS braces as template syntax while still generating valid CSS.

## 12. Future Enhancements

### Potential Additions
1. **Render Hooks**: Automatic processing of markdown images through responsive image partial
2. **Build Hooks**: Custom asset processing pipeline
3. **CSS Optimization**: Advanced minification and purging
4. **Dark Mode**: Theme variants in the data configuration
5. **Breakpoint System**: Responsive design tokens
6. **Component Library**: Pre-built partial ecosystem

### DecapCMS Integration

The `data/theme.yaml` file can be easily exposed through DecapCMS for visual editing:

```yaml
# In admin/config.yml
collections:
  - name: "theme"
    label: "Theme Settings"
    files:
      - name: "theme"
        label: "Theme Configuration"
        file: "data/theme.yaml"
        fields:
          - label: "Layout"
            name: "layout"
            widget: "object"
            fields:
              - {label: "Content Width", name: "content_width", widget: "select", options: ["narrow", "medium", "wide", "full"]}
              - {label: "Section Spacing", name: "section_spacing", widget: "string"}
          - label: "Colors"
            name: "colors"
            widget: "object"
            fields:
              - {label: "Primary Color", name: "primary", widget: "color"}
              - {label: "Secondary Color", name: "secondary", widget: "color"}
```

This creates a complete, scalable, plugin-ready Hugo theme system with modern CSS practices and zero client-side JavaScript dependencies.
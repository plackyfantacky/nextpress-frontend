# Project Structure Overview

This project is composed of two major parts:

- **Next.js Application** — Handles routing, data fetching from WordPress via GraphQL, and page-level rendering.
- **Block Renderer Engine** — A self-contained React-based rendering system that processes and displays WordPress blocks using consistent, injected logic.

---

## 🧩 Next.js Application

## 📁 /src

### ── 📁 /src/app/
**Purpose:** Entry points for each route (e.g., `[slug]`, `page.jsx`).

- `layout.jsx` — Root layout file. Used by all every page in the website.
- `page.jsx` — Homepage page renderer, uses block data from GraphQL.
- `global.css` - Main stylesheet using Tailwind CSS (^4.1.10).
- `safelist.css` - A generated file of CSS classnames extracted from block data to force Tailwind to output styles. Solves the issue of dynmic classnames.

#### ── 📁 /src/app/[page]/
**Purpose:** Handles all 'page' post-type routes/urls without any specific folder prefix (e.g https://example.site/page-name-goes-here).

- `page.js` - 'Dynamic page renderer. Uses URL slug to fetch page metadata (e.g title, featured image url) and block data.

### ── 📁 /src/partials/
**Purpose:** Templates and partials for website sections

- `Footer.jsx` - website footer
- `Header.jsx` - website header
- `Logo.jsx` - SVG logo as a React component; used by Header.jsx.
- `LogoMono.jsx` - SVG logo as a React component; used by Footer.jsx.
- `SocialIcons.jsx` - composite component with multiple SVG logos; used by Footer.jsx.

---

## 🧩 Block Renderer Engine

## 📁 /src

### ── 📁 /src/lib/
**Purpose:** Shared utilities for data fetching, sanitizing, formatting, etc.

- `api.js` — Fetches JSON data from endpoints.
- `attributes.js` — Processes camalCase attribute strings into kebab-case Tailwind compatible classnames.
- `parser.jsx` — Parses and renders inline HTML content (not block HTML).
- `performance.js` — Utility to track page render times.
- `styler.js`- Convert WordPress style classnames to Tailwind 4.1 style classnames.
- `utils.js` - Various utility functions including markup manipulation.

#### ── 📁 /src/lib/blocks/
**Purpose:** Houses block handler files for each WP block type.

- `blockCode.jsx` - Renders code/code blocks; code content highlighted using Highlight.js
- `blockColumns.jsx`, `blockColumn.jsx` — Handle column structures, pass down layout via `inheritedProps`.
- `blockCover.jsx` — Renders core/cover blocks; handles dynamic tag, background image, color classes, inner blocks.
- `blockDetails.jsx` - Renders core/details blocks; handles details/summary and nested block handling. 
- `blockGroup.jsx` — Handles core/group blocks; supports layout contexts (stack, row, grid). Warning: Very complex.
- `blockHeading.jsx` - Handles core/heading blocks; outputs HTML H1-H6 tags and renders inline HTML.
- `blockImage.jsx` - Handles core/image blocks; optionally renders with a `<figure>` tag.
- `blockList.jsx`, `blockListItem.jsx` - 'Handles list blocks and list items (ordered/unordered), passes down level data via `inheritedProps`.  
- `blockMediaText.jsx` — Supports media alignment, figure output, etc.
- `blockParagraph.jsx` - Renders a pargraph block; also renders inline HTML.
- `blockPostTitle.jsx` - The first WP specific data block. Renders the current post/page title like a heading, using `postContext`.
- `blockPreformatted.jsx` - Renders a block containing `<pre>`formatted text.
- `blockPullquote.jsx` - Renders core/pullquote blocks; supports nested blocks and inline HTML.
- `blockQuote.jsx` - Renders core/quote blocks; renders as `<blockquote>`, optionally with a `<figure>` tag.
- `blockTable.jsx` - Renders core/table blocks; supports inline HTML rendering in cells.
- `index.jsx` - Defines `renderBlock` and `renderBlocksRecursively` and dyanmically imports block files and injects data.

> ✅ Convention: Block files do **not** call `renderBlock` or `renderBlocksRecursively` directly.

### ── 📁 /src/components/
**Purpose:** React components.

- `Lightbox.jsx` — Renders a MicroModal enabled image and thumbnail.

#### ── 📁 /src/components/elements/
**Purpose:** React components to render certain HTML elements.

- `A.jsx` - Renders a HTML `<a>` anchor tag.
- `Blockquote.jsx` - Renders a HTML `<blockquote>`; also handles nested blocks. Used by both `blockPullquote.js` and `blockQuote.js`.
- `Cite.jsx` - Renders a HTML `<cite>` tag; used by `Blockquote.jsx`.
- `Figure.jsx` - Renders a HTML `<figure>` tag; also handles nested blocks; optional support for `Lightbox.jsx`.
- `Image.jsx`- Renders a HTML `<img>` tag; Was made because too many components/blocks/functions were rendering their own `<img>` tag.
- `index.js` - Imports all components and exports as a single named component e.g `import { A, Figure } from @components/elements`.

## 🔁 Rendering Pipeline

### 🎬 It all starts after data fetch/block parsing...

- `renderBlock` (in `src/lib/blocks.js`) - called for every block in a page; extracts and processes block attributes, markup attributes, and css classnames;
    - registers relevant blocks in `blockRenderers` and calls the imported block file based on the current block name.
    - calls `renderBlocksRecursively` (in `src/lib/blocks.js`) to render any innerBlocks (child blocks)
    - returns the rendered block as a React component.

### 💿 Data passed between Rendering Pipeline and block files


- `renderBlock`
    - `block` - passed block data in JSON format, as it comes from WordPress via GraphQL. Most likely to contain following properties (but not always)
        - `blockName` - The block name e.g `core/group`.
        - `attrs` - An object with highly variable data properties. Pandoras box.
        - (optional) `innerBlocks` - nested block data, each of which will have their own `block` data object.
        - (optional) `innerHTML` - a rendered HTML string representation of the block.
        - (optional/rare) `innerContents` - 
    - `keyPrefix` - an internal marker/index to stop React from complaining about 'duplicate' elements and no indexing. We can ignore this for now.
    - `postContext` - a optional placeholder object to allow passing of page related (e.g post title, featured image url) data to the block.
    - `inheritedProps` - an optional placeholder object to allow one block to pass data down to any nested blocks that needs it. Use cases include column widths and list levels.

---

## 🗂️ Architectural Patterns

- **Dependency Injection**: Block renderer calls/imports block handler dynamically and renders the returned React component.
- **Dynamic HTML Tags**: Block output tags (e.g., `section`, `header`, `div`) can sometimes be determined by `block.attrs.tagName` attributes.
- **Recursive Rendering**: All blocks with `innerBlocks` are rendered recursively with parent context.
- **Tailwind CSS**: Classes are derived from WP attributes and style objects using consistent parsing logic.
- **Function Definitions**: All helper functions must be used more than once (or hold signicant complexity) otherwise they must be made inline only.


## 🚫 Restricted code/patterns

- **dangerouslySetInnerHTML**: Completely off limits. **DO NOT USE**.
- **useContext**: Not to be used in block rendering pipeline due the variability of inner blocks and possible performance side effects.
- **Block/Component level `renderBlock` calls**: Do not abuse `renderBlock`, it's already got enough work on its plate.

---

## 🛠️ TODO / Notes

- [ ] Audit all blocks for changes (upstream WordPress provider updated the block data output, so we need to do a sanity check)
- [ ] Add more handlers for WordPress blocks (priority: core/button)
- [ ] Work out what to do next.
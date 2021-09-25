<p align="center">
  <a href="https://material-ui.com/" rel="noopener" target="_blank"><img width="150" src="https://archival-iiif.github.io/logos/iiif.png" alt="Material-UI logo"></a>
</p>

<h1 align="center">Archival IIIF presentation migrator</h1>

<div align="center">Migrates manifests to other IIIF versions</div>


## Supported migration

* Presentation API 3.0 -> Presentation API 2.1 (not feature complete)

## Installation

presentation-builder is available as an [npm package](https://www.npmjs.com/package/@archival-iiif/presentation-migrator).

```sh
// with npm
npm -i @archival-iiif/presentation-migrator

// with yarn
yarn add @archival-iiif/presentation-migrator
```

## Usage

**Code**

```typescript
import {Manifest} from "@archival-iiif/presentation-builder";

new Manifest('https://example.org/iiif/book1/manifest', 'Book 1');
```

## License

This software is released under the MIT license.

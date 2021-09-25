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
import {Manifest, Collection} from "@archival-iiif/presentation-builder";
import {migrateManifestV3ToV2, migrateCollectionV3ToV2, igrateManifestOrCollectionV3ToV2} from "@archival-iiif/presentation-migrator";

const manifestV3 = new Manifest('https://example.org/iiif/book1/manifest', 'Book 1');
let manifestV2 = migrateManifestV3ToV2(m);
// same result:
manifestV2 = migrateManifestOrCollectionV3ToV2(m);

const collectionV3 = new Collection(
    'https://example.org/iiif/collection/top',
    { "en": [ "Collection for Example Organization" ] }
);
const collectionV2 = migrateCollectionV3ToV2(c);
```

## License

This software is released under the MIT license.

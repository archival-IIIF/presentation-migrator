import {
    Base,
    Resource,
    Manifest,
    Service,
    BaseV2,
    ManifestV2,
    CollectionV2,
    ResourceV2,
    MediaSequenceV2,
    SequenceV2,
    CanvasV2,
    AnnotationV2,
    RenderingV2,
    Collection
} from "@archival-iiif/presentation-builder";
import {ExtendedRef, Internationalize, LabelValue, Ref} from "@archival-iiif/presentation-builder/dist/v3/Base";
import {Metadata} from "@archival-iiif/presentation-builder/dist/v2/Base";

let searchPrefix0: string | undefined = undefined;
let replacePrefix0: string | undefined = undefined;


export function migrateManifestV3ToV2(manifestV3: Manifest, searchPrefix?: string, replacePrefix?: string):
    ManifestV2 {
    searchPrefix0 = searchPrefix;
    replacePrefix0 = replacePrefix;

    const manifestV2 = new ManifestV2('', '');
    migrateBase(manifestV3, manifestV2);

    const manifestItems = migrateManifestItems(manifestV3);
    manifestV2.sequences = manifestItems.sequences;
    manifestV2.mediaSequences = manifestItems.mediaSequences;

    return manifestV2;
}


export function migrateCollectionV3ToV2(collectionV3: Collection, searchPrefix?: string, replacePrefix?: string):
    CollectionV2 {
    searchPrefix0 = searchPrefix;
    replacePrefix0 = replacePrefix;

    const collectionV2: CollectionV2 = new CollectionV2('', '');
    migrateBase(collectionV3, collectionV2);

    if (collectionV3.items) {
        for (const item of collectionV3.items) {
            if (item.type === 'Collection') {
                collectionV2.addCollection(migrateCollectionV3ToV2(item as Collection));
            } else if (item.type === 'Manifest') {
                collectionV2.addManifest(migrateManifestV3ToV2(item as Manifest));
            }
        }
    }

    return collectionV2;
}

export function migrateManifestOrCollectionV3ToV2(baseV3: Manifest | Collection,
                                                    searchPrefix?: string, replacePrefix?: string) {
    if (baseV3 instanceof Collection) {
        return migrateCollectionV3ToV2(baseV3, searchPrefix, replacePrefix);
    }

    return migrateManifestV3ToV2(baseV3, searchPrefix, replacePrefix);
}


function migrateBase(baseV3: Base, baseV2?: BaseV2): BaseV2 {
    const baseV21 = baseV2 ?? new BaseV2();

    baseV21['@id'] = migrateId(baseV3.id);
    baseV21['label'] = internationalizeToString(baseV3.label);
    baseV21.within = migrateRef(baseV3.partOf);
    baseV21.metadata = migrateMetadata(baseV3.metadata);
    baseV21.thumbnail = migrateResource(baseV3.thumbnail?.[0]);
    baseV21.logo = migrateResource(baseV3.logo?.[0])
    baseV21.attribution = internationalizeToString(baseV3.requiredStatement?.value)

    return baseV21;
}

// see https://www.learniiif.org/presentation-api/
function migrateManifestItems(manifestV3: Manifest): {mediaSequences: MediaSequenceV2[] | undefined,
    sequences: SequenceV2[] | undefined} {
    if (!manifestV3.items || manifestV3.items.length === 0) {
        return {mediaSequences: undefined, sequences: undefined};
    }

    const sequences = [];
    const mediaSequences = [];
    for (const item of manifestV3.items) {

        const body = item.items?.[0].items?.[0].body;
        if (body) {
            if (body.type === 'Image') {
                const element = new CanvasV2(migrateId(item.id) ?? '');
                element.width = item.width;
                element.height = item.height;
                const annotationResource = new ResourceV2(
                    body.id ?? '',
                    item.width ?? null,
                    item.height ?? null,
                    body.format ?? '',
                    'dctypes:Image'
                );
                annotationResource.service = migrateService(body.service?.[0])
                element.images = [
                    new AnnotationV2(
                        migrateId(item.items?.[0].items?.[0].id) ?? '',
                        annotationResource,
                        item.items?.[0].items?.[0].motivation ?? '')
                ];
                element.rendering = migrateRendering(item.rendering);

                const s = new SequenceV2((migrateId(item.id) ?? '') + '/sequence', null);
                s.canvases = [element];
                sequences.push(s);
            } else {
                const element = new ResourceV2(migrateId(body?.id) ?? '', item.width ?? null, item.height ?? null, body.format ?? '', body?.type ?? '');
                element.rendering = migrateRendering(item.rendering);

                mediaSequences.push(
                    new MediaSequenceV2(migrateId(item.id) ?? '', element)
                );
            }
        }




    }

    return {
        mediaSequences: mediaSequences.length > 0 ? mediaSequences : undefined,
        sequences: sequences.length > 0 ? sequences : undefined
    };
}

function migrateId(url?: string): string | undefined {
    if (!url) {
        return undefined;
    }

    return url.replace(searchPrefix0 ?? '/iiif/v3/', replacePrefix0?? '/iiif/v2/')
}

function migrateProfile(profile?: string): string | undefined {
    if (!profile) {
        return undefined;
    }

    if (profile === 'level2') {
        return 'http://iiif.io/api/image/2/level2.json';
    }

    if (profile === 'level1') {
        return 'http://iiif.io/api/image/2/level1.json';
    }

    return profile;
}

function migrateRef(parent?: Ref[]): any | undefined {
    if (parent && parent.length > 0) {
        return {
            '@id': migrateId(parent[0].id ?? ''),
            '@type': parent[0].type,
            label: internationalizeToString(parent[0].label)
        }
    }
}

function migrateRendering(renderingV3?: ExtendedRef[]): RenderingV2[] | undefined {
    if (!renderingV3 || renderingV3.length === 0) {
        return undefined;
    }

    const renderingV2: RenderingV2[] = [];
    for (const r of renderingV3) {
        renderingV2.push(
            new RenderingV2(
                migrateId(r.id) ?? '',
                internationalizeToString(r.label) ?? '',
                r.format ?? ''
            )
        );
    }

    return renderingV2.length > 0 ? renderingV2 : undefined;
}

function migrateMetadata(v3?: LabelValue[]): Metadata[] | undefined {
    const v2: Metadata[] = []
    if (!v3 || v3.length === 0) {
        return undefined;
    }

    for (const item of v3) {
        v2.push({
            value: internationalizeToString(item.value) ?? '',
            label: internationalizeToString(item.label) ?? '',
        });
    }

    return v2.length > 0 ? v2 : undefined;
}

function migrateResource(resourceV3?: Resource | undefined): ResourceV2 | undefined {
    if (!resourceV3) {
        return undefined;
    }

    return new ResourceV2(
        migrateId(resourceV3.id) ?? '',
        resourceV3.width ?? null,
        resourceV3.height ?? null,
        resourceV3.format ?? '',
        resourceV3.type
    );
}

function migrateService(serviceV3?: Service, context?: string): object |
    undefined {
    if (!serviceV3) {
        return undefined;
    }

    return {
        "@context": context,
        "@id": migrateId(serviceV3.id),
        profile: migrateProfile(serviceV3.profile)
    };
}

function internationalizeToString(value?: Internationalize): string | undefined {

    if (!value) {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value[Object.keys(value)[0]][0];
}

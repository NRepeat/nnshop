'use client';

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */
import { assist } from '@sanity/assist';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/shared/sanity/env';
import { schema } from './src/shared/sanity/schemaTypes';
import { structure } from './src/shared/sanity/structure';
import { resolve } from '@/shared/sanity/presentation/resolve';
import { documentInternationalization } from '@sanity/document-internationalization';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { colorInput } from '@sanity/color-input';

const presentation = presentationTool({
  resolve,
  previewUrl: {
    previewMode: {
      enable: '/api/draft-mode/enable',
    },
  },
});
const sanityConfig = defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    internationalizedArray({
      languages: (client) =>
        client.fetch(`*[_type == "locale"]{"id": tag, "title":name}`),
      fieldTypes: ['string', 'simpleBlockContent'],
    }),
    documentInternationalization({
      supportedLanguages: (client) =>
        client.fetch(`*[_type == "locale"]{"id": tag, "title":name}`),
      schemaTypes: ['post', 'page'],
    }),
    assist({
      translate: {
        document: {
          languageField: 'language',
        },
        field: {
          languages: (client) =>
            client.fetch(`*[_type == "locale"]{"id": tag, "title":name}`),
          documentTypes: ['post'],
        },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    presentation,
    colorInput(),
  ],
  document: {
    newDocumentOptions: (prev) =>
      prev.filter((item) => item.templateId !== 'siteSettings'),
  },
});
export default sanityConfig;

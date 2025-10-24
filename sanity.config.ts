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
import { apiVersion, dataset, projectId } from './src/sanity/env';
import { schema } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { resolve } from '@/sanity/presentation/resolve';
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
      // Use client to fetch locales or import from local locale file
      languages: (client) =>
        client.fetch(`*[_type == "locale"]{"id": tag, "title":name}`),
      // Define field types to localize as-needed
      fieldTypes: ['string', 'simpleBlockContent'],
    }),
    documentInternationalization({
      // fetch locales from Content Lake or load from your locale file
      supportedLanguages: (client) =>
        client.fetch(`*[_type == "locale"]{"id": tag, "title":name}`),
      // define schema types using document level localization
      schemaTypes: ['post', 'page'],
    }),
    assist({
      translate: {
        document: {
          // Specify the field containing the language for the document
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
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
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

import { defineType } from 'sanity';

export const infoBar = defineType({
  name: 'infoBar',
  type: 'object',
  fields: [
    {
      name: 'telephone',
      type: 'string',
      title: 'Number',
      description: 'The number to display in the info bar.',
    },
    {
      name: 'text',
      type: 'localizedString',
      title: 'Text',
      description: 'The text to display in the info bar.',
    },
    {
      name: 'link',
      type: 'linkInternal',
      title: 'Link',
      description: 'The link to navigate to when the info bar is clicked.',
    },
  ],
});

import createImageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { dataset, projectId } from '../env';

const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (
  source: SanityImageSource,
  width?: number,
  height?: number,
) => {
  let result = builder.image(source);

  if (width && height) {
    return result.width(width).height(height).fit('crop');
  }

  if (width) result = result.width(width);
  if (height) result = result.height(height);

  return result;
};

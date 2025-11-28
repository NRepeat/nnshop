import Image from 'next/image';
import { urlFor } from '@/shared/sanity/lib/image';

export const PortableTextImage = (props: {
  value: { [key: string]: string };
}) => (
  <Image
    className="rounded-lg not-prose w-full h-auto"
    src={urlFor(props.value)
      .width(600)
      .height(400)
      .quality(80)
      .auto('format')
      .url()}
    alt={props?.value?.alt || ''}
    width="600"
    height="400"
  />
);

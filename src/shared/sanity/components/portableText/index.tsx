import { PortableTextComponents } from 'next-sanity';
import { PortableTextImage } from './image';

export const components: PortableTextComponents = {
  types: {
    image: (props) => (props.value ? <PortableTextImage {...props} /> : null),
  },
};

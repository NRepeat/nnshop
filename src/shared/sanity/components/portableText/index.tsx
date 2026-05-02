import { PortableTextComponents } from 'next-sanity';
import Link from 'next/link';
import { PortableTextImage } from './image';

export const components: PortableTextComponents = {
  types: {
    image: (props) => (props.value ? <PortableTextImage {...props} /> : null),
  },
  block: {
    h1: ({ children }) => (
      <h1 className="mt-8 mb-4 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-3 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 text-lg md:text-xl font-semibold tracking-tight text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-5 mb-2 text-base md:text-lg font-semibold text-foreground">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="my-4 text-base leading-[1.7] text-foreground/80">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-foreground/30 pl-4 italic text-foreground/70 text-base leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 list-disc pl-5 space-y-1.5 text-base leading-[1.65] text-foreground/80 marker:text-foreground/40">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 list-decimal pl-5 space-y-1.5 text-base leading-[1.65] text-foreground/80 marker:text-foreground/50">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#';
      const isExternal = /^https?:\/\//i.test(href) && !href.includes('miomio.com.ua');
      return (
        <Link
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="underline decoration-foreground/30 underline-offset-[3px] hover:decoration-foreground transition-colors"
        >
          {children}
        </Link>
      );
    },
  },
};

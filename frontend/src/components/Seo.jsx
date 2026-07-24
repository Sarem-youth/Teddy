import { useEffect } from 'react';

const DEFAULT_TITLE = 'Teddy General Trading | Water Materials & Equipment';

/**
 * NFR-4.3.1 — dynamic meta titles + descriptions per page.
 */
export default function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | Teddy General Trading` : DEFAULT_TITLE;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);

  return null;
}

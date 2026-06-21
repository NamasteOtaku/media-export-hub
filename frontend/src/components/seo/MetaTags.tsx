import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description: string;
  canonicalUrl: string;
}

export const MetaTags = ({ title, description, canonicalUrl }: MetaTagsProps) => {
  return (
    <Helmet>
      <title>{title} | Media Export Hub</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://mediaexporthub.com${canonicalUrl}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://mediaexporthub.com${canonicalUrl}`} />
    </Helmet>
  );
};
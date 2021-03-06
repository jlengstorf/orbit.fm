import React from 'react';
import Link from 'gatsby-link';
import PageWithSidebar from '../components/PageWithSidebar';
import LatestEpisode from '../components/LatestEpisode';
import EpisodeListing from '../components/EpisodeListing';

const IndexPage = ({data}) => {
  const episodes = data.allContentfulPodcast.edges
    .reduce((a, e) => [...a, ...e.node.episode], [])
    .sort((a, b) => {
      if (a.publicationDate > b.publicationDate) {
        return -1;
      }
      if (b.publicationDate > a.publicationDate) {
        return 1;
      }
      return 0;
    });
  const latestEpisode = episodes[0];
  const otherEpisodes = episodes.slice(1);
  return (
    <PageWithSidebar
      title={data.site.siteMetadata.title}
      description={data.site.siteMetadata.description}
      color={latestEpisode.podcast.primaryColor}
      sidePanelChildren={
        <LatestEpisode
          imageSizes={latestEpisode.podcast.image.sizes}
          name={latestEpisode.name}
          path={latestEpisode.fields.path}
          shortDescription={latestEpisode.shortDescription}
          podcastName={latestEpisode.podcast.name}
          podcastHosts={latestEpisode.podcast.hosts.map(h => h.name)}
          podcastPath={latestEpisode.podcast.fields.slug}
        />
      }
    >
      <h2>Other Episodes</h2>
      {otherEpisodes
        .slice(0, 10)
        .map(episode => (
          <EpisodeListing
            shortDescription={episode.shortDescription}
            publicationDate={episode.publicationDate}
            name={episode.name}
            path={episode.fields.path}
            imageSizes={episode.podcast.image.sizes}
            podcastHosts={episode.podcast.hosts.map(h => h.name)}
            podcastName={episode.podcast.name}
            podcastPath={episode.podcast.fields.slug}
            key={episode.id}
          />
        ))}
      <Link to="shows">View all shows</Link>
    </PageWithSidebar>
  );
};

export default IndexPage;

export const query = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
    allContentfulPodcast {
      edges {
        node {
          id
          name
          fields {
            slug
          }
          episode {
            id
            name
            publicationDate
            shortDescription
            fields {
              path
            }
            podcast {
              name
              primaryColor
              fields {
                slug
              }
              image {
                sizes(maxWidth: 700) {
                  ...GatsbyContentfulSizes
                }
              }
              hosts {
                id
                name
                fields {
                  slug
                }
              }
            }
          }
        }
      }
    }
  }
`;

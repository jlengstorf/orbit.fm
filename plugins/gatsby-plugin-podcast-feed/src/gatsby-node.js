import path from 'path';
import RSS from 'rss';
import merge from 'lodash.merge';
import { defaultOptions, runQuery, writeFile } from './internals';

const publicPath = `./public`;

// A default function to transform query data into feed entries.
const serialize = ({ query: { site, allMarkdownRemark } }) =>
  allMarkdownRemark.edges.map(edge => {
    return {
      ...edge.node.frontmatter,
      description: edge.node.excerpt,
      url: site.siteMetadata.siteUrl + edge.node.fields.slug,
      guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
      custom_elements: [{ 'content:encoded': edge.node.html }],
    };
  });

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins;

  /*
   * Run the site settings query to gather context, then
   * then run the corresponding feed for each query.
   */
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  };

  if (`query` in options) {
    options.query = await runQuery(graphql, options.query);
  }

  const newFeeds =
    typeof options.feeds === 'function'
      ? options.feeds({ query: options.query })
      : options.feeds;

  for (let i in newFeeds) {
    if (newFeeds[i].query) {
      newFeeds[i].query = await runQuery(graphql, newFeeds[i].query);

      if (options.query) {
        newFeeds[i].query = merge(options.query, newFeeds[i].query);
        delete options.query;
      }
    }

    const { setup, ...locals } = {
      ...options,
      ...newFeeds[i],
    };

    const feed = new RSS(setup(locals, i));
    const serializer =
      newFeeds[i].serialize && typeof newFeeds[i].serialize === `function`
        ? newFeeds[i].serialize
        : serialize;
    const items = serializer(locals);

    items.forEach(i => feed.item(i));
    await writeFile(path.join(publicPath, newFeeds[i].output), feed.xml());
  }

  return Promise.resolve();
};

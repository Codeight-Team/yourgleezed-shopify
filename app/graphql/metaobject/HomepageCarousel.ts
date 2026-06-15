export const GET_CAROUSEL_QUERY = `#graphql
  query GetCarousel($handle: String!, $type: String!) {
    metaobject(handle: {handle: $handle, type: $type}) {
      id
      handle
      fields {
        key
        value
        # Mengambil list gambar yang di-upload admin
        references(first: 10) {
          nodes {
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

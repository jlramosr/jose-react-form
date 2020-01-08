import gql from "graphql-tag";

const GET_STARSHIPS = gql`
  query Starships($first: Int, $after: String) {
    allStarships(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
      edges {
        node {
          cargoCapacity
          id
          name
        }
      }
    }
  }
`;

export { GET_STARSHIPS };

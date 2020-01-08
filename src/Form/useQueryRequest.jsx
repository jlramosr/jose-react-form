import { useQuery } from "@apollo/react-hooks";
import get from "lodash/get";

const LIMIT = 10;

const useQueryRequest = ({ response: { resultsPath }, request: { query } }) => {
  const { fetchMore, loading, error, data } = useQuery(query, {
    variables: { first: LIMIT }
  });
  if (error) return { error, items: [] };
  if (loading && !data) return { loading, items: [] };

  const loadMore = () =>
    fetchMore({
      query,
      notifyOnNetworkStatusChange: true,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const { edges: oldItems } = previousResult[resultsPath];
        const { edges: newItems } = fetchMoreResult[resultsPath];
        return {
          allStarships: {
            ...fetchMoreResult[resultsPath],
            edges: [...oldItems, ...newItems]
          }
        };
      },
      variables: {
        after: get(data, `${resultsPath}.pageInfo.endCursor`, null),
        first: LIMIT
      }
    });

  return {
    items: get(data, `${resultsPath}.edges`, []).map(({ node }) => node),
    hasNextPage: get(data, `${resultsPath}.pageInfo.hasNextPage`, null),
    loading,
    error,
    loadMore,
    total: get(data, `${resultsPath}.totalCount`, 0) // 0 si no lo sabemos con exactitud
  };
};

export default useQueryRequest;

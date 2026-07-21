import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import {
  onMutationError,
  onMutationSuccess,
  onQueryError,
  onQuerySuccess,
} from "./query-response";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 1000,
    },
  },
  mutationCache: new MutationCache({
    onError: onMutationError,
    onSuccess: onMutationSuccess,
  }),
  queryCache: new QueryCache({
    onError: onQueryError,
    onSuccess: onQuerySuccess,
  }),
});

export default queryClient;

import { createResource, createSignal } from "solid-js";
import { createTRPCClient } from "@trpc/client";
import { inferHandlerInput, inferProcedureOutput } from "@trpc/server";
import { IAppRouter } from "api/trpc/[trpc]";

type AppQueries = IAppRouter["_def"]["queries"];
type AppMutations = IAppRouter["_def"]["mutations"];

type AppQueryKeys = keyof AppQueries & string;
type AppMutationsKeys = keyof AppMutations & string;

export const client = createTRPCClient<IAppRouter>({
  url: "/api/trpc",
});

export type InferMutationOutput<TRouteKey extends AppMutationsKeys> =
  inferProcedureOutput<AppMutations[TRouteKey]>;

export type PromiseOrVoid = Promise<void> | void;
export type ISolidTrpcOPtions<TPath extends AppMutationsKeys> = Partial<{
  onSuccess: (
    data: InferMutationOutput<TPath>,
    ...variables: inferHandlerInput<AppMutations[TPath]>
  ) => PromiseOrVoid;
  onError: (
    error: any,
    ...variables: inferHandlerInput<AppMutations[TPath]>
  ) => PromiseOrVoid;
}>;

export const trpc = {
  useQuery: <TPath extends AppQueryKeys>(
    path: TPath,
    ...args: inferHandlerInput<AppQueries[TPath]>
  ) => createResource(async () => await client.query(path, ...(args as any))),
  useMutation: <TPath extends AppMutationsKeys>(
    path: TPath,
    options?: ISolidTrpcOPtions<TPath>
  ) => {
    const [currentState, setCurrentState] = createSignal<{
      loading: boolean;
      error: any;
      data: InferMutationOutput<TPath> | undefined;
    }>({ loading: false, error: null, data: undefined });

    const mutateAsync = async (
      ...args: inferHandlerInput<AppMutations[TPath]>
    ): Promise<InferMutationOutput<TPath>> => {
      setCurrentState({ loading: true, error: null, data: undefined });
      try {
        const response = await client.mutation(path, ...(args as any));
        options?.onSuccess?.(response, ...args);
        setCurrentState({ loading: false, error: null, data: response });
        return response;
      } catch (error) {
        options?.onError?.(error, ...args);
        setCurrentState({ loading: false, error: error, data: undefined });
        throw error;
      }
    };
    return [mutateAsync, currentState] as const;
  },
};
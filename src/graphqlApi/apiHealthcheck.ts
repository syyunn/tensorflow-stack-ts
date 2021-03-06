
import { GraphQLSchema, GraphQLError } from "graphql";
import { getAppGlobals } from "../appGlobals";
import * as Model from "../modelProviderBase";

// tslint:disable-next-line:interface-name
interface ExecutionResult<T> {
    errors?: ReadonlyArray<GraphQLError>;
    data?: T;
}

type graphqlType = <T>(schema: GraphQLSchema, query: string) => Promise<ExecutionResult<T>>;
// tslint:disable-next-line:no-require-imports no-var-requires no-unsafe-any
const graphqlFn: graphqlType = require("graphql").graphql;

interface IgetType {
    getState: string;
    getName: string;
}

const appGlobals = getAppGlobals();

export async function healthcheck(): Promise<{ ok: boolean, msg: {} }> {
    const rc = { ok: false, msg: {} };
    rc.msg = { error: "GraphQL API error" };

    if (appGlobals.schema) {

        const response = await graphqlFn<IgetType>(appGlobals.schema!, "{ getState getName }");

        // positive path only!
        if (!!response && response.data && typeof response.data.getState === "string"
        && typeof response.data.getName === "string") {

            rc.ok = response.data.getState !== Model.State[Model.State.error] ;
            rc.msg = {
                provider: response.data.getName,
                state: response.data.getState,
            };
        }
    }

    return rc;
}

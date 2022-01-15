import Query from "./Query"
import Mutation from "./Mutation"
import { ApiConfigsResolver, ApiSchemaResolver, AppResolver } from "./Type"

export default {
	Query,
	Mutation,
	App: AppResolver,
	ApiConfigs: ApiConfigsResolver,
	ApiSchema: ApiSchemaResolver,
}

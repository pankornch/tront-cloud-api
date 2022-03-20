import Query from "./Query"
import Mutation from "./Mutation"
import {
	ApiConfigsResolver,
	ApiSchemaResolver,
	AppResolver,
	MemberResolver,
	ModelConfigsResolver,
	ModelRelationshipResolver,
} from "./Type"

export default {
	Query,
	Mutation,
	App: AppResolver,
	Member: MemberResolver,
	ApiConfigs: ApiConfigsResolver,
	ApiSchema: ApiSchemaResolver,
	ModelConfigs: ModelConfigsResolver,
	ModelRelationship: ModelRelationshipResolver,
}

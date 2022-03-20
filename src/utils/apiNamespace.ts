import { ID } from "../types"

export const apiNamespace = {
	dbName(userId: ID) {
		return `tront:${userId.toString()}`
	},
	colName(appId: ID, modelId: ID) {
		return `${appId.toString()}:${modelId.toString()}`
	},
}

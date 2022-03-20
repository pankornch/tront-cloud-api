import { IApiType } from "../types"
import { model, Schema, Types } from "mongoose"

export default model<IApiType>(
	"ApiTypes",
	new Schema({
		app: {
			type: Types.ObjectId,
			required: true,
			ref: "Apps",
		},
		type: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
	})
)

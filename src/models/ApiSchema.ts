import { IApiSchema } from "../types"
import { model, Schema, Types } from "mongoose"

export default model<IApiSchema>(
	"ApiSchemas",
	new Schema({
		app: {
			type: Types.ObjectId,
			required: true,
			ref: "Apps",
		},
		model: {
			type: Types.ObjectId,
			required: true,
			ref: "Models",
		},
		methods: [
			{
				name: {
					type: String,
					required: true,
				},
				pathname: {
					type: String,
					required: true,
				},
				active: {
					type: Boolean,
					default: false,
				},
				public: {
					type: Boolean,
					default: false,
				},
			},
		],
	})
)

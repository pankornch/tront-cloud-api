import { IModelRelationship } from "../types"
import { model, Schema, Types } from "mongoose"

export default model<IModelRelationship>(
	"ModelRelationships",
	new Schema(
		{
			app: {
				type: Types.ObjectId,
				required: true,
				ref: "Apps",
			},
			localModel: {
				type: Types.ObjectId,
				required: true,
				ref: "Models",
			},
			localField: {
				type: String,
				required: true,
			},
			targetModel: {
				type: Types.ObjectId,
				required: true,
			},
			targetField: {
				type: String,
				required: true,
			},
			alias: {
				type: String,
			},
			hasMany: {
				type: Boolean,
				default: false,
			},
		},
		{ timestamps: true }
	)
)

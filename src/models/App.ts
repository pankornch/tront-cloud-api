import { IApp } from "../types"
import { model, Schema, Types } from "mongoose"

export default model<IApp>(
	"Apps",
	new Schema(
		{
			user: {
				type: Types.ObjectId,
				required: true,
				ref: "Users",
			},
			name: {
				type: String,
				required: true,
			},
			description: {
				type: String,
			},
			slug: {
				type: String,
				required: true,
				unique: true,
			},
			active: {
				type: Boolean,
				default: true,
			},
		},
		{
			timestamps: true,
		}
	)
)

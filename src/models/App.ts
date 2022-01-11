import { IApp } from "@/types"
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
			slug: {
				type: String,
				required: true,
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

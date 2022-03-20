import { model, Schema, Types } from "mongoose"
import { IMember } from "../types"

export default model<IMember>(
	"Members",
	new Schema(
		{
			app: {
				type: Types.ObjectId,
				required: true,
				ref: "Apps",
			},
			user: {
				type: Types.ObjectId,
				required: true,
				ref: "Users",
			},
			role: {
				type: String,
				required: true,
				default: "MEMBER"
			},
			status: {
				type: Boolean,
				required: true,
				default: false
			}
		},
		{
			timestamps: true,
		}
	)
)

import { IAccount } from "../types"
import { model, Schema, Types } from "mongoose"

export default model<IAccount>(
	"Accounts",
	new Schema(
		{
			type: {
				type: String,
				required: true,
				enum: ["GITHUB", "GOOGLE", "CREDENTIALS"],
			},
			user: {
				type: Types.ObjectId,
				ref: "Users",
				required: true,
			},
			email: {
				type: String,
				required: true
			},
			password: {
				type: String,
			},
			token: {
				type: String,
			},
			providerId: {
				type: String
			}
		},
		{
			timestamps: true,
		}
	)
)

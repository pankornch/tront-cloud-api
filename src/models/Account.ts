import { model, Schema, Types } from "mongoose"

export default model(
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
			token: {
				type: String
			}
		},
		{
			timestamps: true,
		}
	)
)

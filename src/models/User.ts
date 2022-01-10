import { model, Schema, Types } from "mongoose"

export default model(
	"Users",
	new Schema(
		{
			email: {
				type: String,
				required: true,
			},
			accounts: [
				{
					type: Types.ObjectId,
					ref: "Accounts",
					required: true,
				},
			],
		},
		{
			timestamps: true,
		}
	)
)

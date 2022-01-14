import { IModel } from "@/types"
import { model, Schema, Types } from "mongoose"

export default model<IModel>(
	"Models",
	new Schema(
		{
			app: {
				type: Types.ObjectId,
				required: true,
				ref: "Apps",
			},
			name: {
				type: String,
				required: true,
			},
			fields: [
				{
					type: Types.ObjectId,
					ref: "Fields",
				},
			],
		},
		{
			timestamps: true,
		}
	)
)

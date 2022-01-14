import { IField } from "@/types"
import { model, Schema, Types } from "mongoose"

export default model<IField>(
	"Fields",
	new Schema(
		{
			model: {
				type: Types.ObjectId,
				required: true,
				ref: "Models",
			},
			name: {
				type: String,
				required: true,
			},
			type: {
				type: String,
				required: true,
			},
			required: {
				type: Boolean,
				default: false,
			},
			defaultValue: {
				type: String,
			},
		},
		{
			timestamps: true,
		}
	)
)

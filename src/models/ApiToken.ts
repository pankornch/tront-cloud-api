import { IApiToken } from "@/types"
import { model, Schema, Types } from "mongoose"

export default model<IApiToken>(
	"ApiToken",
	new Schema(
		{
			type: {
				type: String,
				required: true,
			},
			subId: {
				type: Types.ObjectId,
				required: true,
			},
			expiredAt: {
				type: Date,
			},
			version: {
				type: String,
				required: true,
			},
			token: {
				type: String,
				required: true,
			},
		},
		{ timestamps: true }
	)
)

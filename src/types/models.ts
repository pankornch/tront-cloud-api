import { Types } from "mongoose"

export interface IUser {
	_id: Types.ObjectId | string
	createdAt: Date
	updatedAt: Date
}

export interface IAuth {
    _id: Types.ObjectId | string
    email?: string
    password?: string
    provider?: string
}
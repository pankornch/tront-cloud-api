import { AuthTypes, ID } from "."

export interface IUser {
	_id: ID
	email: string
	accounts: IAccount[]
	createdAt: Date
	updatedAt: Date
}

export interface IAccount {
	_id: ID
	user: ID | IUser
	type: AuthTypes
	email: string
	password?: string
	token?: string
	providerId?: string
	createdAt: Date
	updatedAt: Date
}

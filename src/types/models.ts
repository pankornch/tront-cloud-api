import { AuthTypes, ID } from "."

export type ModelTypes =
	| "OBJECT_ID"
	| "STRING"
	| "NUMBER"
	| "DATE"
	| "OBJECT"
	| "ARRAY"

export type ApiNames =
	| "GET_ALL"
	| "GET_ONE"
	| "POST"
	| "PATCH"
	| "PUT"
	| "DELETE"

export type ApiTypes = "REST"

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
	providerAccountId?: string
	createdAt: Date
	updatedAt: Date
}

export interface IApp {
	_id: ID
	user: ID | IUser
	name: string
	description?: string
	slug: string
	active: boolean
	modelConfigs: IModelConfigs
	apiConfigs: IApiConfigs
	createdAt: Date
	updatedAt: Date
}

export interface IModelConfigs {
	_id: ID
	models: IModel[]
}

export interface IModel {
	_id: ID
	app: ID | IApp
	name: string
	fields: IField[]
}

export interface IField {
	_id: ID
	name: string
	type: ModelTypes
	required: boolean
	defaultValue?: string
}

export interface IApiConfigs {
	apiTypes: IApiType[]
	apiSchemas: IApiSchema[]
}

export interface IApiType {
	app: ID | IApp
	type: ApiTypes
	url: string
}

export interface IApiSchema {
	app: ID | IApp
	model: ID | IModel
	methods: IApiMethod[]
}

export interface IApiMethod {
	name: ApiNames
	active: boolean
	public: boolean
	pathname: string
}

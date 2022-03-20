import { ApiTokenTypes, AuthTypes, ID } from "."

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
	avatar: string
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
	app: ID | IApp
	models: IModel[]
	relationships: IModelRelationship[]
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
	_id: ID
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

export interface IMember {
	_id: ID
	app: ID | IApp
	user: ID | IUser
	role: string
	status: boolean
	createdAt: Date
	updatedAt: Date
}

export interface IApiToken {
	_id: ID
	subId: ID
	type: ApiTokenTypes
	version: string
	token: string
	expiredAt: Date
	createdAt: Date
	updatedAt: Date
}


export interface IModelRelationship {
	_id: ID
	app: ID | IApp
	localModel: ID | IModel
	localField: string
	targetModel: ID | IModel
	targetField: String
	hasMany: boolean
	alias: string
}
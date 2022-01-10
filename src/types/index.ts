import { Types } from "mongoose"

export * from "./gql"

export * from "./models"

export type ID = Types.ObjectId | string

export type AuthTypes = "GOOGLE" | "GITHUB" | "CREDENTIALS"

export enum EnumAuthTypes {
	GOOGLE = "GOOGLE",
	GITHUB = "GITHUB",
	CREDENTIALS = "CREDENTIALS",
}

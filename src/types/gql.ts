import { IUser } from ".";

export interface Context {
	req: Express.Request
	authorization: string
	user?: IUser
}

export type Resolver<P = any, A = any> = (
	parent: P,
	args: A,
	context: Context,
	info: any
) => any

export interface ResolverType<P = any, A = any> {
	[key: string]: Resolver<P, A>
}

export interface ResolverMap<P = any, A = any> {
	[key: string]: ResolverType<P, A> | ResolverMap<P, A>
}

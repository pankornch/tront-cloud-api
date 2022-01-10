import { Resolver } from "@/types/gql"

export const signIn: Resolver = (parent, input) => {
	console.log(input)
	return {
		status: "ok",
	}
}

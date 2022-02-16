import { gql } from "apollo-server-core"

export default gql`
	type Query {
		hello: String
		apps: [App]!
		app(slug: ID!): App!

		getAccessApiToken(input: GetAccessApiTokenInput!): String
	}
`

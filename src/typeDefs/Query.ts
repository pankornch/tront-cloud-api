import { gql } from "apollo-server-core"

export default gql`
	type Query {
		hello: String
		apps: [App]!
		app(slug: ID!): App!

		searchUser(input: SearchUserInput!): [User]
		getMembersByApp(input: GetMembersByAppInput!): [Member]!
		getAppInvite: [App]!
	}
`

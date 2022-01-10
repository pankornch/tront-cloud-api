import { gql } from "apollo-server-core"

export default gql`
	input SignInInput {
		email: String!
		password: String!
	}

	input SignUpInput {
		email: String!
		password: String!
		confirmPassword: String!
	}

	input OauthInput {
		type: AuthTypes!
		providerAccountId: String!
		email: String!
	}
`

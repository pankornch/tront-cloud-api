import { gql } from "apollo-server-core"

export default gql`
	input SignInInput {
		type: AuthTypes
		code: String
		email: String
		password: String
		confirmPassword: String
	}

	enum AuthTypes {
		GOOGLE
		GITHUB
        CREDENTIALS
	}
`

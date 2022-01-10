import { gql } from "apollo-server-core";

export default gql`
    type User {
        _id: ID
        email: String!
        accounts: [Account]!
    }

    type Account {
        _id: ID
        type: AuthTypes
        providerId: ID
    }

    type AuthResponse {
        token: String!
        user: User!
        password: String
        providerId: String
    }

    enum AuthTypes {
		GOOGLE
		GITHUB
        CREDENTIALS
	}

    scalar Date
`
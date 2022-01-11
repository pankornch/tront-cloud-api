import { gql } from "apollo-server-core"

export default gql`
    type User {
        _id: ID
        email: String!
        accounts: [Account]!
    }

    type Account {
        _id: ID
        type: AuthTypes
        providerAccountId: ID
    }

    type AuthResponse {
        token: String!
        user: User!
    }

    type App {
        _id: ID!
        name: String!
        slug: String!
        active: Boolean!
    }

    type ModelConfigs {
        models: [Model]!
    }

    type Model {
        name: String!
        fields: [Field]!
    }

    type Field {
        name: String!
        type: ModelTypes
        required: Boolean!
        defaultValue: String
    }
    

    enum AuthTypes {
		GOOGLE
		GITHUB
        CREDENTIALS
	}

    enum ModelTypes {
        OBJECT_ID
        STRING
        NUMBER
        DATE
        OBJECT
        ARRAY
    }

    scalar Date
`

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

	input CreateAppInput {
		name: String!
		slug: String!
		description: String
		modelConfigs: ModelConfigsInput!
	}

	input ModelConfigsInput {
        models: [ModelInput]!
    }

    input ModelInput {
        name: String!
        fields: [FieldInput]!
    }

    input FieldInput {
        name: String!
        type: ModelTypes
        required: Boolean!
        defaultValue: String
    }


`

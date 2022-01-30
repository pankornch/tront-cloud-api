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
		apiConfigs: ApiConfigsInput
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

	input ApiConfigsInput {
		apiTypes: [ApiTypeInput]
		apiSchemas: [ApiSchemaConfigInput]
	}

	input ApiTypeInput {
		type: String!
		url: String!
	}

	input ApiSchemaConfigInput {
		model: ApiModelInput!
		methods: [ApiMethodInput]
	}

	input ApiMethodInput {
		name: String!
		pathname: String
		active: Boolean!
		public: Boolean!
	}

	input ApiModelInput {
		name: String!
	}

	input UpdateAppInput {
		_id: ID!
		name: String
		slug: String
		description: String
	}

	input DeleteAppInput {
		_id: ID!
	}

`

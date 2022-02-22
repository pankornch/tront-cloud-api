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
		_id: String
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
		apiSchemas: [ApiSchemaInput]
	}

	input ApiTypeInput {
		type: String!
		url: String!
	}

	input ApiSchemaInput {
		_id: String
		model: ApiModelInput
		methods: [ApiMethodInput]
	}

	input ApiMethodInput {
		name: String!
		pathname: String
		active: Boolean!
		public: Boolean!
	}

	input ApiModelInput {
		_id: String
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

	input CreateAccessApiTokenInput {
		type: AccessApiTokenTypes!
		subId: String!
	}

	input GetAccessApiTokenInput {
		type: AccessApiTokenTypes!
		subId: String!
	}

	input CreateModelInput {
		model: ModelInput!
		apiSchema: ApiSchemaInput!
	}

	input UpdateModelInput {
		_id: ID!
		name: String!
		fields: [FieldInput!]!
	}

	input UpdateApiSchemaInput {
		modelId: ID!
		methods: [ApiMethodInput]!
	}

	input CreateSchemaInput {
		model: ModelInput!
		apiSchema: ApiSchemaInput!
		appId: ID!
	}

	input UpdateSchemaInput {
		model: ModelInput!
		apiSchema: ApiSchemaInput!
		appId: ID!
	}

	input DeleteSchemaInput {
		modelId: ID!
		appId: ID!
	}
`

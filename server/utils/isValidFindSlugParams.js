const { ValidationError } = require('@strapi/utils/lib/errors');

const isValidFindSlugParams = (params) => {
	if (!params) {
		throw new ValidationError('A model and slug must be provided.');
	}

	const { modelName, slug, models, publicationState } = params;
	const model = models[modelName];

	if (!modelName) {
		throw new ValidationError('A model name path variable is required.');
	}

	if (!slug) {
		throw new ValidationError('A slug path variable is required.');
	}

	if (!model.contentType.options.draftAndPublish && publicationState) {
		throw new ValidationError('Filtering by publication state is only supported for content types that have Draft and Publish enabled.')
	}

	// ensure valid model is passed
	if (!model) {
		throw new ValidationError(
			`${modelName} model name not found, all models must be defined in the settings and are case sensitive.`
		);
	}
};

module.exports = {
	isValidFindSlugParams,
};

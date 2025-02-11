'use strict';

const _ = require('lodash');
const { NotFoundError } = require('@strapi/utils/lib/errors');
const { getPluginService } = require('../utils/getPluginService');
const { transformResponse } = require('@strapi/strapi/lib/core-api/controller/transform');
const { isValidFindSlugParams } = require('../utils/isValidFindSlugParams');
const { sanitizeOutput } = require('../utils/sanitizeOutput');
const { hasRequiredModelScopes } = require('../utils/hasRequiredModelScopes');

module.exports = ({ strapi }) => ({
	async findSlug(ctx) {
		const { models } = getPluginService(strapi, 'settingsService').get();
		const { modelName, slug } = ctx.request.params;
		const { auth } = ctx.state;

		isValidFindSlugParams({
			modelName,
			slug,
			models,
		});

		const { uid, field, contentType } = models[modelName];

		await hasRequiredModelScopes(strapi, uid, auth);

		// add slug filter to any already existing query restrictions
		let query = ctx.query || {};
		if (!query.filters) {
			query.filters = {};
		}
		query.filters[field] = slug;

		// only return published entries by default if content type has draftAndPublish enabled
		if (_.get(contentType, ['options', 'draftAndPublish'], false) && !query.publicationState) {
			query.publicationState = 'live';
		}

		const data = await getPluginService(strapi, 'slugService').findOne(uid, query);

		if (data) {
			const sanitizedEntity = await sanitizeOutput(data, contentType, auth);
			ctx.body = transformResponse(sanitizedEntity);
		} else {
			throw new NotFoundError();
		}
	},
});

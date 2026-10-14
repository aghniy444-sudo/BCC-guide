/**
 * Upload limits shared by the admin server actions and the client-side file
 * inputs, so the browser and the server agree on the same numbers.
 *
 * Note the server action body limit in `next.config.ts` must stay above the
 * largest value here, including multipart overhead, otherwise the request is
 * rejected by Next before the action can return a readable error.
 */
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_LABEL = '5 MB';

export const ASSET_MAX_BYTES = 25 * 1024 * 1024;
export const ASSET_MAX_LABEL = '25 MB';

/** Server action request cap. Must exceed ASSET_MAX_BYTES + multipart overhead. */
export const SERVER_ACTION_BODY_LIMIT = '32mb';

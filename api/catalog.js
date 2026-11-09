import { withHandler, AppError } from './_lib/http.js';
import { verifyRequest } from './_lib/auth.js';
import { listRecipes } from './_lib/services/recipeCatalogService.js';

export default withHandler(async (req, res) => {
  const { uid } = await verifyRequest(req);
  if (!uid) throw AppError.unauthorized();
  const body = req.body || {};
  if (body.action !== 'list') {
    throw AppError.validation({ action: 'Only catalogue listing is available to customers.' });
  }
  const result = await listRecipes(body);
  return res.status(200).json(result);
});

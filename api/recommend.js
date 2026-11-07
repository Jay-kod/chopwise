import { withHandler } from './_lib/http.js';
import { verifyRequest } from './_lib/auth.js';
import { getRecommendations } from './_lib/services/recommendationService.js';

export default withHandler(async (req, res) => {
  const { uid } = await verifyRequest(req);
  const body = req.body || {};
  const regenerate = Boolean(body.regenerate);

  const result = await getRecommendations(uid, { regenerate });
  return res.status(200).json(result);
});


import { withHandler, AppError } from './_lib/http.js';
import { verifyRequest } from './_lib/auth.js';
import { getMealNutrition } from './_lib/services/nutritionService.js';

export default withHandler(async (req, res) => {
  const { uid } = await verifyRequest(req);
  const body = req.body || {};
  const mealId = body.mealId;

  if (!mealId || typeof mealId !== 'string') {
    throw AppError.validation({ mealId: 'mealId string is required in the request body.' });
  }

  const result = await getMealNutrition(uid, mealId);
  return res.status(200).json(result);
});


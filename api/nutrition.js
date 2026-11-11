import { withHandler } from './_lib/http.js';
import { verifyRequest } from './_lib/auth.js';
import { getMealNutrition } from './_lib/services/nutritionService.js';
import { getMealFoodFeedback } from './_lib/services/mealFeedbackService.js';
import { nutritionRequestSchema } from './_lib/schemas.js';

export default withHandler(async (req, res) => {
  const { uid } = await verifyRequest(req);
  const { action, mealId } = nutritionRequestSchema.parse(req.body || {});

  if (action === 'ai-feedback') {
    const feedback = await getMealFoodFeedback(uid, mealId);
    return res.status(200).json({ feedback });
  }

  const result = await getMealNutrition(uid, mealId, {
    forceRefresh: action === 'refresh-usda',
  });
  return res.status(200).json(result);
});

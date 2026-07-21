import { acceptRepairRecipe } from "../../../../../../lib/dekoclean/repairRecipeStore";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body = await request.json().catch(() => ({})) as { recipeId?: unknown };
    if (typeof body.recipeId !== "string" || !body.recipeId) throw new Error("recipeId is required.");
    return { recipe: acceptRepairRecipe(body.recipeId, adminReference) };
  }, { exposeDomainErrors: true });
}

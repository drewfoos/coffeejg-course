"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { toggleFavorite } from "@/lib/firestore/favorites";
import { validateId } from "@/lib/validation";

export async function toggleFavoriteAction(assetId: string): Promise<boolean> {
  validateId(assetId, "asset ID");
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to favorite resources.");
  }

  const isFavorited = await toggleFavorite(user.uid, assetId);
  revalidatePath("/resources");
  return isFavorited;
}

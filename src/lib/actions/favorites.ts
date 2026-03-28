"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { toggleFavorite } from "@/lib/firestore/favorites";

export async function toggleFavoriteAction(assetId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to favorite resources.");
  }

  const isFavorited = await toggleFavorite(user.uid, assetId);
  revalidatePath("/resources");
  return isFavorited;
}

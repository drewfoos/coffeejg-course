import { getUsers, searchUsers } from "@/lib/firestore/admin-users";
import Link from "next/link";
import { UserSearchForm } from "@/components/admin/user-search-form";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; after?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const after = params.after ?? "";

  let users;
  let hasMore = false;
  let nextPageToken: string | undefined;

  if (query) {
    users = await searchUsers(query);
  } else {
    const result = await getUsers(50, after || undefined);
    users = result.users;
    hasMore = result.hasMore;
    nextPageToken = result.nextPageToken;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View and manage user accounts, enrollments, and subscriptions.
      </p>

      <div className="mt-6">
        <UserSearchForm defaultValue={query} />
      </div>

      <div className="mt-6 space-y-2">
        {users.map((user) => (
          <Link
            key={user.uid}
            href={`/admin/users/${user.uid}`}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4 transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.displayName || "No name"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {user.authProvider}
              </span>
              {user.createdAt && (
                <span className="text-xs text-muted-foreground">
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </Link>
        ))}

        {users.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {query ? "No users found matching your search." : "No users yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!query && hasMore && users.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Link
            href={`/admin/users?after=${encodeURIComponent(nextPageToken ?? "")}`}
            className="rounded-md border border-border/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}

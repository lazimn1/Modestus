import { createSupabaseServerClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { User, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  
  // Fetch users via the secure RPC function
  const { data: users, error } = await supabase.rpc("get_auth_users");

  if (error) {
    console.error("Error fetching auth users:", error.message);
  }

  const userList: AuthUser[] = users || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your registered customers and authentication details.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
          <User className="w-5 h-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Users</span>
            <span className="text-lg font-bold text-gray-900 leading-none">{userList.length}</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
          Failed to load users. Are you logged in as an admin? ({error.message})
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Last Sign In</th>
                <th className="px-6 py-4">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList.length === 0 && !error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                userList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.last_sign_in_at ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {format(new Date(user.last_sign_in_at), "MMM d, yyyy • h:mm a")}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {user.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

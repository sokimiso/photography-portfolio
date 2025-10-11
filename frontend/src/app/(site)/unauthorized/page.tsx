export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Access Denied</h1>
      <p className="text-gray-600">
        You don’t have permission to view this page.
      </p>
    </div>
  );
}

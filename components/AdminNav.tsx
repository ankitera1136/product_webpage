import Link from "next/link";

export function AdminNav() {
  return (
    <nav>
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/products">Products</Link>
      <Link href="/admin/admins">Admins</Link>
      <a href="/api/auth/logout">Logout</a>
    </nav>
  );
}

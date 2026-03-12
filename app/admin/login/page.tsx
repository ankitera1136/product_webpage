export const dynamic = "force-dynamic";

export default function AdminLogin() {
  return (
    <div className="card">
      <h1>Admin Login</h1>
      <form method="post" action="/api/auth/login">
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}

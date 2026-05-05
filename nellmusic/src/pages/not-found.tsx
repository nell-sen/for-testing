import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl font-bold text-white/10 mb-4">404</p>
      <p className="text-white/50 mb-6">Halaman tidak ditemukan</p>
      <Link href="/">
        <button className="px-6 py-3 rounded-xl bg-purple-500 text-sm font-semibold hover:bg-purple-600 transition-colors">
          Kembali ke Home
        </button>
      </Link>
    </div>
  );
}

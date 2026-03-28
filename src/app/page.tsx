import { HomePage } from "@/features/routine/pages/HomePage";
import { AuthGuard } from "@/components/AuthGuard";

/**
 * Next.jsアプリケーションのルートページ
 * HomePageコンポーネントをレンダリングする
 * @returns {JSX.Element}
 */
export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

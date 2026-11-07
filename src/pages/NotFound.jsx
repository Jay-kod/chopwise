import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="text-6xl" aria-hidden="true">
          🔍
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The page you are looking for does not exist, has been moved, or is restricted.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

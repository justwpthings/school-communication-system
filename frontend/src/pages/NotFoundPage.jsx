import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <Card className="max-w-lg space-y-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">This page has drifted away.</h1>
      <p className="text-sm leading-6 text-muted">
        The screen you requested could not be found. Return to the main experience to keep moving.
      </p>
      <Link to="/login">
        <Button>Back to login</Button>
      </Link>
    </Card>
  </div>
);

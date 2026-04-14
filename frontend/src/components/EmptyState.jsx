import { Card } from './Card';

export const EmptyState = ({ title, description }) => (
  <Card className="border border-dashed border-stroke bg-white/80 text-center">
    <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>
  </Card>
);

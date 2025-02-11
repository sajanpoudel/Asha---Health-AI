import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('has the alert role', () => {
    render(<Alert>Careful</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Careful');
  });

  it('uses the default variant', () => {
    render(<Alert>Info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-background');
  });

  it('supports the destructive variant', () => {
    render(<Alert variant="destructive">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('text-destructive');
  });
});

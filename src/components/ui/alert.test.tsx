import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('has the alert role', () => {
    render(<Alert>Careful</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Careful');
  });
});

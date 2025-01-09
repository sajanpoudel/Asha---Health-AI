import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders a card with its content', () => {
    render(<Card><CardContent>Body</CardContent></Card>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders the title as a heading', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('text-2xl', 'font-semibold');
  });
});

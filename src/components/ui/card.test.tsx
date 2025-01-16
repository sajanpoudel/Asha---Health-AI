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

  it('renders the description as muted text', () => {
    render(<CardDescription>About</CardDescription>);
    expect(screen.getByText('About')).toHaveClass('text-muted-foreground');
  });

  it('lays out header and footer', () => {
    render(<><CardHeader>H</CardHeader><CardFooter>F</CardFooter></>);
    expect(screen.getByText('H')).toHaveClass('flex-col');
    expect(screen.getByText('F')).toHaveClass('items-center');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('uses the default variant and size', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary', 'h-10', 'px-4');
  });

  it('supports the destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('supports the outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border', 'border-input');
  });

  it('supports the ghost and link variants', () => {
    render(<><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button></>);
    expect(screen.getByText('Link')).toHaveClass('underline-offset-4');
    expect(screen.getByText('Ghost')).not.toHaveClass('bg-primary');
  });

  it('supports the small, large and icon sizes', () => {
    render(<><Button size="sm">S</Button><Button size="lg">L</Button><Button size="icon">I</Button></>);
    expect(screen.getByText('S')).toHaveClass('h-9');
    expect(screen.getByText('L')).toHaveClass('h-11');
    expect(screen.getByText('I')).toHaveClass('w-10');
  });
});

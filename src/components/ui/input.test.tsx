import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders a text input with a placeholder', () => {
    render(<Input placeholder="Name" />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('passes the type through', () => {
    render(<Input type="email" placeholder="Mail" />);
    expect(screen.getByPlaceholderText('Mail')).toHaveAttribute('type', 'email');
  });

  it('reports changes', () => {
    const onChange = vi.fn();
    render(<Input placeholder="Name" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Ada' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Input placeholder="Name" disabled />);
    expect(screen.getByPlaceholderText('Name')).toBeDisabled();
  });

  it('merges a custom className', () => {
    render(<Input placeholder="Name" className="bg-transparent" />);
    expect(screen.getByPlaceholderText('Name')).toHaveClass('bg-transparent', 'rounded-md');
  });
});

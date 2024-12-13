import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders a text input with a placeholder', () => {
    render(<Input placeholder="Name" />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('shows the text of a user message', () => {
    render(<ChatMessage message={{ type: 'user', content: 'Hello Asha' }} />);
    expect(screen.getByText('Hello Asha')).toBeInTheDocument();
  });
});

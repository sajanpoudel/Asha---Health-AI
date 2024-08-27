import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('shows the text of a user message', () => {
    render(<ChatMessage message={{ type: 'user', content: 'Hello Asha' }} />);
    expect(screen.getByText('Hello Asha')).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<ChatMessage message={{ type: 'user', content: 'Hi' }} />);
    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(<ChatMessage message={{ type: 'ai', content: 'Hi' }} />);
    expect(container.firstChild).toHaveClass('justify-start');
  });
});

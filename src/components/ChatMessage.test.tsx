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

  it('renders html in the message content', () => {
    render(<ChatMessage message={{ type: 'ai', content: 'Take <strong>deep</strong> breaths' }} />);
    expect(screen.getByText('deep').tagName).toBe('STRONG');
  });

  it('shows a typing indicator instead of the text while loading', () => {
    const { container } = render(
      <ChatMessage message={{ type: 'ai', content: 'Generating response...' }} isLoading />
    );
    expect(screen.queryByText('Generating response...')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('uses a dark bubble for the user', () => {
    const { container } = render(<ChatMessage message={{ type: 'user', content: 'Hi' }} />);
    expect(container.querySelector('.bg-\\[\\#000000\\]')).not.toBeNull();
  });
});

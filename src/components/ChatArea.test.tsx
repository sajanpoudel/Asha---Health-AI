import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatArea from './ChatArea';

const chat = (messages: { type: 'user' | 'ai'; content: string }[]) => () => ({
  id: '1',
  messages,
}) as unknown as Chat;

describe('ChatArea', () => {
  it('shows every message of the current chat', () => {
    render(
      <ChatArea
        getCurrentChat={chat([
          { type: 'user', content: 'Hi' },
          { type: 'ai', content: 'Hello there' },
        ])}
        isGeneratingResponse={false}
      />
    );
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('shows the loading bubble while a response is generated', () => {
    const { container } = render(
      <ChatArea getCurrentChat={chat([{ type: 'user', content: 'Hi' }])} isGeneratingResponse />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
  });

  it('scrolls to the end when it renders', () => {
    render(<ChatArea getCurrentChat={chat([{ type: 'ai', content: 'Hello' }])} isGeneratingResponse={false} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('renders no message bubbles for an empty chat', () => {
    const { container } = render(
      <ChatArea getCurrentChat={chat([])} isGeneratingResponse={false} />
    );
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});

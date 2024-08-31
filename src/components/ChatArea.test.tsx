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
});

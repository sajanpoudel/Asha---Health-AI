import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MessageInput from './MessageInput';

type Msg = { type: 'user' | 'ai'; content: string };

const baseProps = (messages: Msg[] = []) => ({
  inputMessage: '',
  setInputMessage: vi.fn(),
  isListening: false,
  isSpeaking: false,
  isWaitingForWakeWord: false,
  transcript: '',
  isDarkMode: false,
  voiceIconAnimation: null,
  handleSendMessage: vi.fn(),
  startListening: vi.fn(),
  speakText: vi.fn(),
  getCurrentChat: () => ({ id: '1', messages }) as unknown as Chat,
  isProcessing: false,
});

const buttons = () => screen.getAllByRole('button');

describe('MessageInput', () => {
  it('shows the default placeholder', () => {
    render(<MessageInput {...baseProps()} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('asks for the wake word while waiting for it', () => {
    render(<MessageInput {...baseProps()} isWaitingForWakeWord />);
    expect(screen.getByPlaceholderText('Say "Hey Asha" to start')).toBeInTheDocument();
  });

  it('says Listening while the microphone is on', () => {
    render(<MessageInput {...baseProps()} isListening />);
    expect(screen.getByPlaceholderText('Listening...')).toBeInTheDocument();
  });
});

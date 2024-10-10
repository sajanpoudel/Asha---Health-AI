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

  it('says Speaking while the answer is read aloud', () => {
    render(<MessageInput {...baseProps()} isSpeaking />);
    expect(screen.getByPlaceholderText('Speaking...')).toBeInTheDocument();
  });

  it('shows the transcript when there is one', () => {
    render(<MessageInput {...baseProps()} transcript="I have a cough" />);
    expect(screen.getByPlaceholderText('I have a cough')).toBeInTheDocument();
  });

  it('reports typing through setInputMessage', () => {
    const props = baseProps();
    render(<MessageInput {...props} />);
    fireEvent.change(screen.getByPlaceholderText('Type your message...'), { target: { value: 'Hi' } });
    expect(props.setInputMessage).toHaveBeenCalledWith('Hi');
  });

  it('starts listening from the microphone button', () => {
    const props = baseProps();
    render(<MessageInput {...props} />);
    fireEvent.click(buttons()[0]);
    expect(props.startListening).toHaveBeenCalledTimes(1);
  });

  it('disables the send button when there is nothing to send', () => {
    render(<MessageInput {...baseProps()} />);
    expect(buttons()[2]).toBeDisabled();
  });

  it('enables the send button once there is text', () => {
    render(<MessageInput {...baseProps()} inputMessage="Hello" />);
    expect(buttons()[2]).toBeEnabled();
  });
});

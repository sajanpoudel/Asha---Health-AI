import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

const baseProps = () => ({
  isSidebarOpen: true,
  toggleSidebar: vi.fn(),
  createNewChat: vi.fn(),
  chats: [
    { id: 'a', messages: [{ type: 'user', content: 'My head hurts a lot today' }] },
    { id: 'b', messages: [] },
  ] as unknown as Chat[],
  currentChatId: 'a',
  switchChat: vi.fn(),
  isDarkMode: false,
  setIsDarkMode: vi.fn(),
});

describe('Sidebar', () => {
  it('shows the app name when open', () => {
    render(<Sidebar {...baseProps()} />);
    expect(screen.getByText('ashaHealth')).toBeInTheDocument();
  });

  it('titles an empty chat New Chat', () => {
    render(<Sidebar {...baseProps()} />);
    expect(screen.getAllByText('New Chat').length).toBeGreaterThanOrEqual(2);
  });

  it('closes through the close button', () => {
    const props = baseProps();
    const { container } = render(<Sidebar {...props} />);
    const close = container.querySelector('svg.lucide-x')!.closest('button')!;
    fireEvent.click(close);
    expect(props.toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('toggles dark mode', () => {
    const props = baseProps();
    const { container } = render(<Sidebar {...props} />);
    fireEvent.click(container.querySelector('svg.lucide-moon')!.closest('button')!);
    expect(props.setIsDarkMode).toHaveBeenCalledWith(true);
  });

  it('shows a sun icon in dark mode', () => {
    const { container } = render(<Sidebar {...baseProps()} isDarkMode />);
    expect(container.querySelector('svg.lucide-sun')).not.toBeNull();
    expect(container.querySelector('svg.lucide-moon')).toBeNull();
  });

  it('renders nothing when closed', () => {
    render(<Sidebar {...baseProps()} isSidebarOpen={false} />);
    expect(screen.queryByText('ashaHealth')).not.toBeInTheDocument();
  });

  it('titles a chat with the start of its first message', () => {
    render(<Sidebar {...baseProps()} />);
    expect(screen.getByText('My head hurts a lot ...')).toBeInTheDocument();
  });

  it('switches to the chat that was clicked', () => {
    const props = baseProps();
    render(<Sidebar {...props} />);
    fireEvent.click(screen.getByText('My head hurts a lot ...'));
    expect(props.switchChat).toHaveBeenCalledWith('a');
  });

  it('marks the current chat', () => {
    render(<Sidebar {...baseProps()} />);
    const current = screen.getByText('My head hurts a lot ...').closest('button');
    expect(current).toHaveClass('bg-secondary');
  });
});

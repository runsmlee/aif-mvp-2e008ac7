import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../src/hooks/useToast';

// Test component that uses the toast hook
function TestComponent() {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast({ message: 'Item added!', type: 'success' })}>
        Show Success
      </button>
      <button onClick={() => addToast({ message: 'Something went wrong', type: 'error' })}>
        Show Error
      </button>
    </div>
  );
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast message when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Item added!')).toBeInTheDocument();
  });

  it('renders success toast with correct role', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    const toast = screen.getByText('Item added!').closest('[role="status"]');
    expect(toast).toBeInTheDocument();
  });

  it('renders error toast with correct message', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('auto-dismisses toast after timeout', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Item added!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('Item added!')).not.toBeInTheDocument();
  });

  it('allows manual dismissal of toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Item added!')).toBeInTheDocument();

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('Item added!')).not.toBeInTheDocument();
  });
});

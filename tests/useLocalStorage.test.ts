import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    expect(result.current[0]).toEqual([]);
  });

  it('returns stored value when localStorage has data', () => {
    const items = [{ id: '1', name: 'Drill' }];
    localStorage.setItem('test-key', JSON.stringify(items));
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    expect(result.current[0]).toEqual(items);
  });

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    const newValue = [{ id: '1', name: 'Drill' }];
    act(() => {
      result.current[1](newValue);
    });
    expect(result.current[0]).toEqual(newValue);
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(newValue));
  });

  it('handles JSON parse errors gracefully', () => {
    localStorage.setItem('test-key', 'not-valid-json{');
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    expect(result.current[0]).toEqual([]);
  });
});

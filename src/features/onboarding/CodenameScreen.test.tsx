import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CodenameScreen } from './CodenameScreen';

describe('CodenameScreen', () => {
  it('renders heading and input', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    expect(screen.getByText('Wie lautet Ihr Agenten-Deckname?')).toBeInTheDocument();
    expect(screen.getByLabelText('Agenten-Deckname')).toBeInTheDocument();
  });

  it('auto-focuses the input on mount', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    expect(input).toHaveFocus();
  });

  it('has maxLength of 20', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    expect(input).toHaveAttribute('maxLength', '20');
  });

  it('uses initialValue when provided', () => {
    render(<CodenameScreen onSubmit={() => {}} initialValue="TestAgent" />);
    const input = screen.getByLabelText('Agenten-Deckname') as HTMLInputElement;
    expect(input.value).toBe('TestAgent');
  });

  it('disables the button when input is empty', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const button = screen.getByRole('button', { name: 'Bestätigen' });
    expect(button).toBeDisabled();
  });

  it('enables the button when input is valid', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'ShadowFox' } });
    const button = screen.getByRole('button', { name: 'Bestätigen' });
    expect(button).not.toBeDisabled();
  });

  it('disables the button when input has invalid characters', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'Shadow Fox!' } });
    const button = screen.getByRole('button', { name: 'Bestätigen' });
    expect(button).toBeDisabled();
  });

  it('does not show validation error before interaction', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows validation error on blur with empty input', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Ein Deckname ist erforderlich.');
  });

  it('shows validation error on blur with invalid characters', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'Agent @!' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Der Deckname darf nur Buchstaben, Zahlen, Umlaute, Bindestriche und Unterstriche enthalten.'
    );
  });

  it('calls onSubmit with trimmed codename on button click', () => {
    const onSubmit = vi.fn();
    render(<CodenameScreen onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: '  ShadowFox  ' } });
    const button = screen.getByRole('button', { name: 'Bestätigen' });
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith('ShadowFox');
  });

  it('calls onSubmit on Enter key with valid input', () => {
    const onSubmit = vi.fn();
    render(<CodenameScreen onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'Agent_007' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('Agent_007');
  });

  it('does not call onSubmit on Enter key with invalid input', () => {
    const onSubmit = vi.fn();
    render(<CodenameScreen onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error after submit attempt with invalid input', () => {
    render(<CodenameScreen onSubmit={() => {}} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'bad chars!@#' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('accepts umlauts and special allowed characters', () => {
    const onSubmit = vi.fn();
    render(<CodenameScreen onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Agenten-Deckname');
    fireEvent.change(input, { target: { value: 'Über-Ägent_ß' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('Über-Ägent_ß');
  });
});

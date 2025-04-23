import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchEngine from './SearchEngine';

describe('SearchEngine Component', () => {
  test('renders with initial state', () => {
    render(<SearchEngine />);
    expect(screen.getByTestId('search-input')).toHaveValue('');
    expect(screen.getByTestId('case-sensitive-checkbox')).not.toBeChecked();
    expect(screen.queryByTestId('results-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  test('renders search input and button', () => {
    render(<SearchEngine />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('case-sensitive-checkbox')).toBeInTheDocument();
  });

  test('displays error for empty query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a search query.');
    expect(screen.queryByTestId('results-list')).not.toBeInTheDocument();
  });

  test('displays error for whitespace-only query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), '   ');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a search query.');
  });

  test('displays results for valid query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'apple');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(3); // Apple Pie, Smoothie, Crumble
    expect(screen.getByText('Found 3 results')).toBeInTheDocument();
  });

  test('handles case-sensitive search with no results', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.click(screen.getByTestId('case-sensitive-checkbox'));
    await user.type(screen.getByTestId('search-input'), 'tiramisu');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('no-results')).toHaveTextContent('No results found for "tiramisu"');
  });

  test('handles case-sensitive search with results', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.click(screen.getByTestId('case-sensitive-checkbox'));
    await user.type(screen.getByTestId('search-input'), 'Tiramisu');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(1); // Tiramisu Classic
  });

  test('handles 256 character query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const longQuery = 'a'.repeat(256);
    await user.type(screen.getByTestId('search-input'), longQuery);
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('error-message')).toHaveTextContent('Query is too long. Maximum 255 characters allowed.');
    expect(screen.queryByTestId('results-list')).not.toBeInTheDocument();
  });

  test('handles exactly 255 character query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const longQuery = 'a'.repeat(255);
    await user.type(screen.getByTestId('search-input'), longQuery);
    await user.click(screen.getByTestId('search-button'));
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  test('resets results when typing new query', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'apple');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    await user.clear(screen.getByTestId('search-input'));
    await user.type(screen.getByTestId('search-input'), 'banana');
    expect(screen.queryByTestId('results-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
  });

  test('pagination for single page', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'apple');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(3);
    expect(screen.queryByTestId('page-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prev-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('next-page')).not.toBeInTheDocument();
  });

  test('pagination for multiple pages', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'e');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(5); // First page
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    await user.click(screen.getByTestId('next-page'));
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
  });

  test('handles Enter key press', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'apple');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(3);
  });

  test('handles non-Enter key press', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'apple');
    await user.keyboard('{Space}');
    expect(screen.queryByTestId('results-list')).not.toBeInTheDocument();
  });

  test('handles pagination boundaries', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'e');
    await user.click(screen.getByTestId('search-button'));
    
    // Test first page
    expect(screen.getByTestId('prev-page')).toBeDisabled();
    await user.click(screen.getByTestId('next-page'));
    
    // Test middle page
    expect(screen.getByTestId('prev-page')).not.toBeDisabled();
    expect(screen.getByTestId('next-page')).not.toBeDisabled();
    await user.click(screen.getByTestId('next-page'));
    
    // Test last page
    expect(screen.getByTestId('next-page')).toBeDisabled();
    await user.click(screen.getByTestId('prev-page'));
    expect(screen.getByTestId('prev-page')).not.toBeDisabled();
  });

  test('handles invalid page navigation', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'e');
    await user.click(screen.getByTestId('search-button'));
    
    // Try to go to page 0 (should stay on page 1)
    await user.click(screen.getByTestId('prev-page'));
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    
    // Go to last page
    await user.click(screen.getByTestId('next-page'));
    await user.click(screen.getByTestId('next-page'));
    
    // Try to go beyond last page (should stay on last page)
    await user.click(screen.getByTestId('next-page'));
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 3 of 3');
  });

  test('handles case-sensitive search with mixed case', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.click(screen.getByTestId('case-sensitive-checkbox'));
    await user.type(screen.getByTestId('search-input'), 'APPLE');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('no-results')).toHaveTextContent('No results found for "APPLE"');
  });

  test('handles case-sensitive search with content match', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.click(screen.getByTestId('case-sensitive-checkbox'));
    await user.type(screen.getByTestId('search-input'), 'Italian');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(1);
    expect(screen.getByText('Tiramisu Classic')).toBeInTheDocument();
  });

  test('handles empty content in search results', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    await user.type(screen.getByTestId('search-input'), 'empty');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('no-results')).toHaveTextContent('No results found for "empty"');
  });

  test('SearchEngine Component verifies initial hasSearched state', () => {
    render(<SearchEngine />)
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  test('SearchEngine Component verifies case transformation in search', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const input = screen.getByPlaceholderText('Enter search query...');
    
    // Test lowercase transformation
    await user.type(input, 'APPLE');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    
    // Test case sensitive search
    await user.click(screen.getByTestId('case-sensitive-checkbox'));
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('no-results')).toHaveTextContent('No results found for "APPLE"');
  });

  test('SearchEngine Component handles empty content in results', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const input = screen.getByPlaceholderText('Enter search query...');
    
    // Search for a term that would match items even with empty content
    await user.type(input, 'Apple');
    await user.click(screen.getByTestId('search-button'));
    
    const results = screen.getAllByRole('listitem');
    results.forEach(result => {
      expect(result.textContent?.trim()).not.toBe('');
    });
  });

  test('SearchEngine Component handles empty title in results', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const input = screen.getByPlaceholderText('Enter search query...');
    
    await user.type(input, 'delicious');
    await user.click(screen.getByTestId('search-button'));
    
    const results = screen.getAllByRole('listitem');
    results.forEach(result => {
      const title = result.querySelector('h3');
      expect(title?.textContent?.trim()).not.toBe('');
    });
  });

  test('SearchEngine Component verifies error state reset', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const input = screen.getByPlaceholderText('Enter search query...');
    
    // Trigger error state
    await user.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    
    // Reset error state by typing
    await user.type(input, 'apple');
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  test('SearchEngine Component verifies pagination state reset', async () => {
    const user = userEvent.setup();
    render(<SearchEngine />);
    const input = screen.getByPlaceholderText('Enter search query...');
    
    // Get to second page of results
    await user.type(input, 'e');
    await user.click(screen.getByTestId('search-button'));
    await user.click(screen.getByTestId('next-page'));
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
    
    // New search should reset to first page
    await user.clear(input);
    await user.type(input, 'apple');
    await user.click(screen.getByTestId('search-button'));
    expect(screen.queryByTestId('page-info')).not.toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<SearchEngine />);
    expect(screen.getByPlaceholderText('Enter search query...')).toBeInTheDocument();
  });

  it('handles empty query', () => {
    render(<SearchEngine />);
    const searchInput = screen.getByPlaceholderText('Enter search query...');
    userEvent.type(searchInput, '');
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
  });

  it('handles whitespace-only query', () => {
    render(<SearchEngine />);
    const searchInput = screen.getByPlaceholderText('Enter search query...');
    userEvent.type(searchInput, '   ');
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
  });
}); 
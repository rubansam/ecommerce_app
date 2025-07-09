import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import axios from '../../api/axios';

jest.mock('../../api/axios');

test('renders dashboard stats from API', async () => {
  // Mock the API response
  axios.get.mockResolvedValueOnce({
    data: { followersCount: 42 }
  });

  render(<Dashboard />);

  // Wait for the API call and UI update
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for the followers count to appear
  await waitFor(() => {
    expect(screen.getByText(/followers: 42/i)).toBeInTheDocument();
  });
});
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from '../config-schema';
import PatientSearchButton from './patient-search-button.component';

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);
const mockedLaunchWorkspace = jest.mocked(launchWorkspace);

describe('PatientSearchButton', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        patientChartUrl: '',
        showRecentlySearchedPatients: false,
      },
    });
  });
  it('renders with default props', () => {
    render(<PatientSearchButton />);

    const searchButton = screen.getByLabelText('Search Patient Button');

    expect(searchButton).toBeInTheDocument();
  });

  it('displays custom buttonText', () => {
    render(<PatientSearchButton buttonText="Custom Text" />);

    const customButton = screen.getByText('Custom Text');

    expect(customButton).toBeInTheDocument();
  });

  it('displays workspace when patient search button is clicked', async () => {
    const user = userEvent.setup();

    render(<PatientSearchButton />);

    const searchButton = screen.getByLabelText('Search Patient Button');

    await user.click(searchButton);

    expect(mockedLaunchWorkspace).toHaveBeenCalled();
  });
});

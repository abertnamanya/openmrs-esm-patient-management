import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { PatientSearchContext } from '../patient-search-context';
import RecentlySearchedPatients from './recently-searched-patients.component';

const defaultProps = {
  currentPage: 0,
  data: [],
  fetchError: null,
  hasMore: false,
  isLoading: false,
  isValidating: false,
  setPage: jest.fn(),
  totalResults: 0,
};

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

describe('RecentlySearchedPatients', () => {
  const birthdate = '1990-01-01T00:00:00.000+0000';
  const age = dayjs().diff(birthdate, 'years');
  const mockSearchResults: Array<SearchedPatient> = [
    {
      attributes: [],
      identifiers: [
        {
          display: 'OpenMRS ID = 1000NLY',
          uuid: '19e98c23-d26f-4668-8810-00da0e10e326',
          identifier: '1000NLY',
          identifierType: {
            uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
            display: 'OpenMRS ID',
            links: [
              {
                rel: 'self',
                uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/patientidentifiertype/05a29f94-c0ed-11e2-94be-8c13b969e334`,
                resourceAlias: 'patientidentifiertype',
              },
            ],
          },
          location: {
            uuid: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
            display: 'Outpatient Clinic',
          },
          preferred: true,
        },
      ],
      person: {
        age,
        addresses: [],
        birthdate,
        dead: false,
        deathDate: null,
        gender: 'M',
        personName: {
          display: 'Smith, John Doe',
          givenName: 'John',
          middleName: 'Doe',
          familyName: 'Smith',
        },
      },
      uuid: 'test-patient-uuid',
    },
  ];

  beforeEach(() => mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema)));

  it('renders a loading state when fetching recently searched patients on initial render', () => {
    renderRecentlySearchedPatients({
      isLoading: true,
      data: undefined,
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an empty state when there are no matching search results', () => {
    renderRecentlySearchedPatients({
      isLoading: false,
      data: [],
    });

    expect(screen.getByText(/no patient charts were found/i)).toBeInTheDocument();
    expect(screen.getByText(/try to search again using the patient's unique ID number/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an error state when search results fail to fetch', () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    renderRecentlySearchedPatients({
      fetchError: error,
      isLoading: false,
    });

    expect(screen.getByText(/sorry, there was an error. You can try to reload this page/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders a list of recently searched patients', () => {
    renderRecentlySearchedPatients({
      currentPage: 0,
      data: mockSearchResults,
      hasMore: false,
      totalResults: 1,
    });

    // TODO: Restore these tests once we improve the patient banner test stubs
    // expect(
    //   screen.getByRole('link', { name: new RegExp(`Smith, John Doe Male · ${age} yrs · OpenMRS ID 1000NLY`, 'i') }),
    // ).toBeInTheDocument();
    // expect(screen.getByRole('link')).toHaveAttribute(
    //   'href',
    //   `/openmrs/spa/patient/${mockSearchResults[0].uuid}/chart/`,
    // );
    // expect(screen.getByRole('heading', { name: /Smith, John Doe/i })).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText(/1 recent search result/i)).toBeInTheDocument();
  });

  it('renders a loading spinner when revalidating recently searched patients', () => {
    renderRecentlySearchedPatients({
      currentPage: 0,
      data: mockSearchResults,
      hasMore: false,
      totalResults: 1,
      isValidating: true,
    });

    expect(screen.getByTitle(/loading/i)).toBeInTheDocument();
  });
});

function renderRecentlySearchedPatients(props = {}) {
  render(
    <PatientSearchContext.Provider value={{}}>
      <RecentlySearchedPatients {...defaultProps} {...props} />
    </PatientSearchContext.Provider>,
  );
}

import getOrganisationData from './getOrganisationData';

describe('Get Organisation Data Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Throws an Error when API returns non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });
    await expect(getOrganisationData('testAccessToken')).rejects.toThrow(Error);
  });

  it('Returns a json object when API returns OK status', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => ({test: 'test'}),
    });
    const testResponse = await getOrganisationData('testAccessToken');
    expect(testResponse).toEqual({test: 'test'});
  });
});

import getNameData from './getNameData';

describe('Get Name Data Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Throws an Error when API returns non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(getNameData('testAccessToken')).rejects.toThrow(Error);
  });

  it('Returns a json object when API returns OK status', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => ({test: 'test'}),
    });
    const testResponse = await getNameData('testAccessToken');

    expect(testResponse).toStrictEqual({test: 'test'});
  });
});

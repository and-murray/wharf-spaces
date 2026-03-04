import {getPersonData} from './getPersonData';

describe('Get Person Data', () => {
    it('calls fetch with the correct properties', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => ({test: 'test'}),
        });
        await getPersonData('123');
        expect(global.fetch).toHaveBeenCalledWith('https://people.googleapis.com/v1/people/me?personFields=organizations,names', {'headers': {'Authorization': 'Bearer 123'}, 'method': 'GET'});
    });
    it('Throws an Error when API returns non-OK response', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 400,
        });
        await expect(getPersonData('testAccessToken')).rejects.toThrow(Error);
    });
});

import {people_v1} from 'googleapis';

export const getPersonData = async (token: string): Promise<people_v1.Schema$Person> => {
    const organisationResponse = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=organizations,names',
        {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        },
    );
    if (!organisationResponse.ok) {
        throw new Error(
        `API request failed with status ${organisationResponse.status}`,
        );
    }
    return organisationResponse.json() as people_v1.Schema$Person;
};

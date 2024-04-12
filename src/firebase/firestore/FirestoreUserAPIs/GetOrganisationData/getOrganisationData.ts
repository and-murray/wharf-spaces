const getOrganisationData = async (accessToken: string) => {
  const organisationResponse = await fetch(
    'https://people.googleapis.com/v1/people/me?personFields=organizations',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!organisationResponse.ok) {
    throw new Error(
      `API request failed with status ${organisationResponse.status}`,
    );
  }
  return organisationResponse.json();
};
export default getOrganisationData;

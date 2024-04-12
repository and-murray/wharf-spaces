const getNameData = async (accessToken: string) => {
  const nameResponse = await fetch(
    'https://people.googleapis.com/v1/people/me?personFields=names',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!nameResponse.ok) {
    throw new Error(`API request failed with status ${nameResponse.status}`);
  }
  return nameResponse.json();
};

export default getNameData;

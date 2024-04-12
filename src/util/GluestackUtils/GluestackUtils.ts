export const parseGluestackComponentStyleProps = (
  componentStyleProps: [Object],
) => {
  // Removes undefined values from Gluestack style props and flattens style objects into a single object
  const validEntries = componentStyleProps.filter(entry => entry !== undefined);
  return Object.assign({}, ...validEntries);
};

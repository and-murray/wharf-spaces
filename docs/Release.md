# Creating a Release

# Development

Development releases happen on every merge into the main branch.

If there are changes to the functions these are deployed. To the `murray-apps-dev` firebase project. An Android and iOS app are built and uploaded to the same firebase project for distribution.

# Production

A production pipeline can be started on the main branch.

## Creating a release

1. Ensure your feature flags are correct. Any incomplete features should have their feature flag turned off within the `FeatureFlagsSlice.ts` initial state. Check the Feature Flags Remote Config within `murray-apps` firebase project to ensure they are set correctly. If necessary create Pull Requests into `main` and have them merged before continuing.
2. Create a Release Within Github with the version number of the new release as the tag and main branch as the target. If the release will include the apps the tag should follow semantic versioning. Generate release notes and set as the latest release and publish the release.
3. Go to Actions -> `production` and use the `workflow_dispatch` to start the action. Start the action with the main branch selected. The release types are:

- `all` - Includes functions and apps.
- `functions` - Will release the functions but not the apps.
- `app` - Will release the apps but not the functions.

The version string should match the tag you created for the release. 4. The action will run tests and ensure the version numbers are correct. 5. You will need an approval to start the `prepare_release` job. This will update app build and version numbers, commit these changes and tag the branch to this commit. 5. After this step is complete you will need further approvals for the deployments to take place. These deployments will happen on your tagged commit from the previous step. 6. Once the apps are on Testflight and Google Play Internal testing you may complete regression testing. The functions will deploy to the `murray-apps` firebase project. 7. Once regression is complete the apps may be released.

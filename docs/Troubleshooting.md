# Troubleshooting

- If you're having issues, you should try running `yarn react-native doctor` first, it will guide you/automatically find and fix common react-native issues for you.

## I have an M1/M2 macbook (rather than intel) and it's not working

- If you are running on an M1/M2 macbook, run this command before dealing with ruby/bundler/pods: `env /usr/bin/arch -arm64 /bin/zsh --login`. If any of the steps with ruby or bundler fail, try prefixing them with `arch -arm64` (e.g. `arch -arm64 bundle install`)

## I'm seeing error messages

`Failed to launch emulator. Reason: No emulators found as an output of emulator -list-avds`
OR
`error Failed to install the app. Make sure you have the Android...`

- Try `yarn  react-native doctor`. If this doesn't report Android issues, you may have an issue elsewhere...

### If you're a fish shell user

- Run `which yarn` to get the path for Yarn, and then replace the _YARN_GLOBAL_PATH_ in the following and run `set -U fish_user_paths YARN_GLOBAL_PATH $fish_user_paths`.

## Unknown ruby interpreter version (do not know how to handle): >=XXXX

- We strongly recommend using a Ruby version manager such as [RVM](https://rvm.io/), which allows you to have different Ruby versions for different projects/directories on your machine. With RVM install you do the following: `rvm install X.X.X`
  `rvm use X.X.X`
  _(where X.X.X is the version quoted in the error message)_

## "Help! I've tried nothing and I'm all out of ideas."

- Try `yarn clean-caches`. If it's still not working, you can try deleting `node_modules` and running `yarn install`.

## `Watchman crawl failed`

Seems like Watchman wants to be uninstalled and reinstalled, try the following:

```
brew uninstall watchman
brew install watchman
watchman shutdown-server  # (just in case it's running)
watchman watch-del-all
yarn start --reset-cache
```

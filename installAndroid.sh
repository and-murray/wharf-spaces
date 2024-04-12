#!/bin/bash -i
#using shebang with -i to enable interactive mode (auto load .bashrc)

set -e #stop immediately if any error happens

# Import Azul’s public key
curl -s https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg
echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" | tee /etc/apt/sources.list.d/zulu.list

# Install Open JDK
apt-get update
apt-get install zulu17-jdk -y
java -version
JAVA_HOME="/usr/lib/jvm/zulu17-ca-amd64"

# Install SDK Manager
ANDROID_SDK_TOOLS=11076708
ANDROID_COMPILE_SDK=34
ANDROID_BUILD_TOOLS="34.0.0"

# you can find this file at https://developer.android.com/studio/index.html#downloads - section command line only
wget --quiet --output-document=android-sdk.zip https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_TOOLS}_latest.zip
unzip -d android-sdk-linux android-sdk.zip
export ANDROID_HOME=$PWD/android-sdk-linux
echo y | android-sdk-linux/cmdline-tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} "platforms;android-${ANDROID_COMPILE_SDK}" >/dev/null
echo y | android-sdk-linux/cmdline-tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} "platform-tools" >/dev/null
echo y | android-sdk-linux/cmdline-tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} "build-tools;${ANDROID_BUILD_TOOLS}" >/dev/null

export PATH=$PATH:$PWD/android-sdk-linux/platform-tools/
set +o pipefail
yes | android-sdk-linux/cmdline-tools/bin/sdkmanager  --sdk_root=${ANDROID_HOME} --licenses
set -o pipefail

echo "INSTALL ANDROID SDK DONE!"
#!/bin/bash

if [ "$ENV" == "development" ]
then
  echo 'Setting Dev Env'
  export GOOGLE_APPLICATION_CREDENTIALS="$CI_PROJECT_DIR/murray-apps-dev-firebase-adminsdk-57gqb-148f1fe61f.json"
  yarn firebase use development
elif [ "$ENV" == "production" ]
then
  echo 'Setting Prod Env'
  export GOOGLE_APPLICATION_CREDENTIALS="$CI_PROJECT_DIR/murray-apps-firebase-adminsdk-f378n-6ee50c3655.json"
  yarn firebase use production
fi
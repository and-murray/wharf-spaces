#!/bin/bash

if [ "$ENV" == "development" ]
then
  echo 'Setting Dev Env'
  export GOOGLE_APPLICATION_CREDENTIALS="./dev-admin-sdk.json"
  yarn firebase use development
elif [ "$ENV" == "production" ]
then
  echo 'Setting Prod Env'
  export GOOGLE_APPLICATION_CREDENTIALS="./prod-admin-sdk.json"
  yarn firebase use production
fi
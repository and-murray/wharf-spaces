#!/bin/bash

if [ "$ENV" == "undefined" ]
then
    echo 'Setting environment based off branch'
    if [ "$CI_COMMIT_BRANCH" == "develop" ]
    then
        echo 'Setting environment to development'
        export ENV="development"
    elif [ "$CI_COMMIT_BRANCH" == "main" ] || [[ "$CI_COMMIT_BRANCH" == "release/"* ]]
    then
        export ENV="production"
        echo 'Setting environment to production'
    fi
elif [ "$ENV" == "production" ]
then
    echo 'Checking we are on main or release branch'
    if [ "$CI_COMMIT_BRANCH" == "main" ] || [[ "$CI_COMMIT_BRANCH" == "release/"* ]]
    then
        echo 'All is good!'
    else 
        echo 'You must be on the either the main or release branch to deploy to production'
        exit 1
    fi
fi
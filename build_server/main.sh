#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"
export GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

# Function to clone repository
clone_repository() {
    if [ "$IS_PRIVATE_REPO" = "true" ] && [ -n "$GITHUB_ACCESS_TOKEN" ]; then
        echo "Cloning private repository with authentication..."
        # Extract repo info from URL
        REPO_URL_WITHOUT_PROTOCOL=${GIT_REPOSITORY__URL#https://}
        AUTHENTICATED_URL="https://${GITHUB_ACCESS_TOKEN}@${REPO_URL_WITHOUT_PROTOCOL}"
        
        git clone --branch "$GITHUB_BRANCH" "$AUTHENTICATED_URL" /home/app/output
    else
        echo "Cloning public repository..."
        git clone --branch "$GITHUB_BRANCH" "$GIT_REPOSITORY__URL" /home/app/output
    fi
}

# Clone the repository
clone_repository

# Check if clone was successful
if [ $? -ne 0 ]; then
    echo "Failed to clone repository"
    exit 1
fi

# Execute the build script
exec node script.js
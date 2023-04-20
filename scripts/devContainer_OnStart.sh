#!/bin/bash
set -euo pipefail

# This script is executed from the root of the repository.
npm install --prefix=banking_app


# Create the JWT issuer config files for (Test - Microsoft Azure Identity Provider).
# CJTA: Commented from original samples dir. But, not sure if we may need JWT authn later
# npm run create-jwt-config --prefix=data-reconciliation-app

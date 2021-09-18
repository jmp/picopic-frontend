# picopic-frontend

[![build](https://github.com/jmp/picopic-frontend/actions/workflows/build.yml/badge.svg)](https://github.com/jmp/picopic-frontend/actions/workflows/build.yml)
[![e2e-tests](https://github.com/jmp/picopic-e2e-tests/actions/workflows/e2e-tests.yml/badge.svg?event=workflow_dispatch)](https://github.com/jmp/picopic-e2e-tests/actions/workflows/e2e-tests.yml)
[![codecov](https://codecov.io/gh/jmp/picopic-frontend/branch/master/graph/badge.svg?token=C8PJPMM1S2)](https://codecov.io/gh/jmp/picopic-frontend)

React frontend for [Picopic][1], written in TypeScript.

This is a simple website that interacts with the Picopic backend.
It can be deployed basically anywhere as a static website.
Currently it is deployed to an AWS S3 bucket. The infrastructure
for that lives in the [picopic-frontend-infrastructure][2] project.

[1]: https://github.com/jmp/picopic
[2]: https://github.com/jmp/picopic-frontend-infrastructure
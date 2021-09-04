#!/bin/sh

BUILD_DIR=./build

if ! command -v aws > /dev/null; then
  >&2 echo "AWS Command Line Interface is not installed."
  exit 1
fi

if [ -z "${S3_BUCKET_NAME}" ]; then
  >&2 echo "S3_BUCKET_NAME is not defined."
  exit 1
fi

if [ ! -d "${BUILD_DIR}" ]; then
  >&2 echo "The build directory ${BUILD_DIR} does not exist."
  exit 1
fi

aws s3 sync ${BUILD_DIR} "s3://${S3_BUCKET_NAME}" --delete

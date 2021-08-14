#Variables

REPOSITORY = gcr.io/codeconomy-images

# Directory that this Makefile is in.
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
project_path := $(dir $(mkfile_path))
server_tag = $(REPOSITORY)/codeconomy-server:latest
root_path = $(realpath $(project_path)/..)

#Targets

# build the nodejs-simple binary
build:
	cd $(root_path) && docker build -f $(project_path)/Dockerfile --tag=$(server_tag) .

run:
	docker run --network=host $(server_tag) $(args)

# check if hosted on Google Cloud Registry
gcr-check:
	gcloud container images describe $(server_tag)

#output the tag for this image
echo-image-tag:
	@echo $(server_tag)
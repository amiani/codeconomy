cd config
make build
docker push gcr.io/codeconomy0/codeconomy-server:latest
gcloud compute ssh codeconomy-vm --zone us-east1-b --command 'docker system prune -f -a'
gcloud compute instances update-container codeconomy-vm --zone us-east1-b --container-image gcr.io/codeconomy0/codeconomy-server:latest
The factor-analysis-exercise-service is used for creating survey exercises.

## Using the service for creating survey exercises

Please visit the user manual page [placeholder]

## Development

Run `npm ci` in the repo root

Run the development server with `npm run dev` the server is running on `localhost:3008`

## Expose the service to locally running secret-project minikube cluster

using [ktunnel](https://github.com/omrikiei/ktunnel). Allows you to test exercises that actually need the database, such as testing the `global variables`.

Run `bin/ktunnel` from repo root.

The adress to use in minikube is:

`http://factorial-analysis.default.svc.cluster.local:80/api/service-info`

When stopping the cluster, the best is to stop the ktunnel exposure before killing the minikube cluster.

If the service is active when minikube is stopped remember to either delete the service from the cluster (see commands in the bin/ktunnel [file](./bin/ktunnel)) or to update the name of the service (factorial-analysis2 for example) which will again affect the local cluster-adress.

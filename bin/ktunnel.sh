#!/bin/bash
set -euo pipefail

ktunnel expose factorial-analysis 80:3008

#internal_url: http://factorial-analysis.default.svc.cluster.local:80/api/service-info

// SLA thresholds and metric-role mapping used in browser calculation
const SLA_THRESHOLDS = {
  api_gateway: { uptimeTarget: 99.95, creditTiers: [ { min: 99.0, max: 99.95, credit: 10 }, { min: 95.0, max: 99.0, credit: 25 }, { min: 0, max: 95.0, credit: 100 } ] },
  alb_nlb:      { uptimeTarget: 99.99, creditTiers: [ { min: 99.0, max: 99.99, credit: 10 }, { min: 95.0, max: 99.0, credit: 30 }, { min: 0, max: 95.0, credit: 100 } ] },
  lambda:       { uptimeTarget: 99.95, creditTiers: [ { min: 99.0, max: 99.95, credit: 10 }, { min: 95.0, max: 99.0, credit: 25 }, { min: 0, max: 95.0, credit: 100 } ] },
  s3:           { uptimeTarget: 99.9,  creditTiers: [ { min: 99.0, max: 99.9,  credit: 10 }, { min: 98.0, max: 99.0, credit: 25 }, { min: 0, max: 98.0, credit: 100 } ] },
  dynamodb:     { uptimeTarget: 99.99, creditTiers: [ { min: 99.0, max: 99.99, credit: 10 }, { min: 95.0, max: 99.0, credit: 25 }, { min: 0, max: 95.0, credit: 100 } ] },
  cloudfront:   { uptimeTarget: 99.9,  creditTiers: [ { min: 99.0, max: 99.9,  credit: 10 }, { min: 95.0, max: 99.0, credit: 25 }, { min: 0, max: 95.0, credit: 100 } ] }
};

const METRIC_ROLE_MAP = {
  "AWS/ApplicationELB": {
    "RequestCount": "total",
    "HTTPCode_ELB_5XX_Count": "error"
  },
  "AWS/ApiGateway": {
    "Count": "total",
    "5XXError": "error"
  },
  "AWS/Lambda": {
    "Invocations": "total",
    "Errors": "error"
  },
  "AWS/S3": {
    "AllRequests": "total",
    "4xxErrors": "error",
    "5xxErrors": "error"
  },
  "AWS/DynamoDB": {
    "SuccessfulRequestLatency": "total",
    "SystemErrors": "error"
  },
  "AWS/CloudFront": {
    "Requests": "total",
    "5xxErrorRate": "error"
  }
}; 

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SLA_THRESHOLDS, METRIC_ROLE_MAP };
}

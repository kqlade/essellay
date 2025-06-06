const test = require('node:test');
const assert = require('node:assert/strict');

// require the browser script under a fake window object
global.window = {};
// load data constants and expose to globals for the script under test
const { SLA_THRESHOLDS, METRIC_ROLE_MAP } = require('../js/sla_data.js');
global.SLA_THRESHOLDS = SLA_THRESHOLDS;
global.METRIC_ROLE_MAP = METRIC_ROLE_MAP;
const {
  parseCloudWatchCsv,
  availabilityFromBlocks,
  creditPercent
} = require('../js/sla_calc_browser.js');

test('parseCloudWatchCsv splits CSV into blocks', () => {
  const csv = `MetricName: RequestCount\nNamespace: AWS/ApplicationELB\nStatistic: Sum\nTimestamp,Sum\n2023-01-01 00:00:00,10\n2023-01-01 01:00:00,20\nMetricName: HTTPCode_ELB_5XX_Count\nNamespace: AWS/ApplicationELB\nStatistic: Sum\nTimestamp,Sum\n2023-01-01 00:00:00,1\n2023-01-01 01:00:00,2\n`;

  const blocks = parseCloudWatchCsv(csv);
  assert.deepStrictEqual(blocks, [
    {
      meta: {
        MetricName: 'RequestCount',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Sum'
      },
      data: 'Timestamp,Sum\n2023-01-01 00:00:00,10\n2023-01-01 01:00:00,20'
    },
    {
      meta: {
        MetricName: 'HTTPCode_ELB_5XX_Count',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Sum'
      },
      data: 'Timestamp,Sum\n2023-01-01 00:00:00,1\n2023-01-01 01:00:00,2\n'
    }
  ]);
});

test('availabilityFromBlocks computes totals and errors', () => {
  const blocks = [
    {
      meta: {
        MetricName: 'RequestCount',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Sum'
      },
      data: 'Timestamp,Sum\n2023-01-01 00:00:00,10\n2023-01-01 01:00:00,20'
    },
    {
      meta: {
        MetricName: 'HTTPCode_ELB_5XX_Count',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Sum'
      },
      data: 'Timestamp,Sum\n2023-01-01 00:00:00,1\n2023-01-01 01:00:00,2'
    }
  ];
  const { availability, total, errors } = availabilityFromBlocks(blocks);
  assert.equal(total, 30);
  assert.equal(errors, 3);
  assert(Math.abs(availability - 90) < 0.0001);
});

test('creditPercent selects correct tier', () => {
  assert.equal(creditPercent('alb_nlb', 99.5), 10);
  assert.equal(creditPercent('alb_nlb', 98.5), 30);
});

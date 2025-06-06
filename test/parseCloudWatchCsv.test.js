const test = require('node:test');
const assert = require('node:assert/strict');

// require the browser script under a fake window object
global.window = {};
const { parseCloudWatchCsv } = require('../js/sla_calc_browser.js');

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

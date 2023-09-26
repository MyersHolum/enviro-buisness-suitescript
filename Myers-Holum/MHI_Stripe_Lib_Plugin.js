/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */

define(['N/record', 'N/https', 'N/search', 'N/runtime'], (record, https, search, runtime) => {
  const BASE_DOMAIN = 'https://api.stripe.com/';
  const greatOrEqlString = '[gte]';
  const lessThanString = '[lt]';

  const camelToSnakeCase = (str) => str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

  const createApiRequest = (params, type, endpoint, options) => {
    const script = runtime.getCurrentScript();
    const { connectedAccount, subsidiary } = options;
    const STRIPE_API_KEY = subsidiary
      ? retrieveApiKey(subsidiary)
      : script.getParameter('custscript_stripe_api_key');

    if (STRIPE_API_KEY) {
      const headers = { Authorization: `Bearer ${STRIPE_API_KEY}` };

      if (connectedAccount) {
        headers['Stripe-Account'] = connectedAccount;
      }

      const keys = Object.keys(params);
      let url = BASE_DOMAIN + endpoint;
      let response;

      if (type === 'list') {
        url = formatParameters(url, params, keys);
        response = https.get({
          url,
          headers
        });
      } else if (type === 'create') {
        url = formatParameters(url, params, keys);
        response = https.post({
          url,
          headers
        });
      } else if (type === 'update') {
        url += params.id;
        url = formatParameters(url, params, keys);
        response = https.post({
          url,
          headers
        });
      } else if (type === 'get') {
        url += params.id;
        response = https.get({
          url,
          headers
        });
      } else if (type === 'delete') {
        url += params.id;
        response = https.delete({
          url,
          headers
        });
      } else if (type === 'finalize') {
        url += `${params.id}/finalize`;

        if (params.auto_advance) {
          url += `?auto_advance=${params.auto_advance}`;
        }

        response = https.post({
          url,
          headers
        });
      } else if (type === 'void') {
        url += `${params.id}/void`;
        response = https.post({
          url,
          headers
        });
      } else if (type === 'list_balance') {
        url += `${params.id}/balance_transactions`;
        response = https.get({
          url,
          headers
        });
      }

      return JSON.parse(response.body);
    }

    return false;
  };

  const formatParameters = (url, params, keys) => {
    let newUrl = url;
    let hasAdded = false;

    keys.forEach((key, index) => {
      if (key != 'id') {
        let formattedKey;

        if (key === 'created') {
          formattedKey = `${key}${greatOrEqlString}`;
        } else if (key === 'lessThan') {
          formattedKey = `created${lessThanString}`;
        } else {
          formattedKey = camelToSnakeCase(key);
        }

        if (params[key]) {
          newUrl += index === 0 || !hasAdded ? '?' : '&';
        }

        if (params[key]) {
          newUrl += `${formattedKey}=${params[key]}`;
          hasAdded = true;
        }
      }
    });

    return newUrl;
  };

  const getUnixTime = (time) => {
    const today = new Date();
    let date = today;

    if (time == 'today') {
      return parseInt((date.getTime() / 1000).toFixed(0), 10);
    }

    if (time == 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday;
    } else {
      date = time;
    }

    return parseInt((date.getTime() / 1000).toFixed(0), 10);
  };

  const getUTCTime = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() / 60;
    const hours = today.getHours();

    today.setHours(hours + offset);
    today.setMinutes(0);
    today.setSeconds(0);

    return today;
  };

  const listAllResults = (globalParams, globalArray, endpoint) => {
    const resultArray = globalArray;
    const {
      id, limit, created, lessThan, email, type, status, account, isBalance, subsidiary, endingBefore
    } = globalParams;
    let { startingAfter } = globalParams;
    let shouldContinue = true;

    const upperParams = {
      limit,
      created,
      lessThan,
      email,
      type,
      status,
      endingBefore,
      startingAfter,
      id
    };

    const iterateThroughPages = (params, resultArr) => {
      let allResults = resultArr;
      const options = { subsidiary, connectedAccount: account };
      const reqType = isBalance ? 'list_balance' : 'list';

      while (shouldContinue) {
        const results = createApiRequest(params, reqType, endpoint, options);

        if (results && results.data) {
          for (let i = 0; i < results.data.length; i += 1) {
            const result = results.data[i];
            allResults.push(result);
          }

          if (results.data.length < 100) {
            shouldContinue = false;
          } else {
            startingAfter = results.data[results.data.length - 1].id;
            const newParams = {
              limit, startingAfter, status, created, lessThan, type
            };
            allResults = iterateThroughPages(newParams, allResults);
          }
        } else {
          shouldContinue = false;
        }
      }

      return allResults;
    };

    return iterateThroughPages(upperParams, resultArray);
  };

  const retrieveApiKey = (subsidiary) => {
    const data = search.lookupFields({
      type: search.Type.SUBSIDIARY,
      id: subsidiary,
      columns: ['custrecord_stripe_api_key']
    });
    return data.custrecord_stripe_api_key;
  };

  const urlFormat = (str) => (str ? str.toString().replace(/[|&;$%@"<>()+,]/g, '') : '');

  return {
    camelToSnakeCase,
    createApiRequest,
    getUnixTime,
    getUTCTime,
    listAllResults,
    retrieveApiKey,
    urlFormat
  };
});

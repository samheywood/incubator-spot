const Base64 = require('js-base64').Base64;

const ID_REPLACE = '=';
const ID_REPLACE_REGEX = new RegExp(`[${ID_REPLACE}]`, 'g');
const ID_REPLACEMENT = '_';
const ID_REPLACEMENT_REGEX = new RegExp(`[${ID_REPLACEMENT}]`, 'g');

var SpotUtils = {
  IP_V4_REGEX: /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/,
  CSS_RISK_CLASSES: {'3': 'danger', '2': 'warning', '1': 'info', '0': 'default', '-1': 'default'},
  getCurrentDate: function (name)
  {
    // Look for a date on location's hash, default to today
    var date;

    date = SpotUtils.getUrlParam(name || 'date');

    if (date)
    {
      return date;
    }
    else
    {
        return SpotUtils.getDateString(new Date());
    }
  },
  getDateString: function (date)
  {
        return date.toISOString().substr(0, 10);
  },
  getCurrentFilter: function ()
  {
    // Look for a date on location's hash, default to today
    return SpotUtils.getUrlParam('filter');
  },
  getUrlParam: function (name, defaultValue)
  {
    // Look for a date on location's hash, default to today
    var matches;

    matches = new RegExp(name + '=([^|]+)').exec(location.hash);
    if (matches)
    {
      // Get capturing group
      return matches[1];
    }

    // Filter is not present
    return defaultValue || null;
  },
  setUrlParam: function (name, value) {
    var regex, hash, replacement, matches;

    regex = new RegExp('((?:#|\\|)' + name + '=)[^|]+');
    hash = window.location.hash;

    matches = regex.exec(hash);

    if (matches) {
      replacement = value ? (matches[1]  + value) : '';
      hash = hash.replace(regex, replacement);
    }
    else if (value)
    {
      hash = hash + (hash.length>1?'|':'') + name + '=' + value;
    }

    window.location.hash = hash;
  },

  parseReputation: function (rawReps) {
    var reps;

    if (!rawReps) return [];

    rawReps =  rawReps.split('::');
    reps = {};

    rawReps.forEach(function (serviceInfo) {
      var info;

      info = serviceInfo.split(':'); // SERVICE:SERVICE_REPUTATION:SPOT_REPUTATION:SERVICE_CATEGORIES

      reps[info[0]] = {
        'text': info[1],
        'value': +info[2],
        'cssClass': SpotUtils.CSS_RISK_CLASSES[info[2]] || SpotUtils.CSS_RISK_CLASSES[0],
        'categories': info.length<4 ? null :info[3].split(';').map(category => {
          category = category.split('|');

          return {
            name: category[0],
            group: category[1]
          };
        })
      };
    });

    return reps;
  },
  getHighestReputation: function (reps) {
    if (!reps) return -1;

    reps = typeof reps == 'string' ? SpotUtils.parseReputation(reps) : reps;

    return Object.keys(reps).reduce(function (hr, serviceName) {
      return Math.max(hr, reps[serviceName].value);
    }, -1);
  },
  encodeId(id) {
      return Base64.encode(id).replace(ID_REPLACE_REGEX, ID_REPLACEMENT);
  },
  decodeId(id) {
      return Base64.decode(id.replace(ID_REPLACEMENT_REGEX, ID_REPLACE));
  }
};

module.exports = SpotUtils;

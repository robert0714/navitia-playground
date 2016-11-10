// Copyright (c) 2016 CanalTP
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

// fake includes
var summary;
var response;

var utils = {};

utils.isDatetimeType = function(str) {
    return $.inArray(str, ['since', 'until']) !== -1 || str.match(/datetime$/);
};

utils.htmlEncode = function(value) {
    return $('<div/>').text(value).html();
};

utils.durationToString = function(duration) {
    var res = '';
    var seconds = duration % 60;
    var minutes = Math.floor(duration / 60) % 60;
    var hours = Math.floor(duration / (60 * 60)) % 24;
    var days = Math.floor(duration / (24 * 60 * 60));

    if (days !== 0) { res += sprintf('%sd', days); }
    if (hours !== 0) { res += sprintf('%sh', hours); }
    if (minutes !== 0) { res += sprintf('%smin', minutes); }
    if (seconds !== 0) { res += sprintf('%ss', seconds); }

    if (! res) {
        return '0s';
    } else {
        return res;
    }
};

utils.isTemplate = function(str) {
    return str.slice(0, 1) === '{' && str.slice(-1) === '}';
};

utils.flatMap = function(array, f) {
    var result = [];

    array.forEach(function(obj, i, array) {
        result = result.concat(f(obj, i, array));
    });
    return result;
};

$.notify.addStyle('navitia', {
    html: '<div class="ui-widget"><span data-notify-html="text"></span></div>',
    classes: {
        error: {
            'color': '#B94A48',
            'background-color': '#F2DEDE',
            'border-color': '#EED3D7',
        },
        success: {
            'color': '#468847',
            'background-color': '#DFF0D8',
            'border-color': '#D6E9C6',
        },
        info: {
            'color': '#3A87AD',
            'background-color': '#D9EDF7',
            'border-color': '#BCE8F1',
        },
        warn: {
            'color': '#C09853',
            'background-color': '#FCF8E3',
            'border-color': '#FBEED5',
        }
    }
});

utils.notifyOnError = function(typeError, xhr, status, error) {
    if (xhr.status === 401) {
        $('#token').addClass('templateInput');
    }
    var message;
    if (xhr.readyState === 0) {
        message = $('<span>').text('network error');
    } else if (xhr.responseJSON) {
        message = $(summary.run(new response.Context(xhr.responseJSON), 'response', xhr.responseJSON));
    } else {
        message = $('<span>').text(status);
    }
    if (error) {
        message.append('<br>Error: ').append(error);
    }
    $.notify({
        text: $('<span/>').text(sprintf('%s error: ', typeError)).append(message)
    }, {
        position: 'right bottom',
        style: 'navitia',
    });
};

utils.notifyWarn = function(message) {
    $.notify({
        text: message
    }, {
        position: 'right bottom',
        className: 'warn',
        style: 'navitia',
    });
};

utils.getType = function(key) {
    if (!key || typeof key !== 'string') {
        return null;
    }
    // hardcoded cases:
    switch (key) {
    case 'places_nearby': return 'place';
    case 'addresses': return 'address';
    case 'from': return 'place';
    case 'to': return 'place';
    }
    // generic plural
    if (key.slice(-1) === 's') { return key.slice(0, -1); }

    // just the key
    return key;
};

utils.getTextColor = function(json) {
    function _toNum(c, i) { return +('0x' + c.slice(i, i + 2)); }

    if (json.text_color) {
        return '#' + json.text_color;
    }
    if (json.color) {
        var c = json.color;
        var grey = 0.21 * _toNum(c, 0) + 0.72 * _toNum(c, 2) + 0.07 * _toNum(c, 4);
        if (grey < 128) {
            return 'white';
        }
    }
    return 'black';
};

utils.computeColor = function(ratio) {
    var r = 255;
    var g = 255;
    if (ratio < 1/2) {
        r = Math.ceil(255 * ratio * 2);
    } else {
        g = Math.ceil(255 * (1 - ratio) * 2);
    }
    return {red: r, green: g, blue: 0};
};

utils.findColor = function(ratio) {
    var c = utils.computeColor(ratio);
    return sprintf('#%02x%02x%02x', c.red, c.green, c.blue);
};

utils.manageToken = function(token) {
  return token ? { Authorization: 'Basic ' + btoa(token) } : {};
};

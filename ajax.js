/**
 * RuddyJS Extensions - Ajax
 *
 * @package     ruddy-ajax
 * @author      Gil Nimer <info@ruddymonkey.com>
 * @author      Nick Vlug <info@ruddy.nl>
 * @copyright   RuddyJS licensed under MIT. Copyright (c) 2017 Ruddy Monkey & ruddy.nl
 */

var $Export = $Export || require('ruddy').export;

$Export
    .module(
        'Ajax',
        '+ajax',
        'ruddy-ajax'
    )
    .include([
        'window',
        '@core',
        '@function',
        '@ruddy'
    ])
    .init(
        this,
        module,
        function (window, __core, $func, $r) {
            /**
             * Ajax request polyfill
             */
            if (!window.XMLHttpRequest) {
                var AXOs = ['MSXML2.XMLHTTP.6.0', 'MSXML3.XMLHTTP', 'Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.3.0'];
                var correctAXO = null;

                window.XMLHttpRequest = function () {
                    if (correctAXO === null) {
                        var request;
                        if (window.ActiveXObject) {
                            for (var i = 0, c = AXOs.length; i < c; i++) {
                                try {
                                    request = new window.ActiveXObject(AXOs[i]);
                                } catch (e) {
                                    request = false;
                                }
                                if (request) {
                                    correctAXO = AXOs[i];
                                    return request;
                                }
                            }
                        }
                        correctAXO = false;
                    }
                    if (correctAXO === false) {
                        throw new Error('XMLHttpRequest not supported in this browser');
                    }
                    return new window.Activerequestect(correctAXO);
                };

            }

            /**
             *
             * @type function
             * @param params
             * @returns {Window.XMLHttpRequest|XMLHttpRequest}
             */
            var Ajax = $func(function (params) {
                var
                    request     = new XMLHttpRequest(),
                    params      = params || {},
                    url         = params.url || ('param' in this) ? this.param['url'] : null,
                    method      = params.method || 'GET',
                    async       = params.async || true,
                    contentType = params.contentType || 'application/x-www-form-urlencoded',
                    mimeType    = params.mimeType || false,
                    success     = params.success || function () {},
                    error       = params.error || function () {},
                    data        = params.data || null,
                    query       = null;

                if (method == 'GET' && data) {
                    var id;
                    query = '?';

                    for (id in params.data) {
                        query += (id + '=' + params.data[id] + "&");
                    }

                    query.slice(0, -1);
                    url += query;
                }
                request.open(method, encodeURI(url), async);

                if (mimeType) {
                    request.overrideMimeType(mimeType)
                }

                request.setRequestHeader('Content-Type', contentType);
                request.onreadystatechange = function () {
                    var response = (request.response || request.responseText || null);

                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            success(request, response);
                        } else {
                            error(request, response);
                        }
                    }
                };

                request.send(data);
                return request;
            });

            /**
             *
             * @param params
             * @constructor
             */
            var Jsonp = function(params) {
                var script, element,
                    params          = params || {},
                    url             = params.url || ('param' in this) ? this.param['url'] : null,
                    callback        = params.callback || 'callback',
                    async           = params.async || true,
                    success         = params.success || function () {},
                    error           = params.timeout || function () {},
                    timeout         = params.timelimit || 10;

                var trigger = window.setTimeout(function(){
                    window[callback] = function(){};
                    error();
                }, timeout * 1000);

                window[callback] = function(data){
                    window.clearTimeout(trigger);
                    success(data, element);
                };

                script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = async;
                script.src = url;

                element = document.getElementsByTagName('head')[0].appendChild(script);
            };

            if(typeof $r !== 'undefined') {
                $r.assign('ajax', Ajax);
                $r.assign('jsonp', Jsonp);
            }

            return {
                ajax: Ajax,
                jsonp: Jsonp
            }
        });